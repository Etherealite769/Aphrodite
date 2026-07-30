import os
import json
import re
import syncedlyrics

def fetch_lrc():
    query = "The Ridleys - Aphrodite"
    print(f"[SyncedLyrics] Searching online providers for: '{query}'...")
    
    lrc_result = syncedlyrics.search(query)
    
    if not lrc_result:
        print("[SyncedLyrics] Search returned empty result, trying fallback query 'Aphrodite The Ridleys'...")
        lrc_result = syncedlyrics.search("Aphrodite The Ridleys")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    if lrc_result:
        print("\n[SyncedLyrics] Successfully retrieved LRC from online provider!")
        print("LRC Output Preview:\n" + "\n".join(lrc_result.split("\n")[:10]))

        lrc_file_path = os.path.join(base_dir, "aphrodite.lrc")
        with open(lrc_file_path, "w", encoding="utf-8") as f:
            f.write(lrc_result)

        parse_and_save_lrc(lrc_result, base_dir)
    else:
        print("[SyncedLyrics] Could not retrieve online LRC, using local LRC content...")

def parse_and_save_lrc(lrc_text, base_dir):
    lines = lrc_text.strip().split("\n")
    parsed_lines = []
    pattern = re.compile(r"\[(\d{2}):(\d{2}\.\d{2,3})\]\s*(.*)")

    for line in lines:
        match = pattern.match(line.strip())
        if match:
            minutes = int(match.group(1))
            seconds = float(match.group(2))
            lyric_text = match.group(3).strip()
            total_sec = round(minutes * 60 + seconds, 2)
            if lyric_text:
                parsed_lines.append({
                    "start": total_sec,
                    "text": lyric_text
                })

    json_lyrics = []
    for i, item in enumerate(parsed_lines):
        start_t = item["start"]
        if i < len(parsed_lines) - 1:
            next_ts = parsed_lines[i + 1]["start"]
            if next_ts - start_t <= 12.0:
                end_t = round(next_ts - 0.1, 2)
            else:
                end_t = round(start_t + 6.5, 2)
        else:
            end_t = round(start_t + 6.0, 2)

        words = [w.strip("?,!.") for w in item["text"].split() if w.strip("?,!.")]
        json_lyrics.append({
            "id": i + 1,
            "start": start_t,
            "end": end_t,
            "text": item["text"],
            "words": words
        })

    json_file_path = os.path.join(base_dir, "lyrics.json")
    with open(json_file_path, "w", encoding="utf-8") as f:
        json.dump({"title": "Aphrodite", "artist": "The Ridleys", "lyrics": json_lyrics}, f, indent=2)

    print(f"[SyncedLyrics] Successfully updated {len(json_lyrics)} lines in lyrics.json")

if __name__ == "__main__":
    fetch_lrc()
