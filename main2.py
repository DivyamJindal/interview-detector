import cv2
import mediapipe as mp
import speech_recognition as sr
import threading
import time
import numpy as np

# Initialize mediapipe for face mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

# Initialize the recognizer for speech-to-text
recognizer = sr.Recognizer()

# Variable to store recognized speech text
recognized_text = ""
is_recording = False  # Flag to track if recording is active
key_pressed = ""  # Variable to store the last key pressed

# Function to listen for speech and update recognized text
def recognize_speech():
    global recognized_text
    global is_recording

    with sr.Microphone() as source:
        print("Ready to listen for speech...")
        while True:
            if is_recording:
                try:
                    audio = recognizer.listen(source, timeout=5)
                    recognized_text = recognizer.recognize_google(audio)
                    print(f"Recognized text: {recognized_text}")
                except sr.UnknownValueError:
                    print("Sorry, I didn't catch that.")
                except sr.RequestError as e:
                    print(f"Could not request results; {e}")
                time.sleep(1)  # Avoid overloading CPU
            else:
                time.sleep(1)  # Wait when not recording

# Start the speech recognition in a separate thread
speech_thread = threading.Thread(target=recognize_speech)
speech_thread.daemon = True
speech_thread.start()

# Initialize webcam
cap = cv2.VideoCapture(0)

# Function to calculate the distance between two points
def calculate_distance(point1, point2):
    return np.linalg.norm(np.array(point1) - np.array(point2))

# Function to check if mouth is moving by comparing upper and lower lip distance
def is_mouth_moving(landmarks):
    upper_lip = landmarks[13]  # Upper lip center
    lower_lip = landmarks[14]  # Lower lip center
    lip_distance = calculate_distance(upper_lip, lower_lip)
    return lip_distance

# Define function to toggle recording on button press
def toggle_recording():
    global is_recording
    if is_recording:
        is_recording = False
        save_text_to_file()
        print("Recording stopped.")
    else:
        is_recording = True
        print("Recording started...")

# Function to save recognized speech to a text file
def save_text_to_file():
    with open("recognized_text.txt", "w") as file:
        file.write(recognized_text)

# Create buttons in OpenCV
def draw_buttons(frame):
    cv2.putText(frame, "Press 'r' to Start Recording", (10, frame.shape[0] - 50), cv2.FONT_HERSHEY_DUPLEX, 0.8, (0, 255, 0), 2)
    cv2.putText(frame, "Press 's' to Stop Recording", (10, frame.shape[0] - 20), cv2.FONT_HERSHEY_DUPLEX, 0.8, (0, 0, 255), 2)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # Convert frame to RGB for face mesh processing
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process the frame and detect face mesh
    results = face_mesh.process(rgb_frame)

    # Draw the face mesh landmarks on the frame and check mouth movement
    mouth_is_moving = False
    if results.multi_face_landmarks:
        for landmarks in results.multi_face_landmarks:
            # Draw landmarks
            mp_drawing.draw_landmarks(frame, landmarks, mp_face_mesh.FACEMESH_CONTOURS)

            # Get mouth movement status
            landmarks_2d = [(lm.x * frame.shape[1], lm.y * frame.shape[0]) for lm in landmarks.landmark]
            mouth_distance = is_mouth_moving(landmarks_2d)
            
            # Define a threshold for mouth movement detection
            if mouth_distance > 10:  # Threshold for detecting movement
                mouth_is_moving = True

    # Draw a filled square to indicate mouth movement
    square_color = (0, 255, 0) if mouth_is_moving else (0, 0, 255)  # Green for moving, Red for not moving
    cv2.rectangle(frame, (frame.shape[1] - 150, 50), (frame.shape[1] - 50, 150), square_color, -1)  # Filled square

    # Display the recognized speech text on the frame
    cv2.putText(frame, f"Speech: {recognized_text}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

    # Display the key being pressed
    cv2.putText(frame, f"Last Key Pressed: {key_pressed}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)

    # Draw the buttons
    draw_buttons(frame)

    # Show the frame with face mesh and speech text
    cv2.imshow('Real-Time Face Mesh with Speech-to-Text', frame)

    # Wait for keypress to start/stop recording
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):  # Press 'q' to quit
        break
    elif key == ord('r'):  # Press 'r' to start recording
        key_pressed = 'r'
        toggle_recording()
    elif key == ord('s'):  # Press 's' to stop recording
        key_pressed = 's'
        toggle_recording()

# Release the webcam and close windows
cap.release()
cv2.destroyAllWindows()
