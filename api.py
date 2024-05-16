from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
import cv2
import mediapipe as mp
import shutil
import tempfile
import json
from pathlib import Path
from body_part_angle import BodyPartAngle
from types_of_exercise import TypeOfExercise
from utils import score_table
import os
import uuid
from fastapi.middleware.cors import CORSMiddleware

from google.cloud import storage

app = FastAPI()

client = storage.Client()
bucket = client.get_bucket('filevideo')


# Menggunakan MediaPipe untuk analisis video
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

origins = [
    "http://localhost:3000",  # Your local frontend URL
    "https://your-frontend-domain.com",  # Add your frontend URL if it's deployed somewhere
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from these origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Path ke folder Exercise_videos
output_folder = Path("videos")

@app.post('/analyze_exercise')
async def analyze_exercise(file: UploadFile, exercise_type: str = Form(...)):
    if not file or not exercise_type:
        raise HTTPException(status_code=400, detail="Missing video file or exercise type")

    # Save the uploaded video file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
        temp_video.write(await file.read())
        temp_video_path = temp_video.name

    # Extract the original filename without the extension
    original_filename = Path(file.filename).stem
    output_filename = f"{original_filename}_output.mp4"
    output_filepath = os.path.join(output_folder, output_filename)

    # # Create an output directory if it doesn't exist
    # os.makedirs(output_folder, exist_ok=True)

    # Open the input video file and set up the output video file for writing
    cap = cv2.VideoCapture(temp_video_path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_filepath, fourcc, cap.get(cv2.CAP_PROP_FPS), (800, 480))

    counter = 0  # Initialize exercise counter
    status = True  # Initialize exercise status

    # Setup Mediapipe Pose
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.resize(frame, (800, 480), interpolation=cv2.INTER_AREA)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(frame_rgb)

            try:
                landmarks = results.pose_landmarks.landmark
                counter, status = TypeOfExercise(landmarks).calculate_exercise(exercise_type, counter, status)
            except Exception as e:
                print(f"Error processing exercise: {e}")

            frame = score_table(exercise_type, frame, counter, status)

            # Draw landmarks on the frame
            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # Write the processed frame to the output video
            out.write(frame)

    cap.release()
    out.release()

    # Upload to Google Cloud Storage
    blob = bucket.blob(f'videos/{output_filename}')
    blob.upload_from_filename(output_filepath)
    public_url = blob.public_url

    # Clean up the local file
    os.remove(temp_video_path)
    os.remove(output_filepath)  # Remove the local output file after uploading

    # Return the public URL of the processed video
    return JSONResponse({'exercise_type': exercise_type, 'reps_count': counter, 'output_file': public_url}, status_code=200)


@app.get("/get_video/")
async def get_video(file_name: str = Query(..., description="The name of the video file to be retrieved")):
    # Construct the full path to the video file
    video_path = output_folder / file_name

    # Check if the file exists
    if not video_path.exists() or not video_path.is_file():
        raise HTTPException(status_code=404, detail=f"Video file '{file_name}' not found.")

    # Open the video file and send it as a streaming response
    def generate():
        with open(video_path, "rb") as video_file:
            while chunk := video_file.read(65536):  # 64 KB chunks
                yield chunk

    return StreamingResponse(generate(), media_type="video/mp4")

@app.get("/")
def read_root():
    return {"Welcome to AI Fitness Tracker!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)