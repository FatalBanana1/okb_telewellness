import React, { useState, useEffect, useRef } from "react";
import { db, auth } from '../../../firebase/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { useRouter } from 'next/router';
import {BlobManager} from '../../components/chatapp/BlobManager';

const MessageComposer: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [psychiatristId, setPsychiatristId] = useState('');
  const [patientId, setPatientId] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uid = auth.currentUser?.uid;

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedString, setRecordedString] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isAUdio = useRef<boolean>(false);

  useEffect(() => {
    const { psych_id, psych_name, patient_id, patient_name } = router.query;
    if (psych_name) {
      setPsychiatristId(psych_id as string);
      setPatientId(uid as string);
    } else if (patient_name) {
      setPatientId(patient_id as string);
      setPsychiatristId(uid as string);
    }
  }, [router.query]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    const participants = [patientId, psychiatristId];
    const photoURL = auth.currentUser?.photoURL;
    const messagesRef = collection(db, "Chats");
    console.log(participants)

    if (message !== "" && psychiatristId && patientId) {
      // Send the message
      if (uid === patientId) {
        try {
          await addDoc(messagesRef, {
            text: message,
            createdAt: serverTimestamp(),
            uid: participants[0],
            recipientId: participants[1],
            photoURL,
            deletedByPatient: false,
            deletedByPsych: false
          });
          console.log("Message sent");
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      } else if (uid === psychiatristId) {
        try {
          await addDoc(messagesRef, {
            text: message,
            createdAt: serverTimestamp(),
            uid: participants[1],
            recipientId: participants[0],
            photoURL,
            deletedByPatient: false,
            deletedByPsych: false
          });
          console.log("Message sent");
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }

      // Handle the conversation
      const conversationsRef = collection(db, "Conversations");
      const q = query(conversationsRef, where("patientId", "==", patientId), where("psychiatristId", "==", psychiatristId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Create a new conversation if not found
        try {
          await addDoc(conversationsRef, {
            patientId: patientId,
            psychiatristId: psychiatristId,
            deletedByPatient: false,
            deletedByPsych: false,
            messagesUnreadByPatient: uid === psychiatristId ? 1 : 0,
            messagesUnreadByPsych: uid === patientId ? 1 : 0,
            recentMessage: {
              text: message,
              createdAt: serverTimestamp(),
              photoURL
            }
          });
          console.log("New conversation created");
        } catch (error) {
          console.error("Error creating new conversation: ", error);
        }
      } else {
        // Update existing conversation
        const conversationDocRef = doc(db, "Conversations", querySnapshot.docs[0].id);
        try {
          await updateDoc(conversationDocRef, {
            deletedByPatient: false,
            deletedByPsych: false,
            recentMessage: {
              text: message,
              createdAt: serverTimestamp(),
              photoURL
            },
            [`messagesUnreadBy${uid === patientId ? 'Psych' : 'Patient'}`]: querySnapshot.docs[0].data()[`messagesUnreadBy${uid === patientId ? 'Psych' : 'Patient'}`] + 1
          });
          console.log("Conversation updated with new message");
        } catch (error) {
          console.error("Error updating conversation: ", error);
        }
      }

      setMessage('');
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

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
            
            // Create a URL for the blob and set it to audioUrl
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            
            // Convert blob to base64 string (proper method for binary data)
            const blobAsString = await BlobManager.blobToString(blob);
            console.log(blobAsString);
            
            // Set message content as string representation of audio
            setMessage(blobAsString);
            
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


  return (
    <div className="message-composer page-background py-2">
      <div className="flex items-center rounded-3xl border-solid border border-black pl-2 mx-4">
        {audioUrl ? (
          <div className="flex items-center w-full px-2">
            <audio src={audioUrl} controls className="w-full h-8" />
            <button
              type="button"
              onClick={() => {
                setAudioUrl(null);
                setMessage('');
              }}
              className="ml-2 rounded-full bg-gray-500 text-white p-1 h-8 w-8 flex items-center justify-center"
              title="Delete recording"
            >
              ✕
            </button>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={message}
            onInput={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a Message"
            className="page-background w-full overflow-auto m-0 px-5 font-montserrat italic text-[12px]"
            style={{ resize: "none", outline: "none", height: "auto" }}
            rows={1}
          ></textarea>
        )}

        <button
          type="button"
          onClick={toggleRecording}
          className={`rounded-full text-white font-bold px-2 mx-4 my-2 font-montserrat ${isRecording ? 'bg-red-500' : ''}`}
          style={{ backgroundColor: isRecording ? '#FF0000' : '#195BA5' }}
        >
          {isRecording ? 'Stop' : 'Voice'}
        </button>

        <button
          type="button"
          onClick={sendMessage}
          className="rounded-full text-white font-bold px-2 mx-4 my-2 font-montserrat"
          style={{ backgroundColor: '#195BA5' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;