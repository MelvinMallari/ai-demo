import whisper
import json
import time
from tqdm.auto import tqdm

model = whisper.load_model("tiny.en")


def transcribe_with_retry(audio_file, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = model.transcribe(audio_file, fp16=False, language="English")
            return result
        except Exception as e:
            print(
                f"Error transcribing audio file {audio_file} (attempt {attempt + 1}): {e}"
            )
            time.sleep(2)  # Wait for 2 seconds before retrying
    else:
        print(
            f"Failed to transcribe audio file {audio_file} after {max_retries} attempts"
        )
        return None


def transcribe_audios():
    # Read video details from 'webflow_youtube.json'
    with open("webflow_youtube.json", "r", encoding="utf-8") as f:
        video_details_list = json.load(f)

    # Loop through audio files and transcribe them
    transcriptions = []
    print("Transcribing audio files...")
    for video_details in tqdm(video_details_list[:30]):
        audio_file = f"../data/mp3/{video_details['id']}_audio.mp3"
        transcription = transcribe_with_retry(audio_file)
        if transcription:
            transcriptions.append({**video_details, **transcription})

    # Save transcriptions to a JSON file
    transcription_json = json.dumps(transcriptions, indent=2)
    with open("transcription.json", "w", encoding="utf-8") as f:
        f.write(transcription_json)


if __name__ == "__main__":
    transcribe_audios()
