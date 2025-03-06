'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Editor from '@monaco-editor/react';
import ResizableDivider from './ResizableDivider';

export default function InterviewSession() {
  const { theme, toggleTheme } = useTheme();
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('// Start coding here...');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [compileOutput, setCompileOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  
  // Panel sizing state
  const [editorWidth, setEditorWidth] = useState<number | null>(null);
  const [notesWidth, setNotesWidth] = useState<number>(384); // Default 96 * 4 = 384px
  const [outputHeight, setOutputHeight] = useState<number>(192); // Default 48 * 4 = 192px

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompileOutput('Compiling...');
    
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCompileOutput(result.output);
      } else {
        setCompileOutput(`Error: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setCompileOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsCompiling(false);
    }
  };

  // Load saved panel sizes from localStorage on component mount
  useEffect(() => {
    const savedEditorWidth = localStorage.getItem('editorWidth');
    const savedNotesWidth = localStorage.getItem('notesWidth');
    const savedOutputHeight = localStorage.getItem('outputHeight');
    
    if (savedNotesWidth) setNotesWidth(Number(savedNotesWidth));
    if (savedOutputHeight) setOutputHeight(Number(savedOutputHeight));
  }, []);
  
  // Save panel sizes to localStorage when they change
  useEffect(() => {
    if (notesWidth) localStorage.setItem('notesWidth', notesWidth.toString());
    if (outputHeight) localStorage.setItem('outputHeight', outputHeight.toString());
  }, [notesWidth, outputHeight]);
  
  // Handle horizontal resize between code editor and notes panel
  const handleHorizontalResize = (delta: number) => {
    const minWidth = 250;
    const maxWidth = Math.min(800, window.innerWidth * 0.6);
    const newNotesWidth = Math.max(minWidth, Math.min(maxWidth, notesWidth - delta));
    if (newNotesWidth !== notesWidth) {
      setNotesWidth(newNotesWidth);
    }
  };
  
  // Handle vertical resize for the output panel
  const handleVerticalResize = (delta: number) => {
    const minHeight = 100;
    const maxHeight = Math.min(500, window.innerHeight * 0.4);
    const newOutputHeight = Math.max(minHeight, Math.min(maxHeight, outputHeight + delta));
    if (newOutputHeight !== outputHeight) {
      setOutputHeight(newOutputHeight);
    }
  };
  
  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <header className="p-6 border-b shadow-sm" style={{ background: 'var(--header-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--header-text)' }}>
              John Smith - Senior Developer Interview
            </h1>
            <div className="flex items-center space-x-3 mt-3">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">Not Recording</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full transition-colors duration-200"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', border: '1px solid' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <svg className="w-10 h-10" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative" style={{ background: 'var(--background)' }}>
        {/* Left panel - Code Editor */}
        <div className="flex-1 relative" style={{ borderRight: 'none' }}>
          <div className="flex items-center space-x-4 p-4" style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 rounded-md focus:ring-2 transition-colors duration-200"
              style={{ 
                background: 'var(--input-bg)', 
                color: 'var(--foreground)', 
                border: '1px solid var(--input-border)',
                outline: 'none'
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className="px-5 py-2 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
              style={{ 
                background: 'var(--button-bg)', 
                color: 'var(--button-text)',
                borderColor: 'var(--button-bg)'
              }}
            >
              {isCompiling ? (
                <>
                  <svg className="animate-spin h-4 w-4 inline mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Compiling...</span>
                </>
              ) : (
                <span>Compile & Run</span>
              )}
            </button>
          </div>
          <Editor
            height="calc(100% - 3.5rem)"
            defaultLanguage={selectedLanguage}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        </div>
        
        {/* Resizable divider between code editor and notes */}
        <ResizableDivider 
          direction="horizontal" 
          onResize={handleHorizontalResize}
          className="z-10 flex items-center justify-center"
        />

        {/* Right panel - Notes */}
        <div 
          className="flex flex-col p-4 overflow-auto"
          style={{ 
            width: `${notesWidth}px`, 
            background: 'var(--card-bg)', 
            borderLeft: '1px solid var(--card-border)', 
            height: '100%',
          }}>
          {/* Video Feed from Flask API */}
          <h2 className="text-xl font-bold mb-4 mt-4" style={{ color: 'var(--header-text)' }}>
            Video Feed
          </h2>
          <img src="http://localhost:5000/video_feed" alt="Webcam Feed" style={{ width: '75%', height: 'auto' }} />

          {/* Mesh Video Feed */}
          <h2 className="text-xl font-bold mb-4 mt-4" style={{ color: 'var(--header-text)' }}>
            Mesh Video Feed
          </h2>
          <img src="http://localhost:5000/face_mesh_video_feed" alt="Webcam Mesh Feed" style={{ width: '75%', height: 'auto' }} />

          {/* Live Transcription */}
          <h2 className="text-xl font-bold mb-4 mt-4" style={{ color: 'var(--header-text)' }}>
            Transcription
          </h2>
          <p className="border p-4 rounded" style={{ background: 'var(--card-bg)', color: 'var(--foreground)' }}>
            {'Hello, I am Akash Dubey.'}
          </p>

          {/* Interview Notes */}
          <h2 className="text-xl font-bold mb-4 mt-4" style={{ color: 'var(--header-text)' }}>
            Interview Notes
          </h2>
          <textarea
            className="w-full h-[calc(100vh-24rem)] p-4 rounded-lg resize-none transition-all duration-300 ease-in-out focus:ring-2"
            style={{ 
              background: 'var(--input-bg)', 
              color: 'var(--foreground)', 
              border: '1px solid var(--input-border)',
              height: '24px'
            }}
            placeholder="Take notes during the interview..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </main>
      
      {/* Resizable divider for output panel */}
      <ResizableDivider 
        direction="vertical" 
        onResize={handleVerticalResize}
        className="z-10 flex items-center justify-center w-full"
      />

      {/* Compilation Output Panel */}
      <div 
        className="overflow-auto" 
        style={{ 
          height: `${outputHeight}px`, 
          borderTop: '1px solid var(--card-border)', 
          background: 'var(--card-bg)' 
        }}>
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Compilation Output</h3>
          <pre className="font-mono text-sm whitespace-pre-wrap p-3 rounded" style={{ background: 'var(--code-bg)', color: 'var(--foreground)', border: '1px solid var(--code-border)' }}>
            {compileOutput || 'No output yet. Click "Compile & Run" to see results.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
