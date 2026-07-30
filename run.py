import os
import sys
import webbrowser
from audio_processor import analyze_media
from server import run_server

def main():
    print("==================================================================")
    print("  APHRODITE — Lyric Animated Video & Music Visualizer Suite")
    print("==================================================================")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        print("[Launcher] Pre-analyzing track waveform & timecoded lyrics...")
        analyze_media()
    except Exception as e:
        print(f"[Launcher] Audio analysis warning: {e}")

    url = "http://localhost:8000"
    print(f"[Launcher] Opening Lyric Animated Video in browser: {url}")
    webbrowser.open(url)

    print("[Launcher] Starting Aphrodite Python Streaming Server...")
    run_server(8000)

if __name__ == "__main__":
    main()
