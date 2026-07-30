import os
import sys

def main():
    print("==================================================================")
    print("  APHRODITE — Lyric Animated Video Exporter")
    print("==================================================================")
    print("  1. IN-BROWSER HIGH-DEFINITION VIDEO RECORDING (Recommended):")
    print("     - Launch http://localhost:8000 in your browser.")
    print("     - Click the '🎥 Export Video' button in the top right header.")
    print("     - Play the song! The app records canvas visualizer + audio")
    print("       in 1080p 60FPS directly into a downloadable .webm / .mp4 video!")
    print("")
    print("  2. OFFLINE FFMPEG STITCHING (Optional):")
    print("     If you record frame PNGs or WebM clips, run:")
    print("     ffmpeg -i aphrodite_lyric_video.webm -i Aphrodite.mp3 -c:v copy -c:a aac output.mp4")
    print("==================================================================")

if __name__ == "__main__":
    main()
