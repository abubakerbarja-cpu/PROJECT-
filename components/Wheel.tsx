
import React, { useState, useRef } from 'react';
import { WHEEL_VALUES } from '../constants';

interface WheelProps {
  onResult: (value: any) => void;
}

const Wheel: React.FC<WheelProps> = ({ onResult }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // صوت دوران العجلة
  const spinSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3'));

  const spin = () => {
    if (spinning) return;
    
    // تشغيل الصوت
    spinSound.current.currentTime = 0;
    spinSound.current.loop = true;
    spinSound.current.play().catch(e => console.log("Audio play blocked"));

    setSpinning(true);
    setSelectedIndex(null);
    
    const extraDegrees = 1800 + Math.random() * 360;
    const newRotation = rotation + extraDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      
      // إيقاف الصوت عند التوقف
      spinSound.current.pause();
      spinSound.current.loop = false;

      const actualRotation = newRotation % 360;
      const segmentAngle = 360 / WHEEL_VALUES.length;
      const index = Math.floor((360 - (actualRotation % 360)) / segmentAngle) % WHEEL_VALUES.length;
      
      setSelectedIndex(index);
      onResult(WHEEL_VALUES[index]);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center py-6">
      <h2 className="text-3xl font-black mb-8 text-amber-400 drop-shadow-lg flex items-center gap-3 animate-pulse">
        <span>عجلة النقاط والمفاجآت</span>
        <span>🎡</span>
      </h2>
      
      <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[16px] border-slate-800 shadow-[0_0_60px_rgba(245,158,11,0.2)] z-0"></div>
        <div className="absolute inset-[-8px] rounded-full border-4 border-amber-500/30 z-0"></div>
        
        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 z-40 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
           <div className="w-12 h-14 bg-amber-500" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full mt-1"></div>
        </div>
        
        <div 
          className="w-full h-full rounded-full border-[10px] border-slate-900 shadow-2xl overflow-hidden relative transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1) z-10 bg-slate-800"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {WHEEL_VALUES.map((item, idx) => {
            const angle = (360 / WHEEL_VALUES.length) * idx;
            const segmentAngle = 360 / WHEEL_VALUES.length;
            return (
              <div 
                key={idx}
                className={`absolute top-0 left-0 w-full h-full flex items-start justify-center text-white font-black text-center transition-all ${selectedIndex === idx ? 'brightness-150' : ''}`}
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '50% 50%',
                }}
              >
                <div 
                  className={`absolute top-0 w-full h-full bg-gradient-to-b ${item.color} border-l border-white/10`}
                  style={{
                    clipPath: `polygon(50% 50%, ${50 - 50 * Math.tan((segmentAngle/2 * Math.PI)/180)}% 0%, ${50 + 50 * Math.tan((segmentAngle/2 * Math.PI)/180)}% 0%)`
                  }}
                ></div>
                
                <div 
                  className="relative z-20 mt-12 md:mt-16 text-sm md:text-xl font-black drop-shadow-md select-none"
                >
                  <span className="block transform rotate-0">{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={spin}
          disabled={spinning}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-slate-900 border-[6px] border-amber-500 rounded-full z-30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:scale-110 active:scale-95 transition-all group"
        >
           <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex flex-col items-center justify-center text-slate-900 font-black">
             <span className="text-xl md:text-2xl group-hover:animate-bounce">لف!</span>
             <span className="text-xs opacity-80 uppercase tracking-tighter">Spin</span>
           </div>
           <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-white/20 rounded-full blur-sm"></div>
        </button>
      </div>

      <div className={`mt-10 h-28 flex flex-col items-center justify-center transition-all duration-500 ${selectedIndex !== null ? 'opacity-100 translate-y-0 scale-110' : 'opacity-0 translate-y-10 scale-90'}`}>
         {selectedIndex !== null && (
           <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/40 to-amber-500/20 backdrop-blur-xl px-16 py-6 rounded-[3rem] border-4 border-amber-500 shadow-[0_20px_50px_rgba(245,158,11,0.3)] flex flex-col items-center animate-in zoom-in duration-500">
             <span className="text-slate-300 text-sm font-black mb-1">نتيجة السحب هي:</span>
             <div className="flex items-center gap-4">
               <span className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                 {WHEEL_VALUES[selectedIndex].label}
               </span>
               <span className="text-4xl">⭐</span>
             </div>
           </div>
         )}
      </div>

      {!spinning && selectedIndex === null && (
        <div className="mt-6 text-slate-400 font-bold animate-pulse text-lg">
           اضغط على المركز لتبدأ المغامرة! 👆
        </div>
      )}
    </div>
  );
};

export default Wheel;
