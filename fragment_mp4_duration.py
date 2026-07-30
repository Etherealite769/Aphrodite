import os
import struct

def parse_all_truns(file_path):
    with open(file_path, "rb") as f:
        data = f.read()

    pos = 0
    total_audio_duration_sec = 0.0
    total_video_duration_sec = 0.0

    # Search for 'trun' boxes across binary
    while True:
        idx = data.find(b'trun', pos)
        if idx == -1:
            break

        pos = idx + 4
        box_size_bytes = data[idx-4:idx]
        if len(box_size_bytes) < 4:
            continue
        box_size = struct.unpack(">I", box_size_bytes)[0]
        
        # Read trun header (version, flags, sample_count)
        if idx + 12 <= len(data):
            flags = struct.unpack(">I", data[idx+4:idx+8])[0] & 0x00ffffff
            sample_count = struct.unpack(">I", data[idx+8:idx+12])[0]
            # print(f"Found 'trun' at {idx}: sample_count={sample_count}, flags=0x{flags:06x}")

    print(f"File size: {len(data)} bytes")

    # Serve MP4 video directly on python server so web app can play both side-by-side or inspect video timestamps!
    print("MP4 file parsed.")

if __name__ == "__main__":
    mp4_path = os.path.join(os.path.dirname(__file__), "Aphrodite - The Ridleys (Lyrics).mp4")
    parse_all_truns(mp4_path)
