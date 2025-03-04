import cv2
import mediapipe as mp
import speech_recognition as sr
import threading
import time

# Initialize mediapipe for face mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

# Initialize the recognizer for speech-to-text
recognizer = sr.Recognizer()

# Variable to store recognized speech text
recognized_text = ""
is_recording = False  # Flag to track if recording is active

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
    cv2.putText(frame, "Press 'R' to Start Recording", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    cv2.putText(frame, "Press 'S' to Stop Recording", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # Convert frame to RGB for face mesh processing
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame_shape = frame.shape

    # Process the frame and detect face mesh
    results = face_mesh.process(rgb_frame)

    # Variable to track if speaking
    speaking = False

    if results.multi_face_landmarks:
        for landmarks in results.multi_face_landmarks:
            # Draw face mesh
            mp_drawing.draw_landmarks(frame, landmarks, mp_face_mesh.FACEMESH_CONTOURS)

            # Eye Box Detection
            left_eye_landmarks = [33, 133]  # Left eye
            right_eye_landmarks = [362, 263]  # Right eye

            # Get bounding box for left eye
            left_eye = [(landmarks.landmark[i].x * frame_shape[1], landmarks.landmark[i].y * frame_shape[0]) for i in left_eye_landmarks]
            left_x_min, left_y_min = int(min([pt[0] for pt in left_eye])), int(min([pt[1] for pt in left_eye]))
            left_x_max, left_y_max = int(max([pt[0] for pt in left_eye])), int(max([pt[1] for pt in left_eye]))

            # Get bounding box for right eye
            right_eye = [(landmarks.landmark[i].x * frame_shape[1], landmarks.landmark[i].y * frame_shape[0]) for i in right_eye_landmarks]
            right_x_min, right_y_min = int(min([pt[0] for pt in right_eye])), int(min([pt[1] for pt in right_eye]))
            right_x_max, right_y_max = int(max([pt[0] for pt in right_eye])), int(max([pt[1] for pt in right_eye]))

            # Draw rectangles around eyes
            cv2.rectangle(frame, (left_x_min - 10, left_y_min - 10), (left_x_max + 10, left_y_max + 10), (0, 255, 0), 2)
            cv2.rectangle(frame, (right_x_min - 10, right_y_min - 10), (right_x_max + 10, right_y_max + 10), (0, 255, 0), 2)

            # Check if the mouth is moving
            upper_lip = landmarks.landmark[13]
            lower_lip = landmarks.landmark[14]
            mouth_distance = ((upper_lip.x - lower_lip.x) ** 2 + (upper_lip.y - lower_lip.y) ** 2) ** 0.5
            if mouth_distance > 0.015:  # Adjust threshold as needed
                speaking = True

    # Draw speaking detection box on the side
    box_color = (0, 255, 0) if speaking else (0, 0, 255)
    cv2.rectangle(frame, (10, 150), (110, 250), box_color, -1)  # Solid color square
    cv2.putText(frame, "Speaking" if speaking else "Silent", (15, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    # Display the recognized speech text
    cv2.putText(frame, f"Speech: {recognized_text}", (10, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # Draw the buttons
    draw_buttons(frame)

    # Show the frame with face mesh, eye boxes, speaking box, and speech text
    cv2.imshow('Real-Time Face Mesh with Eye Boxes and Speech-to-Text', frame)

    # Wait for keypress to start/stop recording
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):  # Press 'q' to quit
        break
    elif key == ord('r'):  # Press 'r' to start recording
        toggle_recording()
    elif key == ord('s'):  # Press 's' to stop recording
        toggle_recording()

# Release the webcam and close windows
cap.release()
cv2.destroyAllWindows()
