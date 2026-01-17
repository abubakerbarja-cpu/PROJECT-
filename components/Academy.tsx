
import React, { useState } from 'react';
import { LESSONS } from '../constants';
import { Lesson } from '../types';

const Academy: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-8 px-4">
      {/* Header Section */}
      <div className="text-center mb-10 md:mb-16 animate-in slide-in-from-top duration-700">
        <h2 className="text-3xl md:text-7xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
          أكاديمية المعرفة
        </h2>
        <p className="text-slate-400 text-base md:text-xl font-bold max-w-2xl mx-auto">
          تعلّم سيرة نبيك محمد ﷺ وأمور دينك بأسلوب ممتع ومرتب لتصبح بطلاً في المعرفة!
        </p>
      </div>

      {/* Categories Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
        {['SEERAH', 'PRAYER', 'ETHICS', 'FAMILY', 'COMPANIONS'].map(cat => (
          <div key={cat} className="px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] md:text-sm font-black uppercase">
            {cat === 'SEERAH' ? 'السيرة' : cat === 'PRAYER' ? 'الصلاة' : cat === 'ETHICS' ? 'الأخلاق' : cat === 'FAMILY' ? 'البيت' : 'الصحابة'}
          </div>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {LESSONS.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => setSelectedLesson(lesson)}
            className={`group relative bg-slate-800/40 rounded-3xl md:rounded-[2.5rem] border-2 border-slate-700 hover:border-emerald-500 transition-all cursor-pointer overflow-hidden transform hover:-translate-y-1`}
          >
            <div className={`h-2 md:h-3 w-full bg-gradient-to-r ${lesson.color}`}></div>
            
            <div className="p-6 md:p-8 text-right">
              <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[1.5rem] bg-gradient-to-br ${lesson.color} flex items-center justify-center text-3xl md:text-4xl shadow-lg mb-4 md:mb-6`}>
                {lesson.icon}
              </div>
              
              <h3 className="text-xl md:text-2xl font-black text-white mb-2">
                {lesson.title}
              </h3>
              <p className="text-slate-500 font-bold text-sm md:text-base mb-4 line-clamp-2 leading-relaxed">
                {lesson.subtitle}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-emerald-500 font-black text-xs md:text-sm">📖 عرض الدرس</span>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                   ←
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal Viewer */}
      {selectedLesson && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-0 md:p-4 overflow-y-auto">
          <div className="bg-slate-800 w-full max-w-3xl min-h-screen md:min-h-0 md:rounded-[3.5rem] border-0 md:border-2 border-slate-700 shadow-2xl relative animate-in slide-in-from-bottom duration-500">
            
            {/* Header / Banner */}
            <div className={`w-full h-32 md:h-48 bg-gradient-to-br ${selectedLesson.color} relative flex items-center justify-center md:rounded-t-[3.4rem]`}>
               <div className="relative text-6xl md:text-8xl drop-shadow-2xl">
                 {selectedLesson.icon}
               </div>
               
               <button 
                  onClick={() => setSelectedLesson(null)}
                  className="absolute top-4 left-4 w-10 h-10 md:w-14 md:h-14 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center text-xl md:text-2xl backdrop-blur-md transition-all z-20"
                >
                  ✕
                </button>
            </div>

            <div className="p-6 md:p-12 text-right">
              <div className="mb-6 md:mb-10 text-center">
                <h3 className="text-2xl md:text-5xl font-black text-white mb-2">
                  {selectedLesson.title}
                </h3>
                <p className="text-emerald-400 text-sm md:text-xl font-bold opacity-80 uppercase tracking-widest">
                  {selectedLesson.subtitle}
                </p>
              </div>

              {/* Main Content */}
              <div className="bg-slate-900/40 p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-700/50 mb-6 md:mb-10">
                <p className="text-lg md:text-2xl text-slate-200 leading-relaxed font-bold mb-6 italic">
                  "{selectedLesson.content}"
                </p>
                
                <div className="space-y-3 md:space-y-4">
                  {selectedLesson.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-slate-800/50 rounded-xl md:rounded-2xl border-r-4 border-emerald-500">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900 font-black shrink-0 text-xs md:text-base">
                        {i + 1}
                      </div>
                      <p className="text-sm md:text-xl text-slate-300 font-bold leading-normal">{pt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takeaways Section */}
              <div className="mb-8 md:mb-12">
                <h4 className="text-lg md:text-2xl font-black text-emerald-400 mb-4 md:mb-6 flex items-center gap-2">
                  <span>ماذا نتعلم؟</span>
                  <span>💡</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {selectedLesson.takeaways.map((take, i) => (
                    <div key={i} className="p-4 md:p-6 bg-emerald-500/10 rounded-xl md:rounded-3xl border border-emerald-500/20 text-emerald-400 font-black text-sm md:text-lg text-center">
                      {take}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pb-8 md:pb-0">
                <button 
                  onClick={() => setSelectedLesson(null)}
                  className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl md:text-2xl py-4 md:py-6 px-12 md:px-20 rounded-2xl md:rounded-[2rem] shadow-xl hover:scale-105 transition-all"
                >
                  أحسنت يا بطل! ⭐
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academy;
