import os
import subprocess
import json

def inspect_mp4(mp4_file):
    print(f"[MP4 Inspector] Inspecting file: {mp4_file}")
    file_size = os.path.getsize(mp4_file)
    print(f"File size: {file_size / (1024*1024):.2f} MB")

    # Try running ffprobe / ffmpeg if installed to dump metadata & subtitle tracks
    try:
        res = subprocess.run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", mp4_file], capture_output=True, text=True)
        if res.returncode == 0:
            info = json.loads(res.stdout)
            print("[MP4 Inspector] FFprobe metadata:")
            format_info = info.get("format", {})
            print(f"  Duration: {format_info.get('duration')} sec")
            print(f"  Bitrate: {format_info.get('bit_rate')} bps")
            for st in info.get("streams", []):
                print(f"  Stream #{st.get('index')}: type={st.get('codec_type')}, codec={st.get('codec_name')}")
        else:
            print("[MP4 Inspector] ffprobe not available directly on path.")
    except Exception as e:
        print(f"[MP4 Inspector] ffprobe check: {e}")

if __name__ == "__main__":
    mp4_path = os.path.join(os.path.dirname(__file__), "Aphrodite - The Ridleys (Lyrics).mp4")
    inspect_mp4(mp4_path)
