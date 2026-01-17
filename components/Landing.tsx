
import React from 'react';

interface LandingProps {
  onStart: () => void;
  onLearn: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onLearn }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] text-center px-4 md:px-6 animate-in fade-in zoom-in duration-700">
      
      <div className="relative mb-6 md:mb-8">
        <div className="absolute -inset-4 bg-amber-500/20 blur-3xl rounded-full"></div>
        <h1 className="text-5xl md:text-8xl font-title text-amber-400 drop-shadow-2xl relative">
          اِمْرَح وَارْبَح
        </h1>
        <div className="mt-3 md:mt-4 flex items-center justify-center gap-2 md:gap-3 text-lg md:text-2xl text-slate-300 font-bold tracking-widest">
          <span>نلعب</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>نتعلّم</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>نرتقي</span>
        </div>
      </div>

      <p className="max-w-xl text-slate-400 text-base md:text-xl leading-relaxed mb-8 md:mb-12 px-2">
        اِمْرَح وَارْبَح لعبة أسئلة ثقافية تفاعلية، تجمع بين المتعة والتعلّم،
        تناسب الأبطال الصغار وتنمي ذكاءهم بأسلوب شيّق.
      </p>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-sm md:max-w-md">
        <button
          onClick={onStart}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-black text-xl md:text-2xl py-4 md:py-5 rounded-2xl shadow-xl hover:shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
        >
          <span>ابدأ اللعب</span>
          <span className="text-2xl">▶</span>
        </button>
        
        <button
          onClick={onLearn}
          className="flex-1 bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 text-white font-bold text-lg md:text-xl py-4 md:py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
        >
          <span>📘 تعلّم السيرة</span>
        </button>
      </div>

      <div className="mt-12 md:mt-16 flex gap-3 md:gap-4 text-2xl md:text-3xl opacity-40">
        <span>🕌</span> <span>📖</span> <span>🌙</span> <span>⚽</span> <span>🧠</span> <span>🏆</span>
      </div>
    </div>
  );
};

export default Landing;
