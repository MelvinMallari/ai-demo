import json
from tqdm.auto import tqdm

WINDOW = 6
STRIDE = 3


def batch_segments():
    res = []
    with open("transcriptions.json", "r", encoding="utf-8") as f:
        transcriptions = json.load(f)

    for transcription in transcriptions:
        old_segments = transcription["segments"]
        batched_segments = []
        for i in range(0, len(old_segments), STRIDE):
            segment_window = old_segments[i : i + WINDOW]
            data = {
                "id": transcription["id"],
                "title": transcription["title"],
                "duration": transcription["duration"],
                "start": segment_window[0]["start"],
                "end": segment_window[-1]["end"],
                "text": "".join([s["text"] for s in segment_window]),
            }
            batched_segments.append(data)
        res.append({**transcription, "segments": batched_segments})

    batched_transcriptions = json.dumps(res, indent=2)

    with open("batched_transcriptions.json", "w", encoding="utf-8") as f:
        f.write(batched_transcriptions)

    return batched_transcriptions


if __name__ == "__main__":
    batch_segments()
