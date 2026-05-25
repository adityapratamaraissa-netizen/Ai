import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Brain, 
  Terminal, 
  BookOpen, 
  Paperclip, 
  X,
  Gauge, 
  Zap,
  ArrowRight,
  Menu
} from "lucide-react";
import { Message } from "../types";

// Standard web speech recognition reference
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface ChatAreaProps {
  messages: Message[];
  activeSessionId: string | null;
  modelType: "gpt" | "gemini" | "claude" | "dola";
  assistantType: "general" | "coding" | "study";
  thinkMode: boolean;
  onModelTypeChange: (model: "gpt" | "gemini" | "claude" | "dola") => void;
  onAssistantTypeChange: (ast: "general" | "coding" | "study") => void;
  onThinkModeToggle: () => void;
  onSendMessage: (content: string, imageUrl?: string) => Promise<void>;
  onRegenerateResponse: () => Promise<void>;
  isLoading: boolean;
  isPremium: boolean;
  onShowAuth: () => void;
  onToggleSidebar?: () => void;
}

export default function ChatArea({
  messages,
  activeSessionId,
  modelType,
  assistantType,
  thinkMode,
  onModelTypeChange,
  onAssistantTypeChange,
  onThinkModeToggle,
  onSendMessage,
  onRegenerateResponse,
  isLoading,
  isPremium,
  onShowAuth,
  onToggleSidebar
}: ChatAreaProps) {
  const [inputText, setInputText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Clipboard copied indicators per message ID
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Voice integration states
  const [isListening, setIsListening] = useState(false);
  const [speakMessageId, setSpeakMessageId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom anchor triggers
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clean speaking on session change
  useEffect(() => {
    stopSpeaking();
  }, [activeSessionId]);

  // Parse reasoning <thinking> tags
  const parseMessageReasoning = (content: string) => {
    const startTag = "<thinking>";
    const endTag = "</thinking>";
    
    if (content.includes(startTag) && content.includes(endTag)) {
      const startIndex = content.indexOf(startTag) + startTag.length;
      const endIndex = content.indexOf(endTag);
      const thinking = content.slice(startIndex, endIndex).trim();
      const mainContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();
      return { thinking, mainContent };
    }
    return { thinking: null, mainContent: content };
  };

  // Convert uploaded image file to lightweight base64
  const handleImageConversion = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Format berkas tidak didukung. Silakan unggah file gambar (PNG, JPEG, etc)");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        // High fidelity scaling boundary check in case user uploads heavy images
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 800; // optimized resolution logic to fit server packet caps
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const scaledBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setImagePreview(scaledBase64);
      };
    };
    reader.readAsDataURL(file);
  };

  // File Selector Input Handle
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageConversion(e.target.files[0]);
    }
  };

  // Drag and Drop implementation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageConversion(e.dataTransfer.files[0]);
    }
  };

  // Clipboard Copier
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Voice Speech Synthesis Handler
  const handleSpeak = (text: string, id: string) => {
    if ("speechSynthesis" in window) {
      if (speakMessageId === id) {
        stopSpeaking();
        return;
      }
      
      // Stop old synthesis
      window.speechSynthesis.cancel();
      
      // Clean up raw thinking tags from speaking text
      const { mainContent } = parseMessageReasoning(text);
      
      const utterance = new SpeechSynthesisUtterance(mainContent);
      utterance.lang = "id-ID"; // set natural Indonesian reader accent
      utterance.onend = () => {
        setSpeakMessageId(null);
      };
      utterance.onerror = () => {
        setSpeakMessageId(null);
      };

      setSpeakMessageId(id);
      synthesisUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Web Speech Synthesis tidak didukung pada browser Anda.");
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakMessageId(null);
  };

  // Voice Input Speech Recognition Handler
  const handleVoiceInput = () => {
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung Web Speech Recognition. Silakan gunakan Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "id-ID"; // listen for natural Indonesian syntax
    
    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputText((prev) => prev ? `${prev} ${transcript}` : transcript);
    };

    rec.onerror = (err: any) => {
      console.error("Speech Recognition error: ", err);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Message Sending
  const onSend = () => {
    if (!inputText.trim() && !imagePreview) return;
    
    onSendMessage(inputText, imagePreview || undefined);
    setInputText("");
    setImagePreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Quick prompt seeds for brainstorming/writing captions etc
  const promptSeeds = [
    { title: "Koding & Struktur", text: "Buatkan fungsi TypeScript lengkap untuk konversi desimal ke heksadesimal dengan validasi error." },
    { title: "Bantu Sekolah", text: "Jelaskan hukum mekanika newton 1, 2, dan 3 menggunakan analogi benda-benda di dalam rumah!" },
    { title: "Brainstorming", text: "Buatkan 5 ide judul startup AI tahun 2026 yang bersangkutan dengan to-do list terintegrasi radar." },
    { title: "Translate & Gaya", text: "Translate kalimat ini ke Bahasa Jepang formal: 'Saya sangat terbantu dengan penjelasan coding Anda, terima kasih.'" }
  ];

  return (
    <div 
      className={`flex-1 h-screen flex flex-col justify-between bg-[#040508]/95 relative ${
        dragActive ? "border-2 border-dashed border-[#00f2fe]/60 bg-slate-900/10" : ""
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      
      {/* Top Controller Ribbon */}
      <header className="border-b border-[#1e293b]/50 px-4 sm:px-6 py-4 backdrop-blur bg-[#040508]/85 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 hover:text-white cursor-pointer transition-all duration-200"
              title="Buka Menu Samping"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Model Presets Selector */}
          <div className="flex-1 sm:flex-none flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900/80 w-full">
          <button 
            onClick={() => onModelTypeChange("gpt")}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modelType === "gpt" 
                ? "bg-slate-900 border border-slate-800 text-[#00f2fe]" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Balanced
          </button>
          <button 
            onClick={() => onModelTypeChange("gemini")}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modelType === "gemini" 
                ? "bg-slate-900 border border-slate-800 text-pink-400" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Creative
          </button>
          <button 
            onClick={() => {
              if (!isPremium) {
                alert("Model Detailed adalah fitur premium sirkuit ZERO PRO. Silakan upgrade keanggotaan Anda di sidebar kiri.");
                return;
              }
              onModelTypeChange("claude");
            }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
              modelType === "claude" 
                ? "bg-slate-900 border border-[#9d4edd]/50 text-[#c77dff]" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Detailed
            {!isPremium && <span className="absolute top-[-4px] right-[-4px] w-2 h-2 rounded-full bg-[#9d4edd] animate-ping" />}
          </button>
          <button 
            onClick={() => {
              if (!isPremium) {
                alert("Model Planner adalah fitur premium sirkuit ZERO PRO. Silakan upgrade keanggotaan Anda di sidebar kiri.");
                return;
              }
              onModelTypeChange("dola");
            }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
              modelType === "dola" 
                ? "bg-slate-900 border border-[#4cc9f0]/50 text-[#4cc9f0]" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Planner
            {!isPremium && <span className="absolute top-[-4px] right-[-4px] w-2 h-2 rounded-full bg-[#4cc9f0] animate-ping" />}
          </button>
        </div>
      </div>

        {/* Assistant Mode & Think Mode Switch */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          
          {/* Assistant Persona */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-900/80">
            <button 
              onClick={() => onAssistantTypeChange("general")}
              className={`p-1.5 rounded-lg text-slate-400 transition-colors cursor-pointer ${assistantType === "general" ? "bg-slate-900 text-[#00f2fe]" : "hover:text-white"}`}
              title="Smart AI Assistant Mode"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onAssistantTypeChange("coding")}
              className={`p-1.5 rounded-lg text-slate-400 transition-colors cursor-pointer ${assistantType === "coding" ? "bg-slate-900 text-[#c77dff]" : "hover:text-white"}`}
              title="Expert Coding Assistant Mode"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onAssistantTypeChange("study")}
              className={`p-1.5 rounded-lg text-slate-400 transition-colors cursor-pointer ${assistantType === "study" ? "bg-slate-900 text-[#4cc9f0]" : "hover:text-white"}`}
              title="Study Tutor Assistant Mode"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

          {/* Think Mode Controller Button */}
          <button
            onClick={onThinkModeToggle}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
              thinkMode 
                ? "bg-gradient-to-r from-blue-950/40 to-slate-950 border-[#00f2fe]/65 shadow-[0_0_12px_rgba(0,242,254,0.15)] text-[#00f2fe]" 
                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain className={`w-3.5 h-3.5 ${thinkMode ? "animate-pulse" : ""}`} />
            <span>Think Mode {thinkMode ? "ON" : "OFF"}</span>
          </button>
        </div>

      </header>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 relative">
        
        {messages.length === 0 ? (
          /* Empty Chat Showoff and prompt seeds */
          <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center text-center">
            <div className="bg-gradient-to-tr from-[#00f2fe] via-[#9d4edd] to-indigo-600 p-4.5 rounded-2xl shadow-[0_4px_30px_rgba(157,78,221,0.25)] mb-6 animate-bounce">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">Hub Kecerdasan Terpadu</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-8 max-w-md antialiased leading-relaxed">
              Saya adalah super AI serbabisa dengan integrasi data tahun 2026. Pilih mode di atas untuk menyesuaikan respon jawaban.
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {promptSeeds.map((seed, ind) => (
                <div 
                  key={ind}
                  onClick={() => setInputText(seed.text)}
                  className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900/90 text-left hover:border-slate-700/60 transition-all cursor-pointer hover:bg-slate-900/10 text-xs text-slate-350"
                >
                  <p className="font-bold text-[#00f2fe] mb-1.5 flex items-center gap-1.5">
                    {ind === 0 && <Terminal className="w-3.5 h-3.5 text-[#c77dff]" />}
                    {ind === 1 && <BookOpen className="w-3.5 h-3.5 text-[#4cc9f0]" />}
                    {ind === 2 && <Brain className="w-3.5 h-3.5 text-[#00f2fe]" />}
                    {ind === 3 && <Sparkles className="w-3.5 h-3.5 text-pink-400" />}
                    {seed.title}
                  </p>
                  <p className="leading-relaxed opacity-85 truncate-multiline">{seed.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List of messages */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((m) => {
              const isUser = m.role === "user";
              const { thinking, mainContent } = parseMessageReasoning(m.content);

              return (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
                >
                  
                  {/* Meta Label above chat bubbles */}
                  <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                    {isUser ? "User Client" : `${modelType.toUpperCase()} AGENT • ${assistantType.toUpperCase()}`}
                  </span>

                  <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* Visual Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold leading-none border uppercase ${
                      isUser 
                        ? "bg-slate-900 border-[#00f2fe]/30 text-[#00f2fe]" 
                        : "bg-slate-950 border-[#9d4edd]/30 text-white"
                    }`}>
                      {isUser ? "U" : modelType[0]}
                    </div>

                    {/* Chat Bubble Layout */}
                    <div className="flex flex-col gap-2.5">
                      
                      {/* Attached images render */}
                      {m.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-800/80 max-w-sm mb-1.5 shadow-lg">
                          <img src={m.imageUrl} alt="Uploaded attachment context" referrerPolicy="no-referrer" className="w-full object-cover max-h-52" />
                        </div>
                      )}

                      {/* Expandable Thinking Card */}
                      {thinking && (
                        <div className="p-4 rounded-xl border border-blue-900/60 bg-blue-950/10 text-slate-300 flex flex-col gap-2 max-w-full shadow-inner">
                          <details className="group" open>
                            <summary className="text-xs font-black text-[#4cc9f0] hover:text-[#00f2fe] flex items-center gap-2 cursor-pointer list-none select-none">
                              <Brain className="w-3.5 h-3.5 text-[#00f2fe] animate-pulse" />
                              <span>ANALISIS BERPIKIR MENDALAM <span className="text-[10px] opacity-60">(Klik untuk perkecil)</span></span>
                              <span className="ml-auto text-[10px] opacity-50 group-open:rotate-180 transition-transform">&darr;</span>
                            </summary>
                            <p className="text-[11px] text-slate-400 font-mono border-t border-slate-900/80 pt-2.5 mt-2 whitespace-pre-wrap leading-relaxed">
                              {thinking}
                            </p>
                          </details>
                        </div>
                      )}

                      {/* Pure Content Bubble */}
                      <div className={`px-4 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words border ${
                        isUser 
                          ? "bg-gradient-to-tr from-[#1b1c2b] to-[#0d0e1b] border-[#00f2fe]/20 text-slate-100 shadow-[0_4px_12px_rgba(0,242,254,0.03)]" 
                          : "bg-slate-950 border-slate-900/60 text-slate-250 shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                      }`}>
                        
                        {/* If it's a code block format, we render it nicely inside mono box style if requested */}
                        {mainContent.includes("```") ? (
                          mainContent.split("```").map((block, idx) => {
                            if (idx % 2 === 1) {
                              const lines = block.split("\n");
                              const lang = lines[0] || "typescript";
                              const code = lines.slice(1).join("\n").trim();
                              return (
                                <div key={idx} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900/80">
                                  <div className="px-4 py-1.5 bg-slate-900 flex items-center justify-between border-b border-slate-850">
                                    <span className="text-[10px] font-mono text-slate-500">{lang} codebox</span>
                                    <button 
                                      onClick={() => handleCopy(code, m.id + idx)}
                                      className="p-1 rounded text-slate-500 hover:text-white transition-colors cursor-pointer"
                                    >
                                      {copiedId === m.id + idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed"><code>{code}</code></pre>
                                </div>
                              );
                            }
                            return <span key={idx}>{block}</span>;
                          })
                        ) : (
                          mainContent
                        )}

                      </div>

                      {/* Core interactive action controls underneath bubbles */}
                      <div className={`flex gap-3 px-1 mt-0.5 ${isUser ? "justify-end" : "justify-start"}`}>
                        <button 
                          onClick={() => handleCopy(mainContent, m.id)}
                          className="p-1.5 rounded-lg border border-slate-900/80 hover:border-slate-800 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                          title="Copy teks"
                        >
                          {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button 
                          onClick={() => handleSpeak(mainContent, m.id)}
                          className={`p-1.5 rounded-lg border border-slate-900/80 hover:border-slate-800 transition-colors cursor-pointer ${
                            speakMessageId === m.id ? "text-amber-400 border-amber-900 bg-amber-950/15" : "text-slate-500 hover:text-slate-200"
                          }`}
                          title="Speech Synthesis"
                        >
                          {speakMessageId === m.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                    </div>

                  </div>
                </motion.div>
              );
            })}

            {/* Simulated Live human interactive loader with realistic blinking cursor */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-2 items-start max-w-[85%]"
              >
                <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                  {modelType.toUpperCase()} AGENT IS ACTIVE • THINKING...
                </span>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 border border-brand-cyan/20 animate-pulse flex items-center justify-center text-xs font-mono font-bold text-slate-400 uppercase">
                    {modelType[0]}
                  </div>
                  <div className="flex flex-col gap-2 bg-slate-950 border border-slate-900/50 p-4 rounded-2xl flex-1 text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-ping" />
                      <span className="text-[11px] font-mono font-semibold text-[#00f2fe] tracking-wider uppercase">Merumuskan Resolusi Matematika & Semantik Kecepatan Tinggi</span>
                    </div>
                    <div className="flex gap-1 items-center font-mono text-slate-500 text-[11px]">
                      <span>ZERO AI terikat server &bull; Mengisi konteks</span>
                      <span className="cursor-blink h-3 w-1.5 pl-0.5 ml-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating User Input and tools area */}
      <div className="p-4 bg-[#040508] border-t border-[#1e293b]/50 relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          
          {/* File Image attachments preview pane */}
          {imagePreview && (
            <div className="p-3 bg-slate-950/90 border border-[#00f2fe]/20 rounded-xl max-w-sm flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <img src={imagePreview} alt="Thumbnail review" className="w-12 h-12 rounded object-cover border border-slate-800" />
                <div>
                  <p className="text-xs font-bold text-slate-300">Gambar berhasil divalidasi</p>
                  <p className="text-[9px] text-slate-500 font-mono">Siap dikontekstualisasikan via AI</p>
                </div>
              </div>
              <button 
                onClick={() => setImagePreview(null)}
                className="p-1 rounded-md bg-slate-900 border border-slate-800 hover:text-red-400 cursor-pointer"
                title="Batal lampirkan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Actions input and mic controls */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan apa saja ke ZERO AI... (Tekan Enter untuk kirim, Shift+Enter baris baru)"
              className="w-full py-4.5 pl-14 pr-24 bg-slate-950 border border-slate-800/85 rounded-2xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-violet-600/50 focus:ring-1 focus:ring-violet-600/10 transition-all font-sans resize-none h-14"
            />

            {/* Left buttons inside input box: File Uploader */}
            <div className="absolute left-3.5 top-3.5">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Lampirkan Gambar Multimodal"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Right buttons inside input box: Voice & Submit */}
            <div className="absolute right-3.5 top-3.5 flex items-center gap-2">
              
              {/* Voice recognition button */}
              <button
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isListening 
                    ? "bg-red-950/25 border-red-500 text-red-400 animate-pulse scale-105" 
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
                title={isListening ? "Mendengarkan... klik untuk berhenti" : "Input via Suara (Speech Rec)"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Submit CTA */}
              <button
                onClick={onSend}
                disabled={isLoading || (!inputText.trim() && !imagePreview)}
                className="p-2 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#9d4edd] text-black font-extrabold cursor-pointer hover:shadow-[0_0_12px_rgba(0,242,254,0.3)] transition-all disabled:opacity-40 disabled:hover:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>

            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono">
            <span>ZERO AI GATEWAY OK</span>
            <span>SECURE SERVER CHANNEL &bull; 256-BIT ENCRYPTION</span>
          </div>

        </div>
      </div>

    </div>
  );
}
