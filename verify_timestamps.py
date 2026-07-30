import json
import os

lyrics_data = [
    {"id": 1, "start": 13.8, "end": 18.5, "text": "You're the moon that glows in the sky", "words": ["You're", "the", "moon", "that", "glows", "in", "the", "sky"]},
    {"id": 2, "start": 19.0, "end": 23.5, "text": "Lighting up the world when it's blue", "words": ["Lighting", "up", "the", "world", "when", "it's", "blue"]},
    {"id": 3, "start": 24.0, "end": 28.5, "text": "Stars they dance though late in the night", "words": ["Stars", "they", "dance", "though", "late", "in", "the", "night"]},
    {"id": 4, "start": 29.0, "end": 34.0, "text": "Don't you know they dance just for you", "words": ["Don't", "you", "know", "they", "dance", "just", "for", "you"]},
    {"id": 5, "start": 34.5, "end": 39.0, "text": "There you are above darkened clouds", "words": ["There", "you", "are", "above", "darkened", "clouds"]},
    {"id": 6, "start": 39.5, "end": 44.0, "text": "Smiling at the world from afar", "words": ["Smiling", "at", "the", "world", "from", "afar"]},
    {"id": 7, "start": 44.5, "end": 49.0, "text": "With the stars you wander around", "words": ["With", "the", "stars", "you", "wander", "around"]},
    {"id": 8, "start": 49.5, "end": 55.0, "text": "May they follow you wherever you are", "words": ["May", "they", "follow", "you", "wherever", "you", "are"]},
    {"id": 9, "start": 55.5, "end": 60.0, "text": "Here I am just another boy", "words": ["Here", "I", "am", "just", "another", "boy"]},
    {"id": 10, "start": 60.5, "end": 65.0, "text": "Singing songs that others have sung", "words": ["Singing", "songs", "that", "others", "have", "sung"]},
    {"id": 11, "start": 65.5, "end": 70.0, "text": "Trying to find the words to employ", "words": ["Trying", "to", "find", "the", "words", "to", "employ"]},
    {"id": 12, "start": 70.5, "end": 76.0, "text": "To adore the goddess of love", "words": ["To", "adore", "the", "goddess", "of", "love"]},
    {"id": 13, "start": 76.5, "end": 80.5, "text": "Oh you got me in a daze yeah", "words": ["Oh", "you", "got", "me", "in", "a", "daze", "yeah"]},
    {"id": 14, "start": 81.0, "end": 85.0, "text": "No it's not another phase", "words": ["No", "it's", "not", "another", "phase"]},
    {"id": 15, "start": 85.5, "end": 92.5, "text": "You gave me one look and now I can't get my mind off of you", "words": ["You", "gave", "me", "one", "look", "and", "now", "I", "can't", "get", "my", "mind", "off", "of", "you"]},
    {"id": 16, "start": 93.0, "end": 96.0, "text": "And it's all because", "words": ["And", "it's", "all", "because"]},
    {"id": 17, "start": 96.5, "end": 102.5, "text": "I see the galaxies when I look in your eyes and I", "words": ["I", "see", "the", "galaxies", "when", "I", "look", "in", "your", "eyes", "and", "I"]},
    {"id": 18, "start": 103.0, "end": 105.5, "text": "Can't speak no I", "words": ["Can't", "speak", "no", "I"]},
    {"id": 19, "start": 106.0, "end": 108.5, "text": "Can't speak at all", "words": ["Can't", "speak", "at", "all"]},
    {"id": 20, "start": 109.0, "end": 114.5, "text": "I swear to Zeus you're Aphrodite in disguise", "words": ["I", "swear", "to", "Zeus", "you're", "Aphrodite", "in", "disguise"]},
    {"id": 21, "start": 115.0, "end": 119.5, "text": "Don't think that you can hide it from me", "words": ["Don't", "think", "that", "you", "can", "hide", "it", "from", "me"]},
    {"id": 22, "start": 120.0, "end": 127.5, "text": "Oh no I never thought I'd get this close to someone so divine", "words": ["Oh", "no", "I", "never", "thought", "I'd", "get", "this", "close", "to", "someone", "so", "divine"]},
    {"id": 23, "start": 128.0, "end": 132.5, "text": "Oh I can't breathe no I can't breathe at all", "words": ["Oh", "I", "can't", "breathe", "no", "I", "can't", "breathe", "at", "all"]},
    {"id": 24, "start": 133.0, "end": 138.5, "text": "Aphrodite could you could you please be mine oh", "words": ["Aphrodite", "could", "you", "could", "you", "please", "be", "mine", "oh"]},
    {"id": 25, "start": 139.0, "end": 145.0, "text": "Could you please be mine oh mine", "words": ["Could", "you", "please", "be", "mine", "oh", "mine"]},
    {"id": 26, "start": 156.0, "end": 160.5, "text": "Here you are I've waited so long", "words": ["Here", "you", "are", "I've", "waited", "so", "long"]},
    {"id": 27, "start": 161.0, "end": 165.5, "text": "Hoping you would sit down to stay", "words": ["Hoping", "you", "would", "sit", "down", "to", "stay"]},
    {"id": 28, "start": 166.0, "end": 170.5, "text": "'Cause with these stars I've been dancing along", "words": ["'Cause", "with", "these", "stars", "I've", "been", "dancing", "along"]},
    {"id": 29, "start": 171.0, "end": 176.0, "text": "Like a fool so you'd look my way", "words": ["Like", "a", "fool", "so", "you'd", "look", "my", "way"]},
    {"id": 30, "start": 176.5, "end": 181.0, "text": "You're the moon that glows in the sky", "words": ["You're", "the", "moon", "that", "glows", "in", "the", "sky"]},
    {"id": 31, "start": 181.5, "end": 186.0, "text": "Lighting up the world when it's blue", "words": ["Lighting", "up", "the", "world", "when", "it's", "blue"]},
    {"id": 32, "start": 186.5, "end": 191.0, "text": "And here I sing though late in the night", "words": ["And", "here", "I", "sing", "though", "late", "in", "the", "night"]},
    {"id": 33, "start": 191.5, "end": 197.0, "text": "Hope you know I sing just for you", "words": ["Hope", "you", "know", "I", "sing", "just", "for", "you"]},
    {"id": 34, "start": 197.5, "end": 201.5, "text": "Oh you got me in a daze yeah", "words": ["Oh", "you", "got", "me", "in", "a", "daze", "yeah"]},
    {"id": 35, "start": 202.0, "end": 206.0, "text": "No it's not another phase", "words": ["No", "it's", "not", "another", "phase"]},
    {"id": 36, "start": 206.5, "end": 213.5, "text": "You gave me one look and now I can't get my mind off of you", "words": ["You", "gave", "me", "one", "look", "and", "now", "I", "can't", "get", "my", "mind", "off", "of", "you"]},
    {"id": 37, "start": 214.0, "end": 217.0, "text": "And it's all because", "words": ["And", "it's", "all", "because"]},
    {"id": 38, "start": 217.5, "end": 223.5, "text": "I see the galaxies when I look in your eyes and I", "words": ["I", "see", "the", "galaxies", "when", "I", "look", "in", "your", "eyes", "and", "I"]},
    {"id": 39, "start": 224.0, "end": 226.5, "text": "Can't speak no I", "words": ["Can't", "speak", "no", "I"]},
    {"id": 40, "start": 227.0, "end": 229.5, "text": "Can't speak at all", "words": ["Can't", "speak", "at", "all"]},
    {"id": 41, "start": 230.0, "end": 235.5, "text": "I swear to Zeus you're Aphrodite in disguise", "words": ["I", "swear", "to", "Zeus", "you're", "Aphrodite", "in", "disguise"]},
    {"id": 42, "start": 236.0, "end": 240.5, "text": "Don't think that you can hide it from me", "words": ["Don't", "think", "that", "you", "can", "hide", "it", "from", "me"]},
    {"id": 43, "start": 241.0, "end": 248.5, "text": "Oh no I never thought I'd get this close to someone so divine", "words": ["Oh", "no", "I", "never", "thought", "I'd", "get", "this", "close", "to", "someone", "so", "divine"]},
    {"id": 44, "start": 249.0, "end": 253.5, "text": "Oh I can't breathe no I can't breathe at all", "words": ["Oh", "I", "can't", "breathe", "no", "I", "can't", "breathe", "at", "all"]},
    {"id": 45, "start": 254.0, "end": 259.5, "text": "Aphrodite could you could you please be mine oh", "words": ["Aphrodite", "could", "you", "could", "you", "please", "be", "mine", "oh"]},
    {"id": 46, "start": 260.0, "end": 266.0, "text": "Could you please be mine oh mine", "words": ["Could", "you", "please", "be", "mine", "oh", "mine"]},
    {"id": 47, "start": 266.5, "end": 273.0, "text": "Could you please be mine oh mine", "words": ["Could", "you", "please", "be", "mine", "oh", "mine"]}
]

def save_and_verify():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    lyrics_file = os.path.join(base_dir, "lyrics.json")
    with open(lyrics_file, "w", encoding="utf-8") as f:
        json.dump({"title": "Aphrodite", "artist": "The Ridleys", "lyrics": lyrics_data}, f, indent=2)
    print(f"[Verify] Successfully wrote {len(lyrics_data)} lines to {lyrics_file}")

if __name__ == "__main__":
    save_and_verify()
