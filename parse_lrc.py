import os
import json
import re

lrc_raw = """
[00:00.00] You're the moon that glows in the sky
[00:04.50] Lighting up the world when it's blue
[00:09.10] Stars they dance though late in the night
[00:13.50] Don't you know they dance just for you
[00:18.00] 
[00:36.10] There you are above dark clouds
[00:40.60] Smiling at the world from afar
[00:45.00] With the stars you wander around
[00:49.60] Baby, follow you wherever you are
[00:54.10] Here I am, just another boy singing songs
[00:59.30] That others have sung
[01:03.10] Trying to find the words to employ to adore
[01:08.50] That goddess of love
[01:11.80] Oh, you got me in a daze, yeah
[01:16.80] No, it's not another phase
[01:21.30] You gave me one look and now I can't get my mind off of you
[01:30.10] And it's all because
[01:32.30] I see the galaxies when I look in your eyes
[01:35.80] And I can't speak, no, I can't speak at all
[01:41.30] I swear to Zeus you're Aphrodite in disguise
[01:44.90] Don't think that you can hide it from me
[01:49.80] Oh no, I never thought I'd get this close to someone so divine
[01:54.20] Oh, I can't breathe, no, I can't breathe at all
[02:00.30] Aphrodite, could you, could you please be mine? Oh
[02:06.00] Could you please be mine, oh mine?
[02:11.00] 
[02:28.00] Here you are, I've waited so long
[02:32.40] Hoping you would sit down and stay
[02:36.90] 'Cause with these stars I've been dancing along
[02:40.80] Like a fool, so you look my way
[02:46.00] You're the moon that glows in the sky
[02:50.50] Lighting up my world when it's blue
[02:55.00] And here I sing though late in the night
[02:59.50] Hoping that I sing just for you
[03:03.70] Oh, you got me in a daze, yeah
[03:08.70] No, it's not another phase
[03:13.20] You gave me one look and now I can't get my mind off of you
[03:22.00] And it's all because
[03:24.20] I see the galaxies when I look in your eyes
[03:27.70] And I can't speak, no, I can't speak at all
[03:33.20] I swear to Zeus you're Aphrodite in disguise
[03:36.80] Don't think that you can hide it from me
[03:41.70] Oh no, I never thought I'd get this close to someone so divine
[03:46.10] Oh, I can't breathe, no, I can't breathe at all
[03:52.20] Aphrodite, could you, could you please be mine? Oh
[03:57.90] Could you please be mine, oh mine?
[04:02.40] Could you please be mine, oh mine?
"""

def parse_lrc(text):
    lines = text.strip().split("\n")
    parsed_lines = []
    pattern = re.compile(r"\[(\d{2}):(\d{2}\.\d{2})\]\s*(.*)")

    for line in lines:
        match = pattern.match(line.strip())
        if match:
            minutes = int(match.group(1))
            seconds = float(match.group(2))
            lyric_text = match.group(3).strip()
            total_sec = round(minutes * 60 + seconds, 2)
            if lyric_text: # Ignore empty spacer timestamps
                parsed_lines.append({
                    "start": total_sec,
                    "text": lyric_text
                })

    # Calculate end timestamps based on next line's start
    lyrics_json_data = []
    for i, item in enumerate(parsed_lines):
        start_t = item["start"]
        if i < len(parsed_lines) - 1:
            next_start = parsed_lines[i + 1]["start"]
            end_t = round(min(start_t + 6.0, next_start - 0.2), 2)
            if end_t <= start_t:
                end_t = round(start_t + 2.5, 2)
        else:
            end_t = round(start_t + 5.0, 2)

        words = [w.strip("?,!.") for w in item["text"].split() if w.strip("?,!.")]
        lyrics_json_data.append({
            "id": i + 1,
            "start": start_t,
            "end": end_t,
            "text": item["text"],
            "words": words
        })

    print(f"[LRC Parser] Parsed {len(lyrics_json_data)} synchronized lyric lines.")
    return lyrics_json_data

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    lyrics_data = parse_lrc(lrc_raw)

    lyrics_file = os.path.join(base_dir, "lyrics.json")
    with open(lyrics_file, "w", encoding="utf-8") as f:
        json.dump({"title": "Aphrodite", "artist": "The Ridleys", "lyrics": lyrics_data}, f, indent=2)

    print(f"Exported to {lyrics_file}")
