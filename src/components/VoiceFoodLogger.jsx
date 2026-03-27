import { useState } from "react";

const VoiceFoodLogger = ({ onText, label = "🎤 Speak Food", className = "" }) => {

  const [listening, setListening] = useState(false);

  const handleVoice = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {

      const text = event.results[0][0].transcript;

      if (onText) {
        onText(text);
      }

    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <button
      onClick={handleVoice}
      className={`w-full ${className}`}
    >
      {listening ? "🎙️ Listening..." : label}
    </button>
  );
};

export default VoiceFoodLogger;