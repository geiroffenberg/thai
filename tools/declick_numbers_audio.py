#!/usr/bin/env python3
"""Apply tiny fade-in/fade-out to MP3s in audio/numbers to reduce click artifacts.

Usage:
  python3 tools/declick_numbers_audio.py
    python3 tools/declick_numbers_audio.py --fade-in 0.008 --fade-out 0.018 --tail-pad 0.015
  python3 tools/declick_numbers_audio.py --backup-ext .bak
"""

import argparse
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NUMBERS_DIR = ROOT / "audio" / "numbers"


def run(command: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(command, check=True, text=True, capture_output=True)


def get_duration(file_path: Path) -> float:
    out = run([
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(file_path),
    ]).stdout.strip()
    return float(out)


def process_file(
    file_path: Path,
    fade_in: float,
    fade_out: float,
    tail_pad: float,
    backup_ext: str | None,
) -> None:
    duration = get_duration(file_path)
    if duration <= 0.03:
        print(f"skip {file_path.name}: too short ({duration:.3f}s)")
        return

    effective_out = min(fade_out, max(0.003, duration * 0.2))
    out_start = max(0.0, duration - effective_out)

    temp_path = file_path.with_suffix(file_path.suffix + ".tmp.mp3")

    out_duration = duration + max(0.0, tail_pad)
    audio_filter = (
        f"afade=t=in:st=0:d={fade_in:.4f},"
        f"afade=t=out:st={out_start:.4f}:d={effective_out:.4f},"
        f"apad=pad_dur={max(0.0, tail_pad):.4f},"
        f"atrim=0:{out_duration:.4f}"
    )

    run([
        "ffmpeg",
        "-y",
        "-i",
        str(file_path),
        "-af",
        audio_filter,
        "-ac",
        "1",
        "-b:a",
        "96k",
        str(temp_path),
    ])

    if backup_ext:
        backup_path = file_path.with_suffix(file_path.suffix + backup_ext)
        file_path.replace(backup_path)
    else:
        file_path.unlink()

    temp_path.replace(file_path)
    print(
        f"ok   {file_path.name}  (in={fade_in*1000:.0f}ms, out={effective_out*1000:.0f}ms, "
        f"tail={tail_pad*1000:.0f}ms)"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="De-click numbers MP3s with tiny fades")
    parser.add_argument("--fade-in", type=float, default=0.008, help="Fade-in duration in seconds")
    parser.add_argument("--fade-out", type=float, default=0.018, help="Fade-out duration in seconds")
    parser.add_argument("--tail-pad", type=float, default=0.015, help="Silence appended at end in seconds")
    parser.add_argument("--backup-ext", type=str, default="", help="Optional backup extension (e.g. .bak)")
    parser.add_argument("--include-source-tracks", action="store_true", help="Also process long source tracks")
    args = parser.parse_args()

    if not NUMBERS_DIR.exists():
        raise FileNotFoundError(f"Numbers folder not found: {NUMBERS_DIR}")

    mp3_files = sorted(NUMBERS_DIR.glob("*.mp3"))
    if not mp3_files:
        print("No mp3 files found.")
        return

    source_like = {
        "Thai_numbers 1-10.mp3",
        "ran_pan_moon_san_lan.mp3",
        "yisip_to_khaosip.mp3",
    }

    processed = 0
    skipped = 0

    for mp3 in mp3_files:
        if not args.include_source_tracks and mp3.name in source_like:
            print(f"skip {mp3.name}: source track")
            skipped += 1
            continue

        process_file(
            mp3,
            fade_in=max(0.001, args.fade_in),
            fade_out=max(0.001, args.fade_out),
            tail_pad=max(0.0, args.tail_pad),
            backup_ext=args.backup_ext if args.backup_ext else None,
        )
        processed += 1

    print(f"\nDone. Processed {processed} file(s), skipped {skipped}.")


if __name__ == "__main__":
    main()
