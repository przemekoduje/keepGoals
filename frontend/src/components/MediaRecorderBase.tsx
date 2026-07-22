import React, { useState, useRef, useEffect } from 'react';
import { uploadAudio, uploadVideo } from '../services/api';

type MediaType = 'audio' | 'video';
type RecordState = 'inactive' | 'recording' | 'paused' | 'uploading';

interface MediaRecorderBaseProps {
  onUploadSuccess?: () => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export const MediaRecorderBase: React.FC<MediaRecorderBaseProps> = ({
  onUploadSuccess,
  isOpenExternal,
  onCloseExternal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<MediaType>('audio');
  const [recordState, setRecordState] = useState<RecordState>('inactive');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
      if (isOpenExternal) {
        setMode('audio');
      }
    }
  }, [isOpenExternal]);

  useEffect(() => {
    return () => {
      stopTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async (targetMode: MediaType) => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Brak dostępu do API mediów. Upewnij się, że używasz połączenia HTTPS lub localhost.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: targetMode === 'video' ? { facingMode: 'environment' } : false,
      });
      streamRef.current = stream;

      if (targetMode === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      let mimeType = "";
      if (targetMode === "video") {
        if (MediaRecorder.isTypeSupported("video/webm")) mimeType = "video/webm";
        else if (MediaRecorder.isTypeSupported("video/mp4")) mimeType = "video/mp4";
      } else {
        if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
        else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
      }
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blobType = mediaRecorderRef.current?.mimeType || (targetMode === "video" ? "video/webm" : "audio/webm");
        const blob = new Blob(chunksRef.current, {
          type: blobType,
        });
        await performUpload(blob, targetMode);
      };

      chunksRef.current = [];
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      setRecordState('recording');
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.name === "NotSupportedError" ? "Format nagrywania nie jest wspierany na Twoim urządzeniu." : "Brak dostępu do mikrofonu/kamery.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
    }
    setRecordState('inactive');
    setIsOpen(false);
    chunksRef.current = [];
    setRecordingTime(0);
    setIsVideoExpanded(false);
    if (onCloseExternal) onCloseExternal();
  };

  const performUpload = async (blob: Blob, uploadMode: MediaType) => {
    setRecordState('uploading');
    try {
      if (uploadMode === 'audio') {
        await uploadAudio(blob);
      } else {
        await uploadVideo(blob);
      }
      setRecordState('inactive');
      setIsOpen(false);
      setRecordingTime(0);
      chunksRef.current = [];
      setIsVideoExpanded(false);
      if (onCloseExternal) onCloseExternal();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Wystąpił błąd podczas wysyłania.');
      setRecordState('inactive');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-6 right-6 flex-col items-end z-50 flex md:hidden">
      {isOpen && (
        <div className={`bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 p-4 mb-4 flex flex-col animate-in slide-in-from-bottom-5 transition-all duration-300 ${isVideoExpanded ? 'fixed inset-0 w-full h-full z-[100] m-0 rounded-none' : 'w-72 rounded-3xl'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {mode === 'audio' ? 'Nagranie Głosowe' : 'Notatka Wideo'}
            </span>
            <button onClick={cancelRecording} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-xl mb-3">
              {error}
            </div>
          )}

          <div className={`bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center mb-4 relative overflow-hidden transition-all duration-300 ${isVideoExpanded ? 'flex-1 bg-black' : 'min-h-32'}`}>
            {mode === 'video' && (
              <>
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full ${isVideoExpanded ? 'object-contain' : 'object-cover'}`}
                  muted
                  playsInline
                />
                <button 
                  onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                  className={`absolute ${isVideoExpanded ? 'top-6 right-6' : 'top-2 right-2'} z-20 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors`}
                >
                  {isVideoExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  )}
                </button>
              </>
            )}
            
            {mode === 'audio' && recordState === 'recording' && (
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-6 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                <div className="w-1.5 h-10 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_300ms]"></div>
                <div className="w-1.5 h-8 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                <div className="w-1.5 h-12 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                <div className="w-1.5 h-6 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_100ms]"></div>
              </div>
            )}

            {mode === 'audio' && recordState === 'inactive' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-300 dark:text-slate-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            )}

            {recordState === 'uploading' && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-pastel-purple-dark border-t-transparent"></div>
                <span className="text-xs font-bold mt-2 text-pastel-purple-dark">Wysyłanie...</span>
              </div>
            )}

            {(recordState === 'recording' || recordState === 'uploading') && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full font-mono font-bold z-10">
                {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {recordState === 'inactive' && (
            <div className="flex space-x-2">
              <button
                onClick={() => { setMode('audio'); startRecording('audio'); }}
                className="flex-1 py-3 bg-pastel-purple-light hover:bg-pastel-purple-light/80 text-pastel-purple-dark rounded-xl text-sm font-bold transition-colors"
              >
                Głos
              </button>
              <button
                onClick={() => { setMode('video'); startRecording('video'); }}
                className="flex-1 py-3 bg-pastel-blue-light hover:bg-pastel-blue-light/80 text-pastel-blue-dark rounded-xl text-sm font-bold transition-colors"
              >
                Wideo
              </button>
            </div>
          )}

          {recordState === 'recording' && (
            <button
              onClick={stopRecording}
              className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold flex justify-center items-center space-x-2 shadow-sm"
            >
              <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
              <span>Zakończ i Wyślij</span>
            </button>
          )}
        </div>
      )}

      {/* Przycisk aktywacji panelu */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-pastel-purple-light text-pastel-purple-dark hover:scale-105 transition-transform duration-200 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </button>
      )}
    </div>
  );
};
