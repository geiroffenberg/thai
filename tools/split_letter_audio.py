#!/usr/bin/env python3

import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ALPHABET_JS = ROOT / "alphabet.js"

TRACK_SPECS = [
    {
        "array_name": "consonants",
        "source": ROOT / "audio" / "thai language-001.mp3",
        "output_dir": ROOT / "audio" / "letters" / "consonants",
        "noise": "-30dB",
        "duration": "0.07",
        "min_segment": 0.06,
        "group": "consonants",
        "manual_cuts": [46.49],
    },
    {
        "array_name": "shortVowels",
        "source": ROOT / "audio" / "thai language-002.mp3",
        "output_dir": ROOT / "audio" / "letters" / "vowels-short",
        "noise": "-30dB",
        "duration": "0.05",
        "min_segment": 0.10,
        "group": "vowels-short",
        "manual_cuts": [],
    },
    {
        "array_name": "longVowels",
        "source": ROOT / "audio" / "thai language-003.mp3",
        "output_dir": ROOT / "audio" / "letters" / "vowels-long",
        "noise": "-30dB",
        "duration": "0.05",
        "min_segment": 0.10,
        "group": "vowels-long",
        "manual_cuts": [],
    },
    {
        "array_name": "specialVowels",
        "source": ROOT / "audio" / "thai language-004.mp3",
        "output_dir": ROOT / "audio" / "letters" / "vowels-special",
        "noise": "-30dB",
        "duration": "0.05",
        "min_segment": 0.10,
        "group": "vowels-special",
        "manual_cuts": [],
    },
]

LEAD_PAD = 0.02
TAIL_PAD = 0.05
MIN_SEGMENT = 0.10


def run(command):
    return subprocess.run(command, check=True, text=True, capture_output=True)


def load_alphabet_data():
    text = ALPHABET_JS.read_text(encoding="utf-8")
    result = {}
    for array_name in ["consonants", "shortVowels", "longVowels", "specialVowels"]:
        block_match = re.search(rf"const\s+{array_name}\s*=\s*\[(.*?)\];", text, re.S)
        if not block_match:
            raise RuntimeError(f"Could not find array {array_name} in alphabet.js")
        block = block_match.group(1)
        entries = re.findall(
            r"\{\s*symbol:\s*'([^']+)',\s*name:\s*'([^']+)',\s*thai:\s*'([^']+)'\s*\}",
            block,
        )
        result[array_name] = [
            {"symbol": symbol, "name": name, "thai": thai}
            for symbol, name, thai in entries
        ]
    return result


def slugify(text):
    cleaned = re.sub(r"[^a-z0-9]+", "-", text.lower())
    return cleaned.strip("-") or "clip"


def get_duration(file_path):
    output = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(file_path),
        ]
    ).stdout.strip()
    return float(output)


def detect_silences(file_path, noise, duration):
    proc = subprocess.run(
        [
            "ffmpeg",
            "-v",
            "info",
            "-i",
            str(file_path),
            "-af",
            f"silencedetect=noise={noise}:d={duration}",
            "-f",
            "null",
            "-",
        ],
        check=True,
        text=True,
        capture_output=True,
    )
    text = proc.stderr
    starts = []
    ends = []
    for line in text.splitlines():
        if "silence_start:" in line:
            match = re.search(r"silence_start:\s*([0-9.]+)", line)
            starts.append(float(match.group(1)) if match else 0.0)
        elif "silence_end:" in line:
            match = re.search(r"silence_end:\s*([0-9.]+)", line)
            if match:
                ends.append(float(match.group(1)))
    if len(starts) != len(ends):
        raise RuntimeError(f"Mismatched silence starts/ends for {file_path.name}")
    return list(zip(starts, ends))


def build_segments(duration, silences, min_segment):
    segments = []
    cursor = 0.0
    for silence_start, silence_end in silences:
        if silence_start > cursor + min_segment:
            segments.append((cursor, silence_start))
        cursor = max(cursor, silence_end)
    if duration > cursor + min_segment:
        segments.append((cursor, duration))
    return segments


def apply_manual_cuts(segments, manual_cuts):
    updated_segments = list(segments)
    for cut_time in sorted(manual_cuts):
        for index, (start, end) in enumerate(updated_segments):
            if start + MIN_SEGMENT < cut_time < end - MIN_SEGMENT:
                updated_segments[index:index + 1] = [(start, cut_time), (cut_time, end)]
                break
        else:
            raise RuntimeError(f"Manual cut {cut_time:.3f}s does not fall inside any detected segment")
    return updated_segments


def describe_segments(segments):
    return ", ".join(f"{index + 1}:{start:.2f}-{end:.2f}" for index, (start, end) in enumerate(segments[:12]))


def export_clip(source, segment, destination, total_duration):
    raw_start, raw_end = segment
    clip_start = max(0.0, raw_start - LEAD_PAD)
    clip_end = min(total_duration, raw_end + TAIL_PAD)
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(source),
            "-ss",
            f"{clip_start:.3f}",
            "-to",
            f"{clip_end:.3f}",
            "-ac",
            "1",
            "-b:a",
            "96k",
            str(destination),
        ]
    )


def main():
    alphabet_data = load_alphabet_data()
    manifest = []

    for spec in TRACK_SPECS:
        letters = alphabet_data[spec["array_name"]]
        spec["output_dir"].mkdir(parents=True, exist_ok=True)
        total_duration = get_duration(spec["source"])
        silences = detect_silences(spec["source"], spec["noise"], spec["duration"])
        min_segment = float(spec.get("min_segment", MIN_SEGMENT))
        segments = build_segments(total_duration, silences, min_segment)
        segments = apply_manual_cuts(segments, spec.get("manual_cuts", []))

        if len(segments) != len(letters):
            raise RuntimeError(
                f"{spec['source'].name}: expected {len(letters)} segments, found {len(segments)}. "
                f"First segments: {describe_segments(segments)}"
            )

        for index, (letter, segment) in enumerate(zip(letters, segments), start=1):
            base_slug = slugify(f"{letter['name']}-{letter['thai']}")
            filename = f"{index:02d}-{base_slug}.mp3"
            destination = spec["output_dir"] / filename
            export_clip(spec["source"], segment, destination, total_duration)
            manifest.append(
                {
                    "group": spec["group"],
                    "index": index,
                    "symbol": letter["symbol"],
                    "name": letter["name"],
                    "thai": letter["thai"],
                    "sourceTrack": spec["source"].name,
                    "file": str(destination.relative_to(ROOT)).replace("\\", "/"),
                }
            )

    manifest_path = ROOT / "audio" / "letters" / "manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(manifest)} clips to {manifest_path.parent}")


if __name__ == "__main__":
    main()