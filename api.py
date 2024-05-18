from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
import cv2
import mediapipe as mp
import tempfile
from pathlib import Path
from body_part_angle import BodyPartAngle
from types_of_exercise import TypeOfExercise
from utils import score_table
import os
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import storage
from google.oauth2 import service_account
from google.auth import default
import logging
import numpy as np
import imageio

app = FastAPI()

# Menggunakan MediaPipe untuk analisis video
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

origins = [
    "http://localhost:3000",  # Your local frontend URL
    "https://frontend-trackerfit.as.r.appspot.com",  # Add your frontend URL if it's deployed somewhere
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from these origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Path ke Google Cloud Storage
BUCKET_NAME = 'filevideo'

# Obtain default credentials and project
credentials, project = default()
client = storage.Client(credentials=credentials, project=project)


@app.get("/list_files")
async def list_files():
    try:
        bucket = client.bucket(BUCKET_NAME)
        blobs = bucket.list_blobs()

        files = []
        for blob in blobs:
            files.append({
                'name': blob.name,
                'url': blob.public_url
            })

        return JSONResponse(content=files, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving files: {e}")


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
    output_filename = f"{original_filename}_output.gif"
    temp_output_path = tempfile.NamedTemporaryFile(delete=False, suffix='.gif').name

    # Open the input video file and set up the output video file for writing
    cap = cv2.VideoCapture(temp_video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        fps = 24  # Default FPS value if unable to get FPS from the video

    counter = 0  # Initialize exercise counter
    status = True  # Initialize exercise status

    frames = []  # List to store frames for GIF

    # Setup Mediapipe Pose
    with mp_pose.Pose(min_detection_confidence=0.5,
                      min_tracking_confidence=0.5) as pose:

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.resize(frame, (800, 480), interpolation=cv2.INTER_AREA)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_rgb.flags.writeable = False

            results = pose.process(frame_rgb)

            frame_rgb.flags.writeable = True
            frame = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)

            try:
                landmarks = results.pose_landmarks.landmark
                counter, status = TypeOfExercise(landmarks).calculate_exercise(
                    exercise_type, counter, status)
            except Exception as e:
                print(f"Error processing exercise: {e}")
                pass

            frame = score_table(exercise_type, frame, counter, status)

            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(255, 255, 255),
                                       thickness=2,
                                       circle_radius=2),
                mp_drawing.DrawingSpec(color=(174, 139, 45),
                                       thickness=2,
                                       circle_radius=2),
            )

            # Append the processed frame to the frames list
            frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    cap.release()

    # Save frames as GIF using imageio
    imageio.mimsave(temp_output_path, frames, fps=fps)

    os.remove(temp_video_path)  # Clean up the input video file

    # Upload the processed GIF to Google Cloud Storage
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(output_filename)
    blob.upload_from_filename(temp_output_path)
    os.remove(temp_output_path)  # Clean up the temporary output file

    public_url = blob.public_url
    # Return the processed GIF filename or path
    return JSONResponse({'exercise_type': exercise_type, 'reps_count': counter, 'output_file': public_url}, status_code=200)


@app.get("/")
def read_root():
    return {"Welcome to AI Fitness Tracker!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)