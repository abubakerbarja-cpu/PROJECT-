
import React, { useState } from 'react';
import { LESSONS } from '../constants';
import { Lesson } from '../types';

const Academy: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="text-center mb-16 animate-in slide-in-from-top duration-700">
        <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
          أكاديمية المعرفة
        </h2>
        <p className="text-slate-400 text-xl font-bold max-w-2xl mx-auto">
          تعلّم سيرة نبيك محمد ﷺ وأمور دينك بأسلوب ممتع ومرتب لتصبح بطلاً في المعرفة!
        </p>
      </div>

      {/* Categories Tabs (Visual only for now) */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {['SEERAH', 'PRAYER', 'ETHICS', 'FAMILY', 'COMPANIONS'].map(cat => (
          <div key={cat} className="px-6 py-2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-sm font-black uppercase tracking-wider">
            {cat === 'SEERAH' ? 'السيرة' : cat === 'PRAYER' ? 'الصلاة' : cat === 'ETHICS' ? 'الأخلاق' : cat === 'FAMILY' ? 'البيت' : 'الصحابة'}
          </div>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {LESSONS.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => setSelectedLesson(lesson)}
            className={`group relative bg-slate-800/40 rounded-[2.5rem] border-2 border-slate-700 hover:border-emerald-500 transition-all cursor-pointer overflow-hidden transform hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)]`}
          >
            {/* Top Bar Color Decor */}
            <div className={`h-3 w-full bg-gradient-to-r ${lesson.color}`}></div>
            
            <div className="p-8">
              <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${lesson.color} flex items-center justify-center text-4xl shadow-lg mb-6 transform group-hover:rotate-6 transition-transform`}>
                {lesson.icon}
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {lesson.title}
              </h3>
              <p className="text-slate-500 font-bold mb-6 line-clamp-2 leading-relaxed">
                {lesson.subtitle}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-emerald-500 font-black text-sm">عرض الدرس 📖</span>
                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                   ←
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none text-9xl p-10 flex items-center justify-center">
               {lesson.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Detailed Modal Viewer */}
      {selectedLesson && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 w-full max-w-3xl rounded-[3.5rem] border-2 border-slate-700 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative my-8 animate-in zoom-in slide-in-from-bottom duration-500">
            
            {/* Header / Banner */}
            <div className={`w-full h-48 bg-gradient-to-br ${selectedLesson.color} relative overflow-hidden flex items-center justify-center rounded-t-[3.4rem]`}>
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full animate-pulse bg-white/20"></div>
               </div>
               <div className="relative text-8xl transform hover:scale-110 transition-transform cursor-default drop-shadow-2xl">
                 {selectedLesson.icon}
               </div>
               
               {/* Close Button */}
               <button 
                  onClick={() => setSelectedLesson(null)}
                  className="absolute top-6 left-6 w-14 h-14 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center text-2xl backdrop-blur-md transition-all z-20"
                >
                  ✕
                </button>
            </div>

            <div className="p-8 md:p-12 text-right">
              <div className="mb-10 text-center">
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-sm">
                  {selectedLesson.title}
                </h3>
                <p className="text-emerald-400 text-xl font-bold uppercase tracking-widest opacity-80">
                  {selectedLesson.subtitle}
                </p>
              </div>

              {/* Main Content */}
              <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-700/50 mb-10">
                <p className="text-2xl text-slate-200 leading-relaxed font-bold mb-8 italic">
                  "{selectedLesson.content}"
                </p>
                
                {/* Bullet Points */}
                <div className="space-y-4">
                  {selectedLesson.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-2xl border-r-4 border-emerald-500">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900 font-black shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-xl text-slate-300 font-bold leading-normal">{pt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takeaways Section */}
              <div className="mb-12">
                <h4 className="text-2xl font-black text-emerald-400 mb-6 flex items-center gap-3">
                  <span>ماذا نتعلم من هذا الدرس؟</span>
                  <span>💡</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLesson.takeaways.map((take, i) => (
                    <div key={i} className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-emerald-400 font-black text-lg text-center">
                      {take}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button 
                  onClick={() => setSelectedLesson(null)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-2xl py-6 px-20 rounded-[2rem] shadow-[0_15px_40px_rgba(16,185,129,0.3)] transform transition-all hover:scale-105 active:scale-95"
                >
                  فهمت الدرس، أحسنت! ⭐
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
