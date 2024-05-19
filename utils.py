
import mediapipe as mp
import pandas as pd
import numpy as np
import cv2

mp_pose = mp.solutions.pose

def calculate_angle(a, b, c):
    a = np.array(a)  
    b = np.array(b)  
    c = np.array(c)  

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) -\
              np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle



def detection_body_part(landmarks, body_part_name):
    return [
        landmarks[mp_pose.PoseLandmark[body_part_name].value].x,
        landmarks[mp_pose.PoseLandmark[body_part_name].value].y,
        landmarks[mp_pose.PoseLandmark[body_part_name].value].visibility
    ]


def detection_body_parts(landmarks):
    body_parts = pd.DataFrame(columns=["body_part", "x", "y"])

    for i, lndmrk in enumerate(mp_pose.PoseLandmark):
        lndmrk = str(lndmrk).split(".")[1]
        cord = detection_body_part(landmarks, lndmrk)
        body_parts.loc[i] = lndmrk, cord[0], cord[1]

    return body_parts


def score_table(exercise, frame, counter, status):
    top_left = (0, 0)  
    bottom_right = (220, 110)
    
    cv2.rectangle(frame, top_left, bottom_right, (255, 255, 255), cv2.FILLED)

    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.7
    font_color = (0, 0, 0)
    thickness = 2
    line_type = cv2.LINE_AA
    
    y_offset = 30 
    text_y_start = 30 

    cv2.putText(frame, "Activity : " + exercise.replace("-", " "), 
                (10, text_y_start), font, font_scale, font_color, thickness, line_type)
    cv2.putText(frame, "Counter : " + str(counter), 
                (10, text_y_start + y_offset), font, font_scale, font_color, thickness, line_type)
    cv2.putText(frame, "Status : " + str(status), 
                (10, text_y_start + 2 * y_offset), font, font_scale, font_color, thickness, line_type)

    return frame
    
