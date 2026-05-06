#!/usr/bin/env python3
"""Split Thai_numbers 1-10.mp3 into one file per spoken number.

Output files match the names expected by numbers.js:
  audio/numbers/01-neung.mp3  …  audio/numbers/10-sip.mp3
"""

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "audio" / "numbers" / "Thai_numbers 1-10.mp3"
OUTPUT_DIR = ROOT / "audio" / "numbers"

# Exactly 10 entries — must match the spoken order on the track.
NUMBERS = [
    ("01", "neung"),   # 1  หนึ่ง
    ("02", "song"),    # 2  สอง
    ("03", "saam"),    # 3  สาม
    ("04", "sii"),     # 4  สี่
    ("05", "haa"),     # 5  ห้า
    ("06", "hok"),     # 6  หก
    ("07", "jet"),     # 7  เจ็ด
    ("08", "paet"),    # 8  แปด
    ("09", "gao"),     # 9  เก้า
    ("10", "sip"),     # 10 สิบ
]

# Silence-detection tuning — chosen for this specific recording.
NOISE_THRESHOLD = "-30dB"
MIN_SILENCE_DURATION = "0.1"   # seconds; keeps tiny pauses from splitting a word
MIN_SEGMENT = 0.25             # seconds; discards false micro-segments

# Extra audio kept around each word so playback feels natural.
LEAD_PAD = 0.05   # seconds before detected speech start
TAIL_PAD = 0.08   # seconds after detected speech end


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

    print(f"Detected {len(segments)} speech segment(s) in {SOURCE.name} ({total:.2f}s)")

    if len(segments) != len(NUMBERS):
        for i, (s, e) in enumerate(segments, 1):
            print(f"  segment {i:>2}: {s:.3f} – {e:.3f}  ({e-s:.3f}s)")
        raise RuntimeError(
            f"Expected {len(NUMBERS)} segments, found {len(segments)}. "
            "Adjust MIN_SEGMENT or NOISE_THRESHOLD and re-run."
        )

    for (num, rom), (seg_start, seg_end) in zip(NUMBERS, segments):
        filename = f"{num}-{rom}.mp3"
        dest = OUTPUT_DIR / filename
        export_clip(SOURCE, seg_start, seg_end, dest, total)
        print(f"  {filename}  ({seg_start:.3f} – {seg_end:.3f})")

    print(f"\nDone — {len(NUMBERS)} files written to {OUTPUT_DIR.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
