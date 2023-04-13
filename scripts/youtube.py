import os
import json
import time
import google_auth_oauthlib.flow
import googleapiclient.discovery
import googleapiclient.errors
from pytube import YouTube
from tqdm.auto import tqdm

client_secrets_path = os.environ.get("CLIENT_SECRETS_PATH")
scopes = ["https://www.googleapis.com/auth/youtube.readonly"]


def get_youtube_service():
    # Disable OAuthlib's HTTPS verification when running locally.
    # *DO NOT* leave this option enabled in production.
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    api_service_name = "youtube"
    api_version = "v3"

    client_secrets_file = "../secrets/client_secret_1028672435704-vt42tj35tu3p8slu19l889eldlsrmdm4.apps.googleusercontent.com.json"

    # Get credentials and create an API client
    flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
        client_secrets_file, scopes
    )

    credentials = flow.run_local_server(port=8080)
    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, credentials=credentials
    )
    return youtube


def get_video_details(video_id, youtube):
    request = youtube.videos().list(
        part="snippet,contentDetails,statistics", id=video_id
    )
    response = request.execute()
    video = response["items"][0]

    video_title = video["snippet"]["title"]
    duration = video["contentDetails"]["duration"]
    description = video["snippet"]["description"]
    category_id = video["snippet"]["categoryId"]
    like_count = int(video["statistics"].get("likeCount", 0))
    dislike_count = int(video["statistics"].get("dislikeCount", 0))

    published_at = video["snippet"]["publishedAt"]
    created_at = video["snippet"][
        "publishedAt"
    ]  # YouTube doesn't provide separate creation time

    return {
        "id": video_id,
        "title": video_title,
        "created_at": created_at,
        "published_at": published_at,
        "duration": duration,
        "description": description,
        "category_id": category_id,
        "like_count": like_count,
        "dislike_count": dislike_count,
    }


def get_all_video_ids(channel_id, youtube, max_retries=3):
    videos = []
    next_page_token = None

    while True:
        success = False
        for attempt in range(max_retries):
            try:
                request = youtube.search().list(
                    part="id",
                    channelId=channel_id,
                    maxResults=50,
                    type="video",
                    pageToken=next_page_token,
                )
                response = request.execute()
                video_ids = [item["id"]["videoId"] for item in response["items"]]
                videos.extend(video_ids)

                next_page_token = response.get("nextPageToken")
                success = True
                break
            except Exception as e:
                print(f"Error fetching video IDs (attempt {attempt + 1}): {e}")
                time.sleep(2)  # Wait for 2 seconds before retrying

        if not success:
            print(f"Failed to fetch video IDs after {max_retries} attempts")
            break

        if not next_page_token:
            break

    return videos


def download_audio(video_id, max_retries=5):
    for attempt in range(max_retries):
        try:
            yt = YouTube(f"https://www.youtube.com/watch?v={video_id}")
            audio_stream = yt.streams.filter(only_audio=True).first()
            audio_stream.download(
                output_path="../data/mp3", filename=f"{video_id}_audio.mp3"
            )
            print(f"Downloaded audio for video ID: {video_id}")
            break
        except Exception as e:
            print(
                f"Error downloading audio for video ID {video_id} (attempt {attempt + 1}): {e}"
            )
            time.sleep(2)  # Wait for 2 seconds before retrying
    else:
        print(
            f"Failed to download audio for video ID {video_id} after {max_retries} attempts"
        )


def get_videos_metadata():
    youtube = get_youtube_service()
    channel_id = "UCELSb-IYi_d5rYFOxWeOz5g"

    # Get all video IDs
    print("Fetching video IDs...")
    video_ids = get_all_video_ids(channel_id, youtube)

    # Fetch and output video details as JSON
    video_details_list = []
    print("Fetching video Details...")
    for video_id in tqdm(video_ids[:10]):
        video_details = get_video_details(video_id, youtube)
        video_details_list.append(video_details)

    # Convert the list of video details to a JSON string
    video_details_json = json.dumps(video_details_list, indent=2)

    # Save the JSON output to a file
    with open("webflow_youtube2.json", "w", encoding="utf-8") as f:
        f.write(video_details_json)


def get_videos_audio():
    # Read video details from 'webflow_youtube.json'
    with open("webflow_youtube.json", "r", encoding="utf-8") as f:
        video_details_list = json.load(f)

    print("Downloading audio for videos...")
    # Download audio for each video ID
    for video_details in tqdm(video_details_list):
        video_id = video_details["id"]
        download_audio(video_id)


if __name__ == "__main__":
    get_videos_metadata()
    get_videos_audio()
