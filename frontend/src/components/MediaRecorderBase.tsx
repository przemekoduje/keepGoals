import React, { useState, useRef, useEffect } from 'react';
import { uploadAudio, uploadVideo } from '../services/api';
import { Loader2 } from 'lucide-react';

type MediaType = 'audio' | 'video';
type RecordState = 'inactive' | 'recording' | 'paused' | 'uploading';

interface MediaRecorderBaseProps {
  onUploadSuccess?: () => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

// ─── Stała konfiguracja ────────────────────────────────────────────────────
const RING_BUFFER_MS = 2000;   // 2 s pre-recording
const TIMESLICE_MS   = 100;    // granulacja chunk-ów MediaRecorder
const MAX_RING_CHUNKS = Math.ceil(RING_BUFFER_MS / TIMESLICE_MS); // = 20

/** Wybiera najlepszy obsługiwany MIME type audio dla MediaRecorder */
function bestAudioMime(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

export const MediaRecorderBase: React.FC<MediaRecorderBaseProps> = ({
  onUploadSuccess,
  isOpenExternal,
  onCloseExternal,
}) => {
  // ─── UI State ─────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen]               = useState(false);
  const [mode, setMode]                   = useState<MediaType>('audio');
  const [recordState, setRecordState]     = useState<RecordState>('inactive');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError]                 = useState<string | null>(null);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [isWarmingUp, setIsWarmingUp]     = useState(false);
  const [audioLevel, setAudioLevel]       = useState(0);

  // ─── Video refs ───────────────────────────────────────────────────────────
  const videoRecorderRef  = useRef<MediaRecorder | null>(null);
  const videoChunksRef    = useRef<Blob[]>([]);
  const videoStreamRef    = useRef<MediaStream | null>(null);
  const videoRef          = useRef<HTMLVideoElement>(null);

  // ─── Audio ring-buffer refs ───────────────────────────────────────────────
  const audioRecorderRef      = useRef<MediaRecorder | null>(null);  // ciągły recorder
  const audioStreamRef        = useRef<MediaStream | null>(null);
  const ringBufferRef         = useRef<Blob[]>([]);  // rolling 2-s bufor
  const mainChunksRef         = useRef<Blob[]>([]);  // chunks po kliknięciu "Nagraj"
  const preSnapshotRef        = useRef<Blob[]>([]);  // snapshot bufora w chwili naciśnięcia
  const isCapturingRef        = useRef<boolean>(false);

  // ─── Audio level analysis refs ────────────────────────────────────────────
  const audioCtxRef     = useRef<AudioContext | null>(null);
  const analyserRef     = useRef<AnalyserNode | null>(null);
  const animFrameRef    = useRef<number | null>(null);

  // ─── Timer / warmup ───────────────────────────────────────────────────────
  const timerRef        = useRef<number | null>(null);
  const warmupTimeoutRef = useRef<number | null>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);

