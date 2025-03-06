'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';



const InterviewPage: React.FC = () => {
    const { theme } = useTheme();
    const [recognizedText, setRecognizedText] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [isRecording, setIsRecording] = useState<boolean>(false);
    /* const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    const startRecording = () => {
        SpeechRecognition.startListening();
        setIsRecording(true);
    };

    const stopRecording = () => {
        SpeechRecognition.stopListening();
        setIsRecording(false);
    }; */

    return (
        <div className="flex flex-col h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <header className="p-6 border-b shadow-sm" style={{ background: 'var(--header-bg)', borderColor: 'var(--card-border)' }}>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--header-text)' }}>
                    Interviewer Dashboard
                </h1>{/* 
                <button onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button> */}
            </header>

            <main className="flex-1 flex overflow-hidden relative" style={{ background: 'var(--background)' }}>
                {/* Video Feed with Face Mesh */}
                <div className="flex-1 p-4">
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--header-text)' }}>
                        Candidate Video Feed with Face Mesh
                    </h2>
                    <img src="http://localhost:5000/face_mesh_video_feed" alt="Face Mesh Feed" style={{ width: '100%', height: 'auto' }} />
                </div>

                {/* Recognized Speech */}
                <div className="flex-1 p-4">
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--header-text)' }}>
                        Recognized Speech
                    </h2>
                    <p className="border p-4 rounded" style={{ background: 'var(--card-bg)', color: 'var(--foreground)' }}>
                        {'No speech recognized yet.'}
                    </p>
                </div>
            </main>

            {/* Notes Section */}
            <footer className="p-6 border-t" style={{ background: 'var(--header-bg)', borderColor: 'var(--card-border)' }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--header-text)' }}>
                    Interview Notes
                </h2>
                <textarea
                    className="w-full h-32 p-4 rounded-lg resize-none transition-all duration-300 ease-in-out focus:ring-2"
                    style={{ 
                        background: 'var(--input-bg)', 
                        color: 'var(--foreground)', 
                        border: '1px solid var(--input-border)'
                    }}
                    placeholder="Take notes during the interview..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </footer>
        </div>
    );
};

export default InterviewPage; 