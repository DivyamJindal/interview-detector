import { useEffect, useState } from 'react';

const SpeechRecognitionPage = () => {
    const [recognizedText, setRecognizedText] = useState('');

    const startRecording = async () => {
        await fetch('http://localhost:5000/start', { method: 'POST' });
    };

    const stopRecording = async () => {
        const response = await fetch('http://localhost:5000/stop', { method: 'POST' });
        const data = await response.json();
        setRecognizedText(data.recognized_text);
    };

    return (
        <div>
            <h1>Speech Recognition</h1>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
            <p>Recognized Text: {recognizedText}</p>
            <h2>Webcam Feed</h2>
            <img src="http://localhost:5000/video_feed" alt="Webcam Feed" style={{ width: '100%', height: 'auto' }} />
        </div>
    );
};

export default SpeechRecognitionPage; 