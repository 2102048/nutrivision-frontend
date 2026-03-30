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

const BASE_URL = import.meta.env.VITE_API_URL; // ✅ ADD THIS HERE


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

  // ✅ Authentication Token
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
    const finalMessage = typeof voiceInput === 'string' ? voiceInput : input;
    const isVoice = typeof voiceInput === 'string';

    if (!finalMessage.trim()) return;

    if (!token) {
      return;
    }

    stopSpeech();

    setMessages((prev) => [...prev, { role: "user", text: finalMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/ai-assistant`,  {
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
      const aiReply = data.reply || "I'm having trouble accessing your app data right now.";

      setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);

      if (isVoice && !isMuted) {
        speak(aiReply);
      }

    } catch (error) {
      console.error("❌ AI ERROR:", error);
      const errorMsg = "⚠️ Connection error. Please ensure the backend is running.";
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
    <div className="flex flex-col w-full max-w-250 mx-auto bg-white rounded-4xl shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden h-162.5 transition-all">
      
      {/* --- HEADER --- */}
      <div className="bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">NutriVision Intelligence</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Internal App Data Synced</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className={`p-2.5 rounded-xl transition-all ${isMuted ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:bg-slate-100'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={stopSpeech}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Stop Reading"
          >
            <Square size={16} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* --- MESSAGES WINDOW --- */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-[#f8fafc]/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-5 py-3.5 rounded-[22px] text-sm leading-relaxed shadow-sm transition-all ${
                msg.role === "ai"
                  ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  : "bg-blue-600 text-white shadow-blue-200 rounded-tr-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 px-5 py-3.5 rounded-[22px] flex gap-2 shadow-sm">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* --- INPUT FOOTER --- */}
      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-3xl focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-400 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your diet history or goals..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[15px] text-slate-700 placeholder:text-slate-400"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <div className="flex items-center gap-2 pr-1">
            <button
              onClick={startListening}
              className={`p-3 rounded-2xl transition-all ${
                listening 
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200" 
                  : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              }`}
            >
              {listening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        
        {!token && (
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-bold text-red-500 uppercase tracking-widest">
            <AlertCircle size={14} />
            Session Inactive - Login to Sync Data
          </div>
        )}
      </div>
    </div>
  );
};

export default AINutritionAssistant;