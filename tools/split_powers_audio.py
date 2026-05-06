#!/usr/bin/env python3
"""Split ran_pan_moon_san_lan.mp3 into five Thai power-of-ten number files.

Output files match the names expected by numbers.js:
  audio/numbers/100-roi.mp3
  audio/numbers/1000-phan.mp3
  audio/numbers/10000-muen.mp3
  audio/numbers/100000-saen.mp3
  audio/numbers/1000000-laan.mp3
"""

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "audio" / "numbers" / "ran_pan_moon_san_lan.mp3"
OUTPUT_DIR = ROOT / "audio" / "numbers"

# Exactly 5 entries — must match the spoken order on the track.
POWERS = [
    ("100", "roi"),         # ร้อย
    ("1000", "phan"),       # พัน
    ("10000", "muen"),      # หมื่น
    ("100000", "saen"),     # แสน
    ("1000000", "laan"),    # ล้าน
]

# Silence-detection tuning.
NOISE_THRESHOLD = "-30dB"
MIN_SILENCE_DURATION = "0.1"
MIN_SEGMENT = 0.15   # shorter than regular words since these may be brief

# Extra audio around each word.
LEAD_PAD = 0.05
TAIL_PAD = 0.08

# Manual cut points to force splits where silence detection doesn't find natural breaks.
# Format: [time_in_seconds, ...] — insert a cut at this exact moment.
MANUAL_CUTS = []


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


def detect_silences(path: Path) -> list[tuple[float, float]]:
    proc = subprocess.run(
        [
            "ffmpeg", "-v", "info", "-i", str(path),
            "-af", f"silencedetect=noise={NOISE_THRESHOLD}:d={MIN_SILENCE_DURATION}",
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
    if len(starts) != len(ends):
        raise RuntimeError(f"Mismatched silence starts/ends ({len(starts)} vs {len(ends)})")
    return list(zip(starts, ends))


def build_segments(total: float, silences: list[tuple[float, float]]) -> list[tuple[float, float]]:
    """Return speech segments by inverting the silence regions."""
    segments: list[tuple[float, float]] = []
    cursor = 0.0
    for s_start, s_end in silences:
        if s_start > cursor + MIN_SEGMENT:
            segments.append((cursor, s_start))
        cursor = max(cursor, s_end)
    if total > cursor + MIN_SEGMENT:
        segments.append((cursor, total))
    return segments


def apply_manual_cuts(segments: list[tuple[float, float]]) -> list[tuple[float, float]]:
    """Insert additional cut points within existing segments."""
    updated = list(segments)
    for cut_time in sorted(MANUAL_CUTS):
        for index, (start, end) in enumerate(updated):
            if start + MIN_SEGMENT < cut_time < end - MIN_SEGMENT:
                updated[index:index + 1] = [(start, cut_time), (cut_time, end)]
                print(f"  Manual cut at {cut_time:.3f}s applied to segment {index + 1}")
                break
        else:
            raise RuntimeError(f"Manual cut {cut_time:.3f}s does not fall inside any detected segment")
    return updated


def export_clip(source: Path, start: float, end: float, dest: Path, total: float) -> None:
    clip_start = max(0.0, start - LEAD_PAD)
    clip_end = min(total, end + TAIL_PAD)
    run([
        "ffmpeg", "-y",
        "-i", str(source),
        "-ss", f"{clip_start:.3f}",
        "-to", f"{clip_end:.3f}",
        "-ac", "1",
        "-b:a", "96k",
        str(dest),
    ])


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Source not found: {SOURCE}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    total = get_duration(SOURCE)
    silences = detect_silences(SOURCE)
    segments = build_segments(total, silences)

    print(f"Detected {len(segments)} segment(s) in {SOURCE.name} ({total:.2f}s)")

    # Apply manual cuts if needed
    if MANUAL_CUTS:
        segments = apply_manual_cuts(segments)
        print(f"After manual cuts: {len(segments)} segment(s)")

    if len(segments) != len(POWERS):
        for i, (s, e) in enumerate(segments, 1):
            print(f"  segment {i:>2}: {s:.3f} – {e:.3f}  ({e-s:.3f}s)")
        raise RuntimeError(
            f"Expected {len(POWERS)} segments, found {len(segments)}. "
            "Adjust MIN_SEGMENT, NOISE_THRESHOLD, or MANUAL_CUTS and re-run."
        )

    for (digit, rom), (seg_start, seg_end) in zip(POWERS, segments):
        filename = f"{digit}-{rom}.mp3"
        dest = OUTPUT_DIR / filename
        export_clip(SOURCE, seg_start, seg_end, dest, total)
        print(f"  {filename}  ({seg_start:.3f} – {seg_end:.3f})")

    print(f"\nDone — {len(POWERS)} files written to {OUTPUT_DIR.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
