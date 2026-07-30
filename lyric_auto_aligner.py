import os
import math

def inspect_energy(file_path):
    with open(file_path, "rb") as f:
        data = f.read()

    file_size = len(data)
    est_duration = (file_size * 8) / 192000

    chunks_per_sec = 10
    total_chunks = int(est_duration * chunks_per_sec)
    chunk_size = len(data) // total_chunks

    energies = []
    for i in range(total_chunks):
        chunk = data[i * chunk_size : (i + 1) * chunk_size]
        if not chunk:
            break
        sq = sum((b - 128) ** 2 for b in chunk)
        rms = math.sqrt(sq / len(chunk))
        energies.append(round(rms, 2))

    print(f"Total track length: {est_duration:.1f}s")
    print("Energy Profile (every 5 seconds):")
    for sec in range(0, int(est_duration), 5):
        chunk_idx = sec * chunks_per_sec
        sub_slice = energies[chunk_idx : chunk_idx + (5 * chunks_per_sec)]
        avg_e = sum(sub_slice) / len(sub_slice) if sub_slice else 0
        max_e = max(sub_slice) if sub_slice else 0
        bar = "#" * int(avg_e / 2)
        print(f"{sec:3d}s - {sec+5:3d}s | Avg: {avg_e:5.2f} | Max: {max_e:5.2f} | {bar}")

if __name__ == "__main__":
    audio_path = os.path.join(os.path.dirname(__file__), "Aphrodite.mp3")
    inspect_energy(audio_path)
