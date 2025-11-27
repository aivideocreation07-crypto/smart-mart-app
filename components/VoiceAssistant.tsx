import React, { useEffect, useState, useRef } from 'react';
import { Mic, Volume2, VolumeX } from 'lucide-react';
import { getVoiceGuidance } from '../services/geminiService';

interface VoiceAssistantProps {
  context: string;
  trigger: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ context, trigger }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  const [enabled, setEnabled] = useState(true);
  const lastContextRef = useRef<string>('');

  useEffect(() => {
    const speak = async () => {
      if (!enabled || !context || context === lastContextRef.current) return;
      lastContextRef.current = context;
      setIsSpeaking(true);
      try {
        const textToSpeak = await getVoiceGuidance(context);
        setMessage(textToSpeak);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'bn-BD';
        utterance.rate = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsSpeaking(false);
      }
    };
    speak();
  }, [context, trigger, enabled]);

  const toggleMute = () => {
    if (enabled) {
      window.speechSynthesis.cancel();
      setEnabled(false);
    } else {
      setEnabled(true);
      lastContextRef.current = ''; 
    }
  };

  if (!context) return null;

  return (
    <div className="fixed bottom-28 right-6 z-[60] flex flex-col items-end pointer-events-none">
      {isSpeaking && message && (
         <div className="glass-panel p-4 rounded-2xl mb-4 max-w-[250px] animate-fade-in-up pointer-events-auto border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-black/80 backdrop-blur-xl">
           <p className="text-white text-sm font-bengali leading-relaxed text-shadow">{message}</p>
           <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-black/80 absolute -bottom-2 right-6"></div>
         </div>
      )}
      
      <button 
        onClick={toggleMute}
        className={`pointer-events-auto w-14 h-14 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center relative ${enabled ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gray-800 border border-white/10'}`}
      >
        {enabled ? (
          <>
             {isSpeaking && <div className="absolute inset-0 rounded-full animate-ping bg-orange-500 opacity-20"></div>}
             <div className="relative z-10 text-white"><Volume2 size={24} /></div>
          </>
        ) : (
          <VolumeX size={24} className="text-gray-400" />
        )}
      </button>
    </div>
  );
};