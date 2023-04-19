import whisper
import json
import time
from tqdm.auto import tqdm
from pydub import AudioSegment

model = whisper.load_model("medium.en")


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


def get_audio_length(file_path):
    audio = AudioSegment.from_file(file_path)
    duration_ms = len(audio)
    duration_s = duration_ms / 1000
    return duration_s


def find_top_n_longest_audio_files(audio_files, n):
    file_durations = [
        (file_path, get_audio_length(file_path)) for file_path in tqdm(audio_files)
    ]
    sorted_files = sorted(file_durations, key=lambda x: x[1], reverse=True)
    return sorted_files[:n]


def transcribe_audios():
    # Read video details from 'webflow_youtube.json'
    with open("webflow_youtube.json", "r", encoding="utf-8") as f:
        video_details_list = json.load(f)

    # Loop through audio files and transcribe them
    transcriptions = []
    print("Transcribing audio files...")
    for video_details in tqdm(video_details_list):
        audio_file = f"../data/mp3/{video_details['id']}_audio.mp3"
        try:
            audio_length = get_audio_length(audio_file)

            # Check if audio length is less than or equal to 80 minutes
            if audio_length <= (80 * 60):
                transcription = transcribe_with_retry(audio_file)
                if transcription:
                    transcriptions.append({**video_details, **transcription})
            else:
                print(
                    f"Skipping audio file {audio_file} because it is longer than 80 minutes"
                )
        except Exception as e:
            print(
                f"Error getting length of audio file {audio_file}: {e}. Skipping this file."
            )

    # Save transcriptions to a JSON file
    transcription_json = json.dumps(transcriptions, indent=2)
    with open("trancriptions.json", "w", encoding="utf-8") as f:
        f.write(transcription_json)


if __name__ == "__main__":
    transcribe_audios()
