import React, { useState, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { uploadMedia } from '../services/mediaService';

const VoiceRecorder = ({ onUpload }) => {
  const { token } = useContext(AuthContext);

  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm"
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        // Convert to a File object
        const file = new File([blob], "voice_note.webm", {
          type: "audio/webm",
        });

        setUploading(true);

        try {
          const url = await uploadMedia(file, token);

          // Tell ChatWindow to send message
          onUpload(url, "audio");
        } catch (error) {
          console.error("Voice upload failed:", error);
          alert("Voice upload failed");
        }

        setUploading(false);
      };

      mediaRecorder.start();
      setRecording(true);

    } catch (err) {
      console.error("Recording failed:", err);
      alert("Microphone access blocked or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div>
      <button onClick={recording ? stopRecording : startRecording} disabled={uploading}>
        {recording ? "Stop Recording" : "Record Voice"}
      </button>

      {uploading && <p>Uploading voice...</p>}
    </div>
  );
};

export default VoiceRecorder;
