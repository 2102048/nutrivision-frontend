import { useState } from "react";

const VoiceFoodInput = ({ onText }) => {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    setListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      onText(text);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      alert("Voice recognition failed");
    };
  };

  return (
    <button
      type="button"
      onClick={startListening}
      className="bg-purple-600 text-white px-4 py-2 rounded-lg w-full mt-2"
    >
      {listening ? "Listening..." : "🎤 Speak Food"}
    </button>
  );
};

export default VoiceFoodInput;