import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface LandingProps {
  onStart: () => void;
  onLearn: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onLearn }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const generateGameIcon = async () => {
    setIsGenerating(true);
    setStatusMessage("جاري ابتكار الأيقونة...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = "A vibrant 3D app icon for a children's quiz game called 'اِمْرَح وَارْبَح' (which means Have Fun and Win). The icon features a cute, friendly lion character wearing a golden crown, triumphantly holding a golden trophy in one hand and a colorful book in the other. Behind the lion is a stylized prize wheel with segments in gold, emerald green, and bright red. The background is a deep navy blue with sparkling stars. The style is high-quality 3D digital art, playful, vibrant, and appealing to kids.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64Data = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }

      if (base64Data) {
        const localUrl = `data:image/png;base64,${base64Data}`;
        setIconUrl(localUrl);
        setStatusMessage("تم التوليد بنجاح! ✨");
      }
    } catch (error) {
      console.error("Error generating icon:", error);
      alert("عذراً، حدث خطأ أثناء توليد الأيقونة.");
      setStatusMessage("فشل التوليد ❌");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 animate-in fade-in zoom-in duration-700">
      
      {/* AI Generated Icon Showcase */}
      {iconUrl && (
        <div className="mb-8 animate-in zoom-in duration-500">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <img 
              src={iconUrl} 
              alt="Game Icon" 
              className="relative w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] shadow-2xl border-4 border-slate-900 object-cover"
            />
            <div className="absolute -top-3 -right-3 bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-black shadow-lg">أيقونة ذكية ✨</div>
          </div>
        </div>
      )}

      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-amber-500/20 blur-3xl rounded-full"></div>
        <h1 className="text-6xl md:text-8xl font-title text-amber-400 drop-shadow-2xl relative">
          اِمْرَح وَارْبَح
        </h1>
        <div className="mt-4 flex items-center justify-center gap-3 text-xl md:text-2xl text-slate-300 font-bold tracking-widest">
          <span>نلعب</span>
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>نتعلّم</span>
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>نرتقي</span>
        </div>
      </div>

      <p className="max-w-xl text-slate-400 text-lg md:text-xl leading-relaxed mb-12">
        اِمْرَح وَارْبَح لعبة أسئلة ثقافية تفاعلية، تجمع بين المتعة والتعلّم،
        تناسب الأبطال الصغار، وتقدّم أسئلة دينية، ثقافية، رياضية،
        وألغاز ممتعة بأسلوب تنافسي شيّق.
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
        <button
          onClick={onStart}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-black text-2xl py-5 rounded-2xl shadow-xl hover:shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
        >
          <span>ابدأ اللعب</span>
          <span className="text-3xl">▶</span>
        </button>
        
        <button
          onClick={onLearn}
          className="flex-1 bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 text-white font-bold text-xl py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
        >
          <span>📘 تعلّم السيرة</span>
        </button>
      </div>

      {/* AI Icon Generator Button */}
      <div className="mt-12">
        <button
          onClick={generateGameIcon}
          disabled={isGenerating}
          className="group relative flex flex-col items-center gap-3 px-6 py-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 hover:text-amber-400 transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${isGenerating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}>
              {isGenerating ? '⏳' : '🎨'}
            </span>
            <span className="font-bold text-sm">
              {isGenerating ? 'جاري التوليد...' : 'توليد أيقونة مميزة بالذكاء الاصطناعي'}
            </span>
          </div>
          {statusMessage && (
            <span className="text-xs text-amber-500 font-black animate-pulse">{statusMessage}</span>
          )}
        </button>
      </div>

      <div className="mt-16 flex gap-4 text-3xl opacity-50">
        <span>🕌</span>
        <span>📖</span>
        <span>🌙</span>
        <span>⚽</span>
        <span>🧠</span>
        <span>🏆</span>
      </div>
    </div>
  );
};

export default Landing;