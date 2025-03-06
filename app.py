from flask import Flask, jsonify, request, Response
import threading
import speech_recognition as sr
import cv2

app = Flask(__name__)

recognized_text = ""
is_recording = False
recognizer = sr.Recognizer()
cap = cv2.VideoCapture(0)  # Initialize webcam

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

if __name__ == '__main__':
    threading.Thread(target=recognize_speech).start()
    app.run(port=5000) 