import os
import json
import re

def seconds_to_lrc(timestamp_sec, text):
    minutes = int(timestamp_sec // 60)
    seconds = int(timestamp_sec % 60)
    hundredths = int(round((timestamp_sec - int(timestamp_sec)) * 100))
    if hundredths >= 100:
        seconds += 1
        hundredths = 0
    if seconds >= 60:
        minutes += 1
        seconds = 0
    return f"[{minutes:02d}:{seconds:02d}.{hundredths:02d}] {text}"

# User provided exact timed lyrics list
timed_lyrics = [
    (0.00, "You're the moon that glows in the sky"),
    (4.50, "Lighting up the world when it's blue"),
    (9.10, "Stars they dance though late in the night"),
    (13.50, "Don't you know they dance just for you"),
    (36.10, "There you are above dark clouds"),
    (40.60, "Smiling at the world from afar"),
    (45.00, "With the stars you wander around"),
    (49.60, "Baby, follow you wherever you are"),
    (54.10, "Here I am, just another boy singing songs"),
    (59.30, "That others have sung"),
    (63.10, "Trying to find the words to employ to adore"),
    (68.50, "That goddess of love"),
    (71.80, "Oh, you got me in a daze, yeah"),
    (76.80, "No, it's not another phase"),
    (81.30, "You gave me one look and now I can't get my mind off of you"),
    (90.10, "And it's all because"),
    (92.30, "I see the galaxies when I look in your eyes"),
    (95.80, "And I can't speak, no, I can't speak at all"),
    (101.30, "I swear to Zeus you're Aphrodite in disguise"),
    (104.90, "Don't think that you can hide it from me"),
    (109.80, "Oh no, I never thought I'd get this close to someone so divine"),
    (114.20, "Oh, I can't breathe, no, I can't breathe at all"),
    (120.30, "Aphrodite, could you, could you please be mine? Oh"),
    (126.00, "Could you please be mine, oh mine?"),
    (148.00, "Here you are, I've waited so long"),
    (152.40, "Hoping you would sit down and stay"),
    (156.90, "'Cause with these stars I've been dancing along"),
    (160.80, "Like a fool, so you look my way"),
    (166.00, "You're the moon that glows in the sky"),
    (170.50, "Lighting up my world when it's blue"),
    (175.00, "And here I sing though late in the night"),
    (179.50, "Hoping that I sing just for you"),
    (183.70, "Oh, you got me in a daze, yeah"),
    (188.70, "No, it's not another phase"),
    (193.20, "You gave me one look and now I can't get my mind off of you"),
    (202.00, "And it's all because"),
    (204.20, "I see the galaxies when I look in your eyes"),
    (207.70, "And I can't speak, no, I can't speak at all"),
    (213.20, "I swear to Zeus you're Aphrodite in disguise"),
    (216.80, "Don't think that you can hide it from me"),
    (221.70, "Oh no, I never thought I'd get this close to someone so divine"),
    (226.10, "Oh, I can't breathe, no, I can't breathe at all"),
    (232.20, "Aphrodite, could you, could you please be mine? Oh"),
    (237.90, "Could you please be mine, oh mine?"),
    (242.40, "Could you please be mine, oh mine?")
]

def build_lrc_and_json():
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # 1. Generate LRC file content using seconds_to_lrc function
    lrc_lines = [seconds_to_lrc(ts, text) for ts, text in timed_lyrics]
    lrc_content = "\n".join(lrc_lines)

    lrc_file_path = os.path.join(base_dir, "aphrodite.lrc")
    with open(lrc_file_path, "w", encoding="utf-8") as f:
        f.write(lrc_content)

    print(f"[LRC Converter] Wrote standard LRC file to: {lrc_file_path}")
    print("\nFirst 6 LRC lines generated:")
    for line in lrc_lines[:6]:
        print(" ", line)

    # 2. Build JSON data with smooth end timestamps (holding line until next vocal start or max 6.5s)
    json_lyrics = []
    for i, (ts, text) in enumerate(timed_lyrics):
        if i < len(timed_lyrics) - 1:
            next_ts = timed_lyrics[i + 1][0]
            # If gap to next line is under 12 seconds, hold line until next line starts (-0.1s)
            if next_ts - ts <= 12.0:
                end_ts = round(next_ts - 0.1, 2)
            else:
                end_ts = round(ts + 6.5, 2)
        else:
            end_ts = round(ts + 6.0, 2)

        words = [w.strip("?,!.") for w in text.split() if w.strip("?,!.")]
        json_lyrics.append({
            "id": i + 1,
            "start": round(ts, 2),
            "end": round(end_ts, 2),
            "text": text,
            "words": words
        })

    json_file_path = os.path.join(base_dir, "lyrics.json")
    with open(json_file_path, "w", encoding="utf-8") as f:
        json.dump({"title": "Aphrodite", "artist": "The Ridleys", "lyrics": json_lyrics}, f, indent=2)

    print(f"\n[LRC Converter] Exported {len(json_lyrics)} lines to lyrics.json")

if __name__ == "__main__":
    build_lrc_and_json()