  // ─── Obsługa pliku z dysku ─────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetMode = file.type.startsWith('video/') ? 'video' : 'audio';
    await performUpload(file, targetMode);
  };

  // ─── External open/close sync ─────────────────────────────────────────────
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
      if (isOpenExternal) setMode('audio');
    }
  }, [isOpenExternal]);

  // ─── Inicjalizacja warmup przy otwarciu modalu w trybie audio ─────────────
  useEffect(() => {
    if (isOpen && mode === 'audio') {
      initAudioWarmup();
    } else {
      cleanupAudioWarmup();
    }
  }, [isOpen, mode]);

  // ─── Cleanup przy odmontowaniu komponentu ─────────────────────────────────
  useEffect(() => {
    return () => {
      cleanupAudioWarmup();
      stopVideoTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIO WARMUP — MediaRecorder + AnalyserNode (bez ScriptProcessorNode)
  // ═══════════════════════════════════════════════════════════════════════════

  const initAudioWarmup = async () => {
    try {
      cleanupAudioWarmup();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioStreamRef.current = stream;

      // Poziom głośności — AnalyserNode + rAF
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        if (!analyserRef.current) return;
        const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(buf);
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
        setAudioLevel(Math.min(100, Math.round(avg * 2)));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);

      // Ciągły MediaRecorder → ring buffer
      const mime = bestAudioMime();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      audioRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size === 0) return;
        if (isCapturingRef.current) {
          // Jesteśmy w trybie nagrywania → chunk do głównego bufora
          mainChunksRef.current.push(e.data);
        } else {
          // Pre-recording → ring buffer (rolling window)
          ringBufferRef.current.push(e.data);
          while (ringBufferRef.current.length > MAX_RING_CHUNKS) {
            ringBufferRef.current.shift();
          }
        }
      };

      mr.start(TIMESLICE_MS);
    } catch (err) {
      console.error('initAudioWarmup failed:', err);
    }
  };

  const cleanupAudioWarmup = () => {
    // Zatrzymaj warmupTimeout
    if (warmupTimeoutRef.current) {
      clearTimeout(warmupTimeoutRef.current);
      warmupTimeoutRef.current = null;
    }

    // Zatrzymaj animację poziomu głośności
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Rozłącz analyser
    if (analyserRef.current) {
      try { analyserRef.current.disconnect(); } catch {}
      analyserRef.current = null;
    }

    // Zamknij AudioContext
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }

    // Zatrzymaj MediaRecorder (cichy stop — bez await)
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      try { audioRecorderRef.current.stop(); } catch {}
    }
    audioRecorderRef.current = null;

    // Zatrzymaj strumień
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }

    // Wyczyść bufory
    isCapturingRef.current = false;
    ringBufferRef.current = [];
    mainChunksRef.current = [];
    preSnapshotRef.current = [];
    setAudioLevel(0);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VIDEO helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const stopVideoTracks = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // START RECORDING
  // ═══════════════════════════════════════════════════════════════════════════

  const startRecording = async (targetMode: MediaType) => {
    setError(null);
    setMode(targetMode);

    if (targetMode === 'audio') {
      // Warmup 300 ms — w tym czasie ring buffer ma czas zebrać próbki
      setIsWarmingUp(true);
      setRecordState('recording');
      setRecordingTime(0);

      if (warmupTimeoutRef.current) clearTimeout(warmupTimeoutRef.current);
      warmupTimeoutRef.current = window.setTimeout(() => {
        setIsWarmingUp(false);

        // Snapshot ring-buffera jako pre-recording
        preSnapshotRef.current = [...ringBufferRef.current];
        // Zeruj główny bufor i zacznij przechwytywanie
        mainChunksRef.current = [];
        isCapturingRef.current = true;

        // Timer wyświetlający czas nagrania
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      }, 300);

    } else {
      // ── Nagrywanie wideo (bez zmian) ──
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Brak dostępu do API mediów. Upewnij się, że używasz HTTPS lub localhost.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'environment' },
        });
        videoStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        let mime = '';
        if (MediaRecorder.isTypeSupported('video/webm')) mime = 'video/webm';
        else if (MediaRecorder.isTypeSupported('video/mp4')) mime = 'video/mp4';

        const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        videoRecorderRef.current = mr;

        mr.ondataavailable = (e) => {
          if (e.data.size > 0) videoChunksRef.current.push(e.data);
        };
        mr.onstop = async () => {
          const blob = new Blob(videoChunksRef.current, { type: mr.mimeType || 'video/webm' });
          await performUpload(blob, 'video');
        };

        videoChunksRef.current = [];
        mr.start(1000);

        setRecordState('recording');
        setRecordingTime(0);
        timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);

      } catch (err: any) {
        setError(
          err.name === 'NotSupportedError'
            ? 'Format nagrywania nie jest wspierany na Twoim urządzeniu.'
            : 'Brak dostępu do mikrofonu/kamery.'
        );
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STOP RECORDING
  // ═══════════════════════════════════════════════════════════════════════════

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (mode === 'audio') {
      setRecordState('uploading');

      // Zapamiętaj MIME przed zatrzymaniem
      const mimeType = audioRecorderRef.current?.mimeType || bestAudioMime() || 'audio/webm';

      // Zatrzymaj MediaRecorder i poczekaj na ostatni ondataavailable
      // (isCapturingRef nadal true → ostatni chunk trafi do mainChunksRef)
      await new Promise<void>((resolve) => {
        const mr = audioRecorderRef.current;
        if (mr && mr.state !== 'inactive') {
          mr.addEventListener('stop', () => resolve(), { once: true });
          mr.stop();
        } else {
          resolve();
        }
      });

      // Teraz wyłącz flagę przechwytywania
      isCapturingRef.current = false;

      // Złącz: [pre-recording 2s] + [główne nagranie]
      const allBlobs = [...preSnapshotRef.current, ...mainChunksRef.current];

      if (allBlobs.length === 0) {
        setError('Nie udało się nagrać dźwięku. Sprawdź uprawnienia mikrofonu.');
        setRecordState('inactive');
        return;
      }

      const combinedBlob = new Blob(allBlobs, { type: mimeType });

      // Cleanup zasobów PRZED uploadem (nie będą już potrzebne)
      cleanupAudioWarmup();
      await performUpload(combinedBlob, 'audio');

    } else {
      // Wideo
      if (videoRecorderRef.current?.state === 'recording') {
        videoRecorderRef.current.stop();
        stopVideoTracks();
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CANCEL RECORDING
  // ═══════════════════════════════════════════════════════════════════════════

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    cleanupAudioWarmup();

    if (videoRecorderRef.current?.state === 'recording') {
      videoRecorderRef.current.stop();
      stopVideoTracks();
    }

    setRecordState('inactive');
    setIsOpen(false);
    videoChunksRef.current = [];
    setRecordingTime(0);
    setIsVideoExpanded(false);
    if (onCloseExternal) onCloseExternal();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // UPLOAD
  // ═══════════════════════════════════════════════════════════════════════════

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
      videoChunksRef.current = [];
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
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (isOpenExternal !== undefined && !isOpen) return null;

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
              <div className="flex flex-col items-center justify-center space-y-3">
                {isWarmingUp ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#143109]" />
                    <span className="text-xs text-slate-500 font-bold animate-pulse">Rozgrzewanie mikrofonu...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end justify-center space-x-1 h-12 w-full px-4">
                      {[...Array(9)].map((_, i) => {
                        const factor = 1 - Math.abs(i - 4) * 0.15;
                        const height = Math.max(6, Math.round((audioLevel / 100) * 40 * factor));
                        return (
                          <div
                            key={i}
                            style={{ height: `${height}px` }}
                            className="w-1.5 bg-[#143109] rounded-full transition-all duration-75"
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs text-emerald-600 font-extrabold tracking-wider uppercase animate-pulse flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Mów teraz</span>
                    </span>
                  </>
                )}
              </div>
            )}

            {mode === 'audio' && recordState === 'inactive' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-300 dark:text-slate-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            )}

            {recordState === 'uploading' && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#143109] border-t-transparent"></div>
                <span className="text-xs font-bold mt-2 text-[#143109]">Wysyłanie...</span>
              </div>
            )}

            {(recordState === 'recording' || recordState === 'uploading') && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full font-mono font-bold z-10">
                {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {recordState === 'inactive' && (
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => { setMode('audio'); startRecording('audio'); }}
                  className="flex-1 py-3 bg-[#D0D6B3] hover:bg-[#D0D6B3]/80 text-[#143109] rounded-xl text-sm font-bold transition-colors"
                >
                  Głos
                </button>
                <button
                  onClick={() => { setMode('video'); startRecording('video'); }}
                  className="flex-1 py-3 bg-[#AAAE7F] hover:bg-[#AAAE7F]/80 text-[#143109] rounded-xl text-sm font-bold transition-colors"
                >
                  Wideo
                </button>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-[#EFEFEF] hover:bg-[#D0D6B3]/40 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#143109] dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-2 border border-[#AAAE7F]/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 12 4.5M12 3v13.5" />
                </svg>
                <span>Wybierz plik z telefonu</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*,video/*"
                className="hidden"
              />
            </div>
          )}

          {recordState === 'recording' && (
            <button
              onClick={stopRecording}
              className="w-full py-3 bg-[#143109] text-[#F7F7F7] rounded-xl text-sm font-bold flex justify-center items-center space-x-2 shadow-sm hover:bg-[#143109]/90"
            >
              <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
              <span>Zakończ i Wyślij</span>
            </button>
          )}
        </div>
      )}

      {/* Przycisk aktywacji panelu (tylko gdy komponent nie jest sterowany z zewnątrz) */}
      {!isOpen && isOpenExternal === undefined && (
        <button
          onClick={() => { setIsOpen(true); setMode('audio'); }}
          className="w-14 h-14 bg-[#143109] text-[#F7F7F7] hover:scale-105 transition-transform duration-200 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </button>
      )}
    </div>
  );
};
