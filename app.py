from flask import Flask, jsonify, request, Response
import threading
import speech_recognition as sr
import cv2
import mediapipe as mp

app = Flask(__name__)

recognized_text = ""
is_recording = False
recognizer = sr.Recognizer()
cap = cv2.VideoCapture(0)  # Initialize webcam

# Initialize mediapipe for face mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

def recognize_speech():
    global recognized_text
    global is_recording

    with sr.Microphone() as source:
        while True:
            if is_recording:
                try:
                    audio = recognizer.listen(source, timeout=5)
                    recognized_text = recognizer.recognize_google(audio)
                except sr.UnknownValueError:
                    pass
                except sr.RequestError as e:
                    print(f"Could not request results; {e}")

@app.route('/start', methods=['POST'])
def start_recording():
    global is_recording
    is_recording = True
    return jsonify({"status": "Recording started"})

@app.route('/stop', methods=['POST'])
def stop_recording():
    global is_recording
    is_recording = False
    return jsonify({"status": "Recording stopped", "recognized_text": recognized_text})

def generate_frames():
    while True:
        success, frame = cap.read()  # Read a frame from the webcam
        if not success:
            break
        else:
            # Encode the frame in JPEG format
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/face_mesh_feed')
def face_mesh_feed():
    while True:
        success, frame = cap.read()  # Read a frame from the webcam
        if not success:
            break

        # Process the frame with MediaPipe Face Mesh
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)

        if results.multi_face_landmarks:
            for landmarks in results.multi_face_landmarks:
                mp_drawing.draw_landmarks(frame, landmarks, mp_face_mesh.FACEMESH_CONTOURS)

        # Encode the processed frame in JPEG format
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/face_mesh_video_feed')
def face_mesh_video_feed():
    return Response(face_mesh_feed(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/recognize', methods=['POST'])
def recognize_speech_from_file():
    # Get the audio file from the request
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']

    # Use the recognizer to recognize the speech in the audio file
    with sr.AudioFile(audio_file) as source:
        audio_data = recognizer.record(source)  # Read the entire audio file
        try:
            # Recognize speech using Google Web Speech API
            recognized_text = recognizer.recognize_google(audio_data)
            return jsonify({'recognized_text': recognized_text}), 200
        except sr.UnknownValueError:
            return jsonify({'error': 'Could not understand audio'}), 400
        except sr.RequestError as e:
            return jsonify({'error': f'Could not request results from Google Speech Recognition service; {e}'}), 500

if __name__ == '__main__':
    threading.Thread(target=recognize_speech).start()
    app.run(port=5000) 