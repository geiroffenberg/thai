#!/usr/bin/env python3
"""Split phrases_male.mp3 and phrases_female.mp3 into one file per phrase.

Output filenames are taken directly from thai_phrases.json (audio_file field)
and saved into audio/phrases/.

Usage:
  # Dry-run first — prints detected segments without writing files
  python3 tools/split_phrases_audio.py --dry-run

  # Write files
  python3 tools/split_phrases_audio.py

  # Tune silence detection if segment count is wrong
  python3 tools/split_phrases_audio.py --noise=-35dB --min-silence=0.5 --dry-run
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHRASES_JSON = ROOT / "thai_phrases.json"
PHRASES_DIR = ROOT / "audio" / "phrases"

# Source audio files
MALE_SRC = PHRASES_DIR / "phrases_male.mp3"
FEMALE_SRC = PHRASES_DIR / "phrases_female.mp3"

EXPECTED_COUNT = 100

# Silence detection defaults — tune with --noise and --min-silence if needed.
# Phrases have 1–10 s gaps so 0.5 s is a safe lower bound.
DEFAULT_NOISE = "-30dB"
DEFAULT_MIN_SILENCE = "0.5"   # seconds

# Audio padding around each detected speech region
LEAD_PAD = 0.05   # seconds before speech start
TAIL_PAD = 0.10   # seconds after speech end

# Discard segments shorter than this (catches false micro-detections)
MIN_SEGMENT = 0.3   # seconds

# Fade-in / fade-out to avoid click artifacts
FADE_IN = 0.010   # seconds
FADE_OUT = 0.025  # seconds


# ── helpers ──────────────────────────────────────────────────────────────────

def run(command: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(command, check=True, text=True, capture_output=True)


def get_duration(path: Path) -> float:
    out = run([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path),
    ]).stdout.strip()
    return float(out)


def detect_silences(path: Path, noise: str, min_silence: str) -> list[tuple[float, float]]:
    proc = subprocess.run(
        [
            "ffmpeg", "-v", "info", "-i", str(path),
            "-af", f"silencedetect=noise={noise}:d={min_silence}",
            "-f", "null", "-",
        ],
        check=True, text=True, capture_output=True,
    )
    starts, ends = [], []
    for line in proc.stderr.splitlines():
        if "silence_start:" in line:
            m = re.search(r"silence_start:\s*([0-9.]+)", line)
            if m:
                starts.append(float(m.group(1)))
        elif "silence_end:" in line:
            m = re.search(r"silence_end:\s*([0-9.]+)", line)
            if m:
                ends.append(float(m.group(1)))
    # Trim so lists are equal length (trailing silence may lack an end)
    count = min(len(starts), len(ends))
    return list(zip(starts[:count], ends[:count]))


def build_segments(
    total: float, silences: list[tuple[float, float]]
) -> list[tuple[float, float]]:
    """Return speech segments by inverting silence regions."""
    segments: list[tuple[float, float]] = []
    cursor = 0.0
    for s_start, s_end in silences:
        if s_start > cursor + MIN_SEGMENT:
            segments.append((cursor, s_start))
        cursor = max(cursor, s_end)
    if total > cursor + MIN_SEGMENT:
        segments.append((cursor, total))
    return segments


def export_clip(
    source: Path, start: float, end: float, dest: Path, total: float
) -> None:
    clip_start = max(0.0, start - LEAD_PAD)
    clip_end = min(total, end + TAIL_PAD)
    duration = clip_end - clip_start

    # Build audio filter: tiny fade-in and fade-out to kill click artifacts
    fade_out_start = max(0.0, duration - FADE_OUT)
    af = (
        f"afade=t=in:st=0:d={FADE_IN},"
        f"afade=t=out:st={fade_out_start:.4f}:d={FADE_OUT}"
    )

    dest.parent.mkdir(parents=True, exist_ok=True)
    # -ss before -i: input-side seek resets output timestamps to 0,
    # so afade st= values (relative to clip duration) are correct.
    # -to is then relative to the seek point (i.e., equals duration).
    run([
        "ffmpeg", "-y",
        "-ss", f"{clip_start:.4f}",
        "-i", str(source),
        "-to", f"{duration:.4f}",
        "-af", af,
        "-ac", "1",
        "-b:a", "96k",
        str(dest),
    ])


# ── main ─────────────────────────────────────────────────────────────────────

# Must match categoryOrder in phrases.js — this is the website display order
# and therefore the order in which the phrases were recorded.
CATEGORY_ORDER = [
    'greetings', 'essentials', 'dining', 'shopping', 'directions',
    'hotel_travel', 'communication', 'emergencies', 'social',
]


def load_phrases() -> tuple[list[str], list[str]]:
    """Return (male_filenames, female_filenames) in website display order.

    The audio was recorded left-to-right as the phrases appear on the website:
    category groups in CATEGORY_ORDER sequence, JSON order within each category.
    """
    data = json.loads(PHRASES_JSON.read_text(encoding="utf-8"))
    # Group by category, preserving JSON order within each group
    grouped: dict = {}
    for p in data:
        grouped.setdefault(p["category"], []).append(p)
    # Flatten in website display order
    ordered = []
    for cat in CATEGORY_ORDER:
        ordered.extend(grouped.get(cat, []))
    # Append any uncategorised phrases at the end
    for cat, phrases in grouped.items():
        if cat not in CATEGORY_ORDER:
            ordered.extend(phrases)
    male_files = [p["male"]["audio_file"] for p in ordered]
    female_files = [p["female"]["audio_file"] for p in ordered]
    return male_files, female_files


def process_source(
    source: Path,
    filenames: list[str],
    noise: str,
    min_silence: str,
    dry_run: bool,
    gender: str,
) -> bool:
    """Detect, validate, and optionally export all clips for one source file."""
    print(f"\n{'='*60}")
    print(f"  Source : {source.name}")
    print(f"  Noise  : {noise}   Min-silence: {min_silence}s")
    print(f"{'='*60}")

    if not source.exists():
        print(f"  ERROR: file not found: {source}", file=sys.stderr)
        return False

    total = get_duration(source)
    print(f"  Duration: {total:.2f}s")

    print("  Detecting silences …", end="", flush=True)
    silences = detect_silences(source, noise, min_silence)
    print(f" {len(silences)} silence regions found")

    segments = build_segments(total, silences)
    print(f"  Segments detected: {len(segments)}  (expected {EXPECTED_COUNT})")

    if len(segments) != EXPECTED_COUNT:
        print(
            f"\n  ⚠  Segment count mismatch! Got {len(segments)}, need {EXPECTED_COUNT}.\n"
            "  Try adjusting --noise (e.g. -25dB or -35dB) or --min-silence.\n"
            "  Segment list (start → end, duration):"
        )
        for i, (s, e) in enumerate(segments, 1):
            print(f"    {i:3d}: {s:8.3f}s → {e:8.3f}s  ({e-s:.3f}s)")
        return False

    # Print preview
    print("\n  Segment preview (first 5 and last 5):")
    preview_idx = list(range(min(5, len(segments)))) + (
        list(range(max(5, len(segments) - 5), len(segments)))
        if len(segments) > 5 else []
    )
    seen = set()
    for i in preview_idx:
        if i in seen:
            continue
        seen.add(i)
        s, e = segments[i]
        fname = filenames[i]
        print(f"    [{i+1:3d}] {s:8.3f}s → {e:8.3f}s  ({e-s:.3f}s)  → {fname}")

    if dry_run:
        print("\n  DRY RUN — no files written.")
        return True

    print(f"\n  Writing {len(segments)} files to {PHRASES_DIR} …")
    for i, (s, e) in enumerate(segments):
        dest = PHRASES_DIR / filenames[i]
        export_clip(source, s, e, dest, total)
        print(f"    [{i+1:3d}/{EXPECTED_COUNT}] {filenames[i]}", end="\r", flush=True)

    print(f"\n  ✓ Done — {len(segments)} {gender} clips written.")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Split Thai phrase audio files.")
    parser.add_argument("--dry-run", action="store_true",
                        help="Detect segments without writing files")
    parser.add_argument("--noise", default=DEFAULT_NOISE,
                        help=f"Silence threshold (default: {DEFAULT_NOISE})")
    parser.add_argument("--min-silence", default=DEFAULT_MIN_SILENCE,
                        help=f"Min silence duration in seconds (default: {DEFAULT_MIN_SILENCE})")
    parser.add_argument("--gender", choices=["male", "female", "both"], default="both",
                        help="Which source file(s) to process (default: both)")
    args = parser.parse_args()

    male_files, female_files = load_phrases()

    ok = True
    if args.gender in ("male", "both"):
        ok &= process_source(
            MALE_SRC, male_files, args.noise, args.min_silence, args.dry_run, "male"
        )
    if args.gender in ("female", "both"):
        ok &= process_source(
            FEMALE_SRC, female_files, args.noise, args.min_silence, args.dry_run, "female"
        )

    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
