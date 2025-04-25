import React, { useState, useRef } from 'react';
import {BlobManager} from '../components/chatapp/BlobManager';

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedString, setRecordedString] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      try {
        setRecordingStatus('Requesting microphone permission...');
        
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        // Create a MediaRecorder instance
        const mediaRecorder = new MediaRecorder(stream);
        
        // Set up event handlers
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          // Create a blob from the recorded chunks
          const blob = new Blob(chunksRef.current, { type: 'audio/ogg; codecs=opus' });
          
          // Convert blob to base64 string (proper method for binary data)
          const blobAsString = await BlobManager.blobToString(blob);
          setRecordedString(blobAsString);
          
          // Reset chunks for next recording
          chunksRef.current = [];
          
          // Release microphone
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          
          setRecordingStatus('Recording stopped and saved.');
        };
        
        // Start recording
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingStatus('Recording in progress...');
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setRecordingStatus(`Error: ${error instanceof Error ? error.message : 'Failed to access microphone'}`);
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const convertAndPlay = () => {
    if (!recordedString) {
      setRecordingStatus('No recording available');
      return;
    }

    try {
      // Convert the base64 string back to a Blob
      const reconvertedBlob = BlobManager.stringToBlob(recordedString);
      
      // Create a URL for the reconverted blob
      const reconvertedUrl = URL.createObjectURL(reconvertedBlob);
      setAudioUrl(reconvertedUrl);
      
      setRecordingStatus('Successfully converted string back to audio and prepared for playback');
      console.log('Converted string back to blob for playback');
    } catch (error) {
      console.error('Error converting string to blob:', error);
      setRecordingStatus(`Error converting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="audio-recorder">
      <h2>Audio Recorder</h2>
      <p>Status: {recordingStatus || 'Ready'}</p>
      <button 
        onClick={toggleRecording}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: isRecording ? '#ff4433' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
      <button 
        onClick={convertAndPlay}
        disabled={!recordedString}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: !recordedString ? '#cccccc' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: recordedString ? 'pointer' : 'not-allowed',
        }}
      >
        Convert & Play
      </button>
      
      <p className="note">
        {isRecording 
          ? 'Click the button again to stop recording' 
          : 'Click the button to start recording audio'}
      </p>
      
      {audioUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Playback</h3>
          <audio controls src={audioUrl} style={{ width: '100%' }} />
        </div>
      )}
      
      <div className="instructions">
        <h3>Instructions:</h3>
        <ol>
          <li>Click the button to request microphone access</li>
          <li>Allow microphone access when prompted</li>
          <li>Speak into your microphone</li>
          <li>Click the button again to stop recording</li>
          <li>The audio will be converted to a string and logged to the console</li>
          <li>Click "Convert & Play" to convert the string back to a blob and play it</li>
        </ol>
      </div>
    </div>
  );
};

export default AudioRecorder;