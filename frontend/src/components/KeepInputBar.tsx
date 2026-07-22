import React, { useState, useRef, useEffect } from "react";
import { createNote, uploadAudio, uploadVideo } from "../services/api";

interface KeepInputBarProps {
  onSuccess: () => void;
}

type InputMode = "text" | "list" | "drawing" | "image";
type RecordMode = "audio" | "video";
type RecordStatus = "inactive" | "recording" | "uploading";

interface ListItem {
  id: string;
  text: string;
  completed: boolean;
}

export const KeepInputBar: React.FC<KeepInputBarProps> = ({ onSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // List mode state
  const [listItems, setListItems] = useState<ListItem[]>([
    { id: "1", text: "", completed: false },
  ]);

  // Image mode state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Recording states
  const [recordMode, setRecordMode] = useState<RecordMode>("audio");
  const [recordStatus, setRecordStatus] = useState<RecordStatus>("inactive");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up previews and media on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      stopTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [imagePreviewUrl]);

  // Handle click outside to auto-save or close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        recordStatus === "inactive"
      ) {
        // Check if there is anything to save
        const hasContent =
          title.trim() ||
          (inputMode === "text" && content.trim()) ||
          (inputMode === "list" && listItems.some((item) => item.text.trim())) ||
          (inputMode === "image" && selectedImage) ||
          inputMode === "drawing"; // always check if canvas has drawing or just let it close/save

        if (hasContent) {
          handleSave();
        } else {
          resetAll();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [title, content, listItems, selectedImage, inputMode, recordStatus]);

  const resetAll = () => {
    setIsExpanded(false);
    setInputMode("text");
    setTitle("");
    setContent("");
    setListItems([{ id: "1", text: "", completed: false }]);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setSelectedImage(null);
    setError(null);
    setIsVideoExpanded(false);
  };

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Convert files or canvas to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      let finalContent = "";

      if (inputMode === "text") {
        finalContent = content.trim();
      } else if (inputMode === "list") {
        // Map list items to GFM Markdown check-list
        finalContent = listItems
          .filter((item) => item.text.trim() !== "")
          .map((item) => `- [${item.completed ? "x" : " "}] ${item.text.trim()}`)
          .join("\n");
      } else if (inputMode === "image" && selectedImage) {
        const base64Image = await fileToBase64(selectedImage);
        finalContent = `![Załączony Obraz](${base64Image})\n\n${content.trim()}`;
      } else if (inputMode === "drawing" && canvasRef.current) {
        // Convert canvas to Data URL base64 image
        const dataUrl = canvasRef.current.toDataURL("image/png");
        finalContent = `![Szkic odręczny](${dataUrl})\n\n${content.trim()}`;
      }

      // If nothing is written or drawn, just close
      if (!title.trim() && !finalContent.trim()) {
        resetAll();
        return;
      }

      await createNote({
        title: title.trim(),
        content: finalContent || "Pusta notatka",
        note_type: "daily_morning", // default type for quick notes
      });

      resetAll();
      onSuccess();
    } catch (err: any) {
      setError("Nie udało się zapisać notatki.");
    } finally {
      setLoading(false);
    }
  };

  // List mode handlers
  const handleAddListItem = (index: number) => {
    const newItems = [...listItems];
    newItems.splice(index + 1, 0, {
      id: Math.random().toString(36).substr(2, 9),
      text: "",
      completed: false,
    });
    setListItems(newItems);
    // Focus the new item on the next tick
    setTimeout(() => {
      const element = document.getElementById(`list-input-${index + 1}`);
      if (element) element.focus();
    }, 10);
  };

  const handleRemoveListItem = (index: number) => {
    if (listItems.length === 1) return;
    const newItems = listItems.filter((_, i) => i !== index);
    setListItems(newItems);
  };

  const handleUpdateListItem = (index: number, text: string) => {
    const newItems = [...listItems];
    newItems[index].text = text;
    setListItems(newItems);
  };

  const handleToggleListItem = (index: number) => {
    const newItems = [...listItems];
    newItems[index].completed = !newItems[index].completed;
    setListItems(newItems);
  };

  // Image mode handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setIsExpanded(true);
      setInputMode("image");
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Drawing mode Canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX = 0;
    let clientY = 0;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    lastXRef.current = clientX - rect.left;
    lastYRef.current = clientY - rect.top;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX = 0;
    let clientY = 0;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastXRef.current, lastYRef.current);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#3b82f6"; // beautiful digital ink color (blue-500)
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    lastXRef.current = x;
    lastYRef.current = y;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Recording methods
  const startRecording = async (mode: RecordMode) => {
    setIsExpanded(true);
    setRecordMode(mode);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === "video" ? { facingMode: "environment" } : false,
      });
      streamRef.current = stream;

      if (mode === "video" && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      let mimeType = "";
      if (mode === "video") {
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
        const blobType = mediaRecorderRef.current?.mimeType || (mode === "video" ? "video/webm" : "audio/webm");
        const blob = new Blob(chunksRef.current, {
          type: blobType,
        });
        setRecordStatus("uploading");
        try {
          if (mode === "audio") {
            await uploadAudio(blob);
          } else {
            await uploadVideo(blob);
          }
          setRecordStatus("inactive");
          setRecordingTime(0);
          chunksRef.current = [];
          resetAll();
          onSuccess();
        } catch (uploadErr: any) {
          setError(uploadErr.message || "Błąd wysyłania nagrania.");
          setRecordStatus("inactive");
        }
      };

      chunksRef.current = [];
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      setRecordStatus("recording");
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError(err.name === "NotSupportedError" ? "Format nagrywania nie jest wspierany na Twoim urządzeniu." : "Brak dostępu do kamery/mikrofonu.");
      setRecordStatus("inactive");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
    }
    setRecordStatus("inactive");
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      id="keep-input-bar"
      ref={containerRef}
      className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 overflow-hidden mb-8"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* COLLAPSED STATE */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="p-4 flex items-center justify-between cursor-text"
        >
          <span className="text-slate-400 dark:text-slate-500 font-medium">Utwórz notatkę...</span>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* New Checklist mode trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
                setInputMode("list");
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Nowa lista"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>

            {/* Drawing mode trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
                setInputMode("drawing");
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Nowy szkic"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122A3 3 0 0 0 10.47 18h3.06a3 3 0 0 0 .94-1.878l.254-2.032a3 3 0 0 0-.712-2.195L14 11.182V9.636h-4v1.545l-.012.011a3 3 0 0 0-.712 2.195l.254 2.032Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.909V3m0 2.909a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
              </svg>
            </button>

            {/* Image mode trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Nowa notatka ze zdjęciem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </button>

            {/* Audio Recorder Button - mobile only */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRecording("audio");
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors md:hidden"
              title="Nagraj notatkę głosową"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </button>

            {/* Video Recorder Button - mobile only */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRecording("video");
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors md:hidden"
              title="Nagraj notatkę wideo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* EXPANDED STATE */}
      {isExpanded && (
        <div className="flex flex-col">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/50 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {recordStatus === "inactive" ? (
            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Tytuł"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-lg"
              />

              {/* RENDER MODE: TEXT */}
              {inputMode === "text" && (
                <textarea
                  placeholder="Utwórz notatkę..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none text-sm leading-relaxed"
                />
              )}

              {/* RENDER MODE: LIST */}
              {inputMode === "list" && (
                <div className="space-y-2 py-2">
                  {listItems.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleListItem(index)}
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <input
                        id={`list-input-${index}`}
                        type="text"
                        placeholder="Element listy"
                        value={item.text}
                        onChange={(e) => handleUpdateListItem(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddListItem(index);
                          } else if (e.key === "Backspace" && item.text === "" && listItems.length > 1) {
                            e.preventDefault();
                            handleRemoveListItem(index);
                            setTimeout(() => {
                              const prevElement = document.getElementById(`list-input-${index - 1 >= 0 ? index - 1 : 0}`);
                              if (prevElement) prevElement.focus();
                            }, 10);
                          }
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-350 dark:placeholder-slate-650 text-sm py-0.5"
                      />
                      <button
                        onClick={() => handleRemoveListItem(index)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title="Usuń element"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddListItem(listItems.length - 1)}
                    className="text-xs text-blue-500 hover:text-blue-600 font-bold flex items-center space-x-1 mt-2 pl-6"
                  >
                    <span>+ Dodaj element</span>
                  </button>
                </div>
              )}

              {/* RENDER MODE: IMAGE */}
              {inputMode === "image" && imagePreviewUrl && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-60 bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
                    <img
                      src={imagePreviewUrl}
                      alt="Podgląd załącznika"
                      className="max-h-60 object-contain"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreviewUrl(null);
                        setInputMode("text");
                      }}
                      className="absolute top-2 right-2 bg-slate-900/80 text-white hover:bg-slate-950 p-1.5 rounded-full shadow-md"
                      title="Usuń zdjęcie"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    placeholder="Dodaj notatkę do zdjęcia..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none text-sm leading-relaxed"
                  />
                </div>
              )}

              {/* RENDER MODE: DRAWING */}
              {inputMode === "drawing" && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col items-center">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-[200px] cursor-crosshair touch-none"
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button
                        onClick={clearCanvas}
                        type="button"
                        className="px-2.5 py-1 bg-white/95 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-lg shadow font-semibold hover:bg-white dark:hover:bg-slate-750"
                      >
                        Wyczyść
                      </button>
                    </div>
                  </div>
                  <textarea
                    placeholder="Dodaj opis do szkicu..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none text-sm leading-relaxed"
                  />
                </div>
              )}
            </div>
          ) : (
            /* RECORDING DISPLAY */
            <div className={`flex flex-col items-center justify-center relative transition-all duration-300 ${isVideoExpanded ? 'fixed inset-0 z-[100] bg-black' : 'p-6 bg-slate-50 dark:bg-slate-900 min-h-[200px]'}`}>
              {recordMode === "video" && (
                <>
                  <video
                    ref={videoPreviewRef}
                    className={`absolute inset-0 w-full h-full ${isVideoExpanded ? 'object-contain' : 'object-cover'}`}
                    muted
                    playsInline
                  />
                  <button 
                    onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                    className={`absolute ${isVideoExpanded ? 'top-6 right-6' : 'top-4 right-4'} z-20 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors`}
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

              {recordMode === "audio" && recordStatus === "recording" && (
                <div className="flex items-center space-x-1 mb-4">
                  <div className="w-2 h-8 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_100ms]" />
                  <div className="w-2 h-14 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_300ms]" />
                  <div className="w-2 h-10 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_200ms]" />
                  <div className="w-2 h-16 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_400ms]" />
                  <div className="w-2 h-8 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_100ms]" />
                </div>
              )}

              {recordStatus === "uploading" && (
                <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-pastel-purple-dark border-t-transparent" />
                  <span className="text-sm font-bold mt-3 text-pastel-purple-dark dark:text-pastel-purple-light">Przetwarzanie nagrania przez AI...</span>
                </div>
              )}

              {recordStatus === "recording" && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-mono font-bold z-10 flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-2 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-1">
              {recordStatus === "inactive" ? (
                <>
                  {/* Mode selectors */}
                  <button
                    onClick={() => setInputMode("text")}
                    className={`p-2 rounded-full transition-colors ${inputMode === "text" ? "text-blue-500 bg-blue-50 dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                    title="Tekst"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setInputMode("list")}
                    className={`p-2 rounded-full transition-colors ${inputMode === "list" ? "text-blue-500 bg-blue-50 dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                    title="Checklista"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setInputMode("drawing")}
                    className={`p-2 rounded-full transition-colors ${inputMode === "drawing" ? "text-blue-500 bg-blue-50 dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                    title="Rysunek"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122A3 3 0 0 0 10.47 18h3.06a3 3 0 0 0 .94-1.878l.254-2.032a3 3 0 0 0-.712-2.195L14 11.182V9.636h-4v1.545l-.012.011a3 3 0 0 0-.712 2.195l.254 2.032Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.909V3m0 2.909a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-full transition-colors ${inputMode === "image" ? "text-blue-500 bg-blue-50 dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                    title="Dodaj obraz"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </button>

                  {/* Audio/Video recorders (mobile only shortcut) */}
                  <button
                    onClick={() => startRecording("audio")}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors md:hidden"
                    title="Nagraj audio"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={cancelRecording}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Anuluj
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              {recordStatus === "recording" ? (
                <button
                  onClick={stopRecording}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
                >
                  <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                  <span>Zakończ i analizuj</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={resetAll}
                    className="px-4 py-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold transition-colors"
                  >
                    Zamknij
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    {loading ? "Zapisywanie..." : "Zapisz"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
