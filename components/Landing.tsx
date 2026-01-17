import React from 'react';

interface LandingProps {
  onStart: () => void;
  onLearn: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onLearn }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 animate-in fade-in zoom-in duration-700">
      
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