import os
import struct

def parse_mp4_boxes(file_path):
    print(f"[MP4 Parser] Parsing ISO boxes from: {file_path}")
    size = os.path.getsize(file_path)

    with open(file_path, "rb") as f:
        data = f.read()

    offset = 0
    while offset < len(data) - 8:
        box_size, box_type = struct.unpack(">I4s", data[offset:offset+8])
        box_type_str = box_type.decode('latin1', errors='ignore')
        
        if box_size == 1: # 64-bit size
            box_size = struct.unpack(">Q", data[offset+8:offset+16])[0]
            header_len = 16
        else:
            header_len = 8

        if box_size == 0: # Box extends to EOF
            box_size = len(data) - offset

        print(f"  Box: '{box_type_str}' at offset {offset}, size={box_size}")

        if box_type_str == 'moov':
            parse_moov(data[offset+header_len : offset+box_size])

        offset += box_size
        if box_size <= 0:
            break

def parse_moov(moov_data):
    offset = 0
    while offset < len(moov_data) - 8:
        box_size, box_type = struct.unpack(">I4s", moov_data[offset:offset+8])
        box_type_str = box_type.decode('latin1', errors='ignore')
        if box_size == 1:
            box_size = struct.unpack(">Q", moov_data[offset+8:offset+16])[0]
            header_len = 16
        else:
            header_len = 8

        if box_type_str == 'mvhd':
            # Header movie header box
            version = moov_data[offset+header_len]
            if version == 1:
                timescale, duration = struct.unpack(">IQ", moov_data[offset+header_len+20:offset+header_len+32])
            else:
                timescale, duration = struct.unpack(">II", moov_data[offset+header_len+12:offset+header_len+20])
            duration_sec = duration / timescale
            print(f"    [MVHD] Timescale: {timescale}, Duration: {duration} ({duration_sec:.2f} seconds / {duration_sec/60:.2f} min)")

        offset += box_size
        if box_size <= 0:
            break

if __name__ == "__main__":
    mp4_path = os.path.join(os.path.dirname(__file__), "Aphrodite - The Ridleys (Lyrics).mp4")
    parse_mp4_boxes(mp4_path)
