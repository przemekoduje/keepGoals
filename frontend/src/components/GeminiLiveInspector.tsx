import React, { useState, useRef, useEffect } from 'react';
import { sendLiveInspectionFrame, createNote } from '../services/api';
import { Loader2, Camera, Volume2, VolumeX, ShieldAlert, FileText, X, RefreshCw, Send, Sparkles, MessageSquare } from 'lucide-react';

interface DetectedIssue {
  id: string;
  title: string;
  description: string;
  recommended_action?: string;
  timestamp: string;
  frame_base64?: string;
}

interface GeminiLiveInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: () => void;
}

export const GeminiLiveInspector: React.FC<GeminiLiveInspectorProps> = ({
  isOpen,
  onClose,
  onReportCreated,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [, setIsListening] = useState(false);
  const [isMutedTTS, setIsMutedTTS] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [aiLastMessage, setAiLastMessage] = useState<string>("");
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [detectedIssues, setDetectedIssues] = useState<DetectedIssue[]>([]);
  const [inspectionLogs, setInspectionLogs] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([]);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef<boolean>(true);

  // Odblokowanie syntezy audio w przeglądarkach mobilnych po geście użytkownika
  const unlockSpeechAudio = () => {
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(u);
    }
  };

  const handleSendQuery = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    unlockSpeechAudio();
    setInputText("");
    triggerLiveAnalysis(text);
  };

  // ─── Start Camera & Proactive Scanning ────────────────────────────────────
  useEffect(() => {
    isComponentMounted.current = true;
    if (isOpen) {
      initCamera();
      initSpeechRecognition();
    } else {
      stopAllStreams();
    }
    return () => {
      isComponentMounted.current = false;
      stopAllStreams();
    };
  }, [isOpen, facingMode]);

  // Agent nasłuchuje dyktowania i odpowiada tylko po wypowiedzi lub na żądanie ekspertyzy

  const initCamera = async () => {
    try {
      setErrorMsg(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      let stream: MediaStream | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: true
        });
      } catch (e1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
        } catch (e2) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      if (!stream) {
        throw new Error("Nie udało się uzyskać strumienia z kamery.");
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Wideo play error:", playErr);
        }
      }
    } catch (err: any) {
      console.error("Camera init error:", err);
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setErrorMsg("Do podglądu z kamery na żywo na telefonie wymagane jest połączenie HTTPS.");
      } else {
        setErrorMsg("Brak dostępu do kamery. Upewnij się, że przyznano uprawnienia w przeglądarce.");
      }
    }
  };

  // ─── Speech Recognition (Speech to Text na żywo) ──────────────────────────
  const initSpeechRecognition = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn("Speech Recognition API nie jest obsługiwane w tej przeglądarce.");
      return;
    }

    try {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'pl-PL';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => {
        setIsListening(false);
        // Automatyczny restart nasłuchiwania w tle
        if (isComponentMounted.current && isOpen) {
          try { rec.start(); } catch {}
        }
      };

      rec.onresult = (e: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalText += e.results[i][0].transcript;
          } else {
            interimText += e.results[i][0].transcript;
          }
        }

        if (interimText) setUserTranscript(interimText);

        if (finalText.trim()) {
          const spoken = finalText.trim();
          setUserTranscript("");
          triggerLiveAnalysis(spoken);
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.error("Speech recognition error:", e);
    }
  };

  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // ─── Precyzyjne przechwytywanie klatki wideo ─────────────────────────────
  const captureFrameBase64 = (): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = Math.min(video.videoWidth, 960);
    canvas.height = Math.round((canvas.width / video.videoWidth) * video.videoHeight);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  };

  // ─── Wywołanie Analizy Gemini Live ─────────────────────────────────────────
  const triggerLiveAnalysis = async (userPrompt?: string) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    const frameB64 = captureFrameBase64();
    const nowTime = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (userPrompt) {
      setInspectionLogs(prev => [...prev, { role: 'user', text: userPrompt, time: nowTime }]);
    }

    try {
      const result = await sendLiveInspectionFrame({
        frame_base64: frameB64 || undefined,
        user_text: userPrompt || "",
        history: inspectionLogs.slice(-6)
      });

      if (!isComponentMounted.current) return;

      const aiText = (result.ai_response || "").trim();

      // Odpowiadamy i mówimy TYLKO gdy model wygenerował rzeczowy komentarz / wykrył usterkę
      if (aiText) {
        setAiLastMessage(aiText);
        setInspectionLogs(prev => [...prev, { role: 'assistant', text: aiText, time: nowTime }]);
        speakText(aiText);
      }

      // Jeśli wykryto usterkę technologiczną
      if (result.has_issue && result.issue_title) {
        const newIssue: DetectedIssue = {
          id: `issue-${Date.now()}`,
          title: result.issue_title,
          description: result.issue_description || aiText || "Wykryto nieprawidłowość techniczną",
          recommended_action: result.recommended_action || undefined,
          timestamp: nowTime,
          frame_base64: frameB64 || undefined
        };
        setDetectedIssues(prev => [newIssue, ...prev]);
      }

    } catch (err: any) {
      console.error("Gemini Live Error:", err);
    } finally {
      if (isComponentMounted.current) setIsAnalyzing(false);
    }
  };

  // ─── Synteza Mowy (Text To Speech - Głos Męski) ───────────────────────────
  const speakText = (text: string) => {
    if (!text || isMutedTTS || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 1.0;
    // Głęboki ton (0.80 - 0.84) dający profesjonalny męski głos lektora
    utterance.pitch = 0.82;

    const voices = window.speechSynthesis.getVoices();
    const polishVoices = voices.filter(v => v.lang.includes('pl') || v.lang.includes('PL'));
    
    // Szukanie męskiego głosu w języku polskim
    const maleVoice = polishVoices.find(v => 
      /jan|marek|adam|mateusz|krzysztof|paweł|michał|piotr|male|męski|lector/i.test(v.name)
    ) || polishVoices.find(v => !/zofia|ewa|paulina|agnieszka|monika|female|damski/i.test(v.name)) || polishVoices[0];

    if (maleVoice) {
      utterance.voice = maleVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // ─── Zapisywanie Raportu z Inspekcji jako Notatki ─────────────────────────
  const handleSaveReport = async () => {
    setIsSavingReport(true);
    try {
      const nowStr = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      let markdownContent = `# Raport Inspekcji Technicznej Nieruchomości\n\n`;
      markdownContent += `**Data inspekcji:** ${nowStr}\n`;
      markdownContent += `**Tryb analizy:** Gemini Live Multimodal AI\n\n`;

      if (detectedIssues.length > 0) {
        markdownContent += `### ⚠️ Wykryte Usterki i Uwagi Techniczne (${detectedIssues.length})\n\n`;
        detectedIssues.forEach((issue, idx) => {
          markdownContent += `#### ${idx + 1}. ${issue.title} [${issue.timestamp}]\n`;
          markdownContent += `- **Opis:** ${issue.description}\n`;
          if (issue.recommended_action) {
            markdownContent += `- **Zalecenia:** ${issue.recommended_action}\n`;
          }
          markdownContent += `\n`;
        });
      } else {
        markdownContent += `### ✅ Stan Techniczny Obiektu\n`;
        markdownContent += `Podczas inspekcji na żywo nie odnotowano krytycznych usterek konstrukcyjnych.\n\n`;
      }

      markdownContent += `### 💬 Przebieg Konwersacji z Asystentem Gemini Live\n\n`;
      inspectionLogs.forEach(log => {
        const prefix = log.role === 'user' ? '👤 Inspektor' : '🤖 Gemini Live';
        markdownContent += `* **[${log.time}] ${prefix}:** ${log.text}\n`;
      });

      await createNote({
        title: `Raport Inspekcji - ${nowStr}`,
        content: markdownContent,
        note_type: 'generic',
        is_pinned: true
      });

      if (onReportCreated) onReportCreated();
      onClose();
    } catch (e) {
      console.error("Report save error:", e);
      setErrorMsg("Błąd podczas zapisywania raportu.");
    } finally {
      setIsSavingReport(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden font-sans text-white select-none">
      
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Top Bar ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            Gemini Live • Inspekcja
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
            title="Przełącz kamerę"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setIsMutedTTS(!isMutedTTS)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 ${isMutedTTS ? 'bg-rose-500/30 text-rose-300' : 'bg-white/10 text-white'}`}
            title={isMutedTTS ? "Włącz głos AI" : "Wycisz głos AI"}
          >
            {isMutedTTS ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Camera Viewport ───────────────────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
        <video
          ref={(el) => {
            (videoRef as any).current = el;
            if (el && streamRef.current && el.srcObject !== streamRef.current) {
              el.srcObject = streamRef.current;
              el.play().catch(() => {});
            }
          }}
          playsInline
          autoPlay
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {errorMsg && (
          <div className="absolute top-20 left-4 right-4 z-30 bg-rose-900/90 border border-rose-500 text-rose-100 p-3 rounded-2xl text-xs font-semibold backdrop-blur-md">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ── Gemini AI Pulsing Live Ring ────────────────────────────────────── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <div className={`w-36 h-36 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
            isSpeaking ? 'border-cyan-400 bg-cyan-500/20 scale-110 shadow-[0_0_50px_rgba(34,211,238,0.5)]' :
            isAnalyzing ? 'border-purple-400 bg-purple-500/20 animate-spin shadow-[0_0_50px_rgba(192,132,252,0.5)]' :
            'border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.3)]'
          }`}>
            {isAnalyzing ? (
              <Loader2 className="w-10 h-10 text-purple-300 animate-spin" />
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10 text-cyan-300 animate-pulse" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <span className="mt-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide uppercase text-slate-200 border border-white/10">
            {isAnalyzing ? 'Gemini Analizuje obraz...' : isSpeaking ? 'Gemini Mówi...' : 'AI Słucha i Obserwuje'}
          </span>
        </div>

        {/* ── Subtitles / Live Transcript & AI Message ──────────────────────── */}
        <div className="absolute bottom-28 left-4 right-4 z-20 space-y-2 pointer-events-none">
          {userTranscript && (
            <div className="bg-black/70 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-xs text-amber-300 font-medium animate-in fade-in">
              🗣️ <strong>Ty:</strong> {userTranscript}
            </div>
          )}

          {aiLastMessage && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-4 rounded-2xl text-xs sm:text-sm text-cyan-100 font-medium shadow-xl animate-in slide-in-from-bottom-2">
              🤖 <strong>Gemini Live:</strong> {aiLastMessage}
            </div>
          )}
        </div>

        {/* ── Detected Issues Badge Feed ──────────────────────────────────────── */}
        {detectedIssues.length > 0 && (
          <div className="absolute top-20 left-4 max-w-[200px] space-y-1.5 z-20">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-black/60 px-2 py-0.5 rounded-md">
              Wykryte usterki ({detectedIssues.length}):
            </span>
            {detectedIssues.slice(0, 2).map((issue) => (
              <div key={issue.id} className="bg-rose-950/80 border border-rose-600/50 p-2 rounded-xl text-[11px] backdrop-blur-md text-rose-200">
                <div className="font-bold flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{issue.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Controls & Direct Chat Input Bar ──────────────────────────── */}
      <div className="p-3 sm:p-4 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col space-y-2.5 z-20">
        
        {/* Quick Inspection Suggestion Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => handleSendQuery("Czy widzisz tu jakiekolwiek usterki lub wady wykonawcze?")}
            disabled={isAnalyzing}
            className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 backdrop-blur-md flex items-center space-x-1.5 active:scale-95 transition-all"
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Sprawdź wady</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendQuery("Oceń jakość montażu i stan wykończenia tej powierzchni.")}
            disabled={isAnalyzing}
            className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 backdrop-blur-md flex items-center space-x-1.5 active:scale-95 transition-all"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Oceń montaż</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendQuery("Przeanalizuj kadr pod kątem norm budowlanych i parametrów rzeczoznawczych.")}
            disabled={isAnalyzing}
            className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 backdrop-blur-md flex items-center space-x-1.5 active:scale-95 transition-all"
          >
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span>Normy budowlane</span>
          </button>
        </div>

        {/* Form Input + Action Buttons */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Wpisz pytanie lub porozmawiaj z AI..."
              disabled={isAnalyzing}
              className="w-full py-3 pl-4 pr-10 bg-slate-900/90 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isAnalyzing}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dedykowany Przycisk Ekspertyzy AI */}
          <button
            type="button"
            onClick={() => handleSendQuery("Wykonaj pełną ekspertyzę i analizę techniczną tego kadru pod kątem norm budowlanych.")}
            disabled={isAnalyzing}
            className="py-3 px-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-amber-400/30 shadow-lg shadow-amber-950/40 disabled:opacity-50 shrink-0"
            title="Poproś o fachową opinię i ekspertyzę AI"
          >
            <Sparkles className="w-4 h-4 text-amber-100 animate-pulse" />
            <span className="font-extrabold text-[11px]">Ekspertyza AI</span>
          </button>

          {/* Skanuj Kadr Button */}
          <button
            type="button"
            onClick={() => handleSendQuery("Przeanalizuj ten kadr z kamery.")}
            disabled={isAnalyzing}
            className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center border border-white/10 backdrop-blur-md disabled:opacity-50 shrink-0"
            title="Skanuj Kadr"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Zapisz Raport Button */}
          <button
            type="button"
            onClick={handleSaveReport}
            disabled={isSavingReport}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950/50 disabled:opacity-50 shrink-0"
          >
            {isSavingReport ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Zapisz Raport</span>
          </button>
        </form>

      </div>

    </div>
  );
};
