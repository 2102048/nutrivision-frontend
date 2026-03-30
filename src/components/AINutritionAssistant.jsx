import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Square, 
  Sparkles,
  AlertCircle
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

const AINutritionAssistant = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const sendMessageRef = useRef(null);

  const utteranceRef = useRef(null);
  const isPausedRef = useRef(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi 👋 I’m NutriVision Intelligence. I’ve analyzed your app data. How can I help with your diet today?"
    }
  ]);

  const token = localStorage.getItem("access_token");

  // =========================
  // 🔊 VOICE LOGIC
  // =========================
  const stopSpeech = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    isPausedRef.current = false;
  }, []);

  const speak = useCallback((text) => {
    if (isMuted) return;

    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utteranceRef.current = utterance;
    isPausedRef.current = false;

    utterance.onend = () => {
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  }, [isMuted, stopSpeech]);

  // =========================
  // ✉️ SEND MESSAGE
  // =========================
  const sendMessage = async (voiceInput = null) => {
    const finalMessage = typeof voiceInput === "string" ? voiceInput : input;
    const isVoice = typeof voiceInput === "string";

    if (!finalMessage.trim()) return;

    if (!token) return;

    stopSpeech();

    setMessages((prev) => [...prev, { role: "user", text: finalMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: finalMessage,
          session_id: "user-session"
        })
      });

      if (res.status === 401) {
        alert("Unauthorized. Please login again.");
        return;
      }

      const data = await res.json();
      const aiReply =
        data.reply ||
        "I'm having trouble accessing your app data right now.";

      setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);

      if (isVoice && !isMuted) {
        speak(aiReply);
      }
    } catch (error) {
      console.error("❌ AI ERROR:", error);
      const errorMsg =
        "⚠️ Connection error. Please ensure the backend is running.";
      setMessages((prev) => [...prev, { role: "ai", text: errorMsg }]);
      if (isVoice && !isMuted) speak(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  // =========================
  // 🎤 SPEECH RECOGNITION
  // =========================
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendMessageRef.current(transcript);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => stopSpeech();
  }, [stopSpeech]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    stopSpeech();
    setListening(true);
    recognitionRef.current.start();
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newState = !prev;
      if (newState) {
        window.speechSynthesis.pause();
        isPausedRef.current = true;
      } else if (isPausedRef.current) {
        window.speechSynthesis.resume();
        isPausedRef.current = false;
      }
      return newState;
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto bg-white rounded-2xl md:rounded-4xl shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden h-[90vh] md:h-162.5 transition-all">

      {/* HEADER */}
      <div className="bg-white px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg shadow-blue-200">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">
              NutriVision Intelligence
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <p className="text-[9px] md:text-[10px] text-blue-600 font-bold uppercase tracking-widest">
                Internal App Data Synced
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={toggleMute}
            className={`p-2 md:p-2.5 rounded-xl transition-all ${
              isMuted
                ? "text-red-500 bg-red-50"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={stopSpeech}
            className="p-2 md:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Square size={14} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 bg-[#f8fafc]/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] md:max-w-[80%] px-4 md:px-5 py-2.5 md:py-3.5 rounded-[18px] md:rounded-[22px] text-sm shadow-sm ${
                msg.role === "ai"
                  ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  : "bg-blue-600 text-white rounded-tr-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border px-4 py-2.5 rounded-[18px] flex gap-2 shadow-sm">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* INPUT */}
      <div className="p-3 md:p-6 bg-white border-t border-slate-100">
        <div className="flex items-center w-full gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl md:rounded-3xl">

          {/* INPUT */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your diet..."
            className="flex-1 min-w-0 bg-transparent outline-none px-2 md:px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          {/* MIC BUTTON */}
          <button
            onClick={startListening}
            className={`shrink-0 p-2.5 md:p-3 rounded-xl transition-all ${
              listening
                ? "bg-red-500 text-white animate-pulse"
                : "text-slate-400 hover:bg-slate-200"
            }`}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* SEND BUTTON */}
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="shrink-0 bg-blue-600 text-white p-2.5 md:p-3 rounded-xl disabled:bg-slate-200"
          >
            <Send size={18} />
          </button>
        </div>

        {!token && (
          <div className="mt-2 text-[10px] text-red-500 text-center">
            Session Inactive - Login to Sync Data
          </div>
        )}
      </div>
    </div>
  );
};

export default AINutritionAssistant;