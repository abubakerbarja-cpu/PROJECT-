
import React, { useState, useEffect, useRef } from 'react';
import { Player, Question, Category, Difficulty, HelperState } from '../types';
import { QUESTIONS } from '../constants';
import Wheel from './Wheel';

interface GameEngineProps {
  players: Player[];
  settings: {
    categories: Category[];
    level: Difficulty;
  };
  onGameOver: (players: Player[]) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ players: initialPlayers, settings, onGameOver }) => {
  const [players, setPlayers] = useState(initialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameState, setGameState] = useState<'WHEEL' | 'QUESTION' | 'RESULT' | 'PENALTY' | 'TRANSFERRED'>('WHEEL');
  const [currentWheelValue, setCurrentWheelValue] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timer, setTimer] = useState(30);
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string; subText?: string } | null>(null);
  const [isTransferred, setIsTransferred] = useState(false);
  
  // Helpers state for current question
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [isDoublePoints, setIsDoublePoints] = useState(false);

  // مراجع ملفات الصوت
  const correctSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'));
  const wrongSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3'));
  const tickSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1056/1056-preview.mp3')); // صوت تكتكة أوضح
  const timeoutSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3')); // صوت بوق عند انتهاء الوقت
  const helperSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3'));

  useEffect(() => {
    let interval: any;
    if (gameState === 'QUESTION' && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => {
          // تشغيل صوت التكتكة في آخر 5 ثوانٍ
          if (t <= 6 && t > 1) {
            tickSound.current.currentTime = 0;
            tickSound.current.play().catch(() => {});
          }
          return t - 1;
        });
      }, 1000);
    } else if (timer === 0 && gameState === 'QUESTION') {
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [gameState, timer]);

  const handleTimeout = () => {
    // تشغيل صوت انتهاء الوقت
    timeoutSound.current.currentTime = 0;
    timeoutSound.current.play().catch(() => {});

    if (!isTransferred) {
      const nextIdx = (currentPlayerIndex + 1) % players.length;
      setIsTransferred(true);
      setGameState('TRANSFERRED');
      
      setTimeout(() => {
        setCurrentPlayerIndex(nextIdx);
        setTimer(currentQuestion?.level === Difficulty.HARD ? 45 : 20);
        setGameState('QUESTION');
      }, 2500);
    } else {
      handleAnswer(-1);
    }
  };

  const handleWheelResult = (result: any) => {
    setCurrentWheelValue(result);
    setIsTransferred(false);
    setHiddenOptions([]);
    setIsDoublePoints(false);
    
    if (result.value === 'skip') {
      wrongSound.current.currentTime = 0;
      wrongSound.current.play().catch(() => {});
      setFeedback({ 
        isCorrect: false, 
        text: 'حظ سيئ جداً! 😭', 
        subText: 'تم تجاوز دورك هذه المرة بدون سؤال.' 
      });
      setGameState('PENALTY');
      return;
    }

    if (result.value === 'deduct') {
      const newPlayers = players.map((p, idx) => 
        idx === currentPlayerIndex ? { ...p, score: Math.max(0, p.score - 5) } : p
      );
      setPlayers(newPlayers);
      wrongSound.current.currentTime = 0;
      wrongSound.current.play().catch(() => {});
      setFeedback({ 
        isCorrect: false, 
        text: 'رااااحت عليك! 🔻', 
        subText: 'تم خصم 5 نقاط من رصيدك الحالي.' 
      });
      setGameState('PENALTY');
      return;
    }

    let available = QUESTIONS.filter(q => 
      settings.categories.includes(q.category) &&
      !usedQuestions.includes(q.id)
    );

    if (settings.level !== Difficulty.MIXED) {
      const filteredByLevel = available.filter(q => q.level === settings.level);
      if (filteredByLevel.length > 0) {
        available = filteredByLevel;
      }
    }

    if (available.length === 0) {
       alert("لقد أجبت على جميع الأسئلة المتاحة! أحسنت يا بطل.");
       onGameOver(players);
       return;
    }

    const q = available[Math.floor(Math.random() * available.length)];
    setCurrentQuestion(q);
    setTimer(q.level === Difficulty.HARD ? 60 : 30);
    setGameState('QUESTION');
  };

  const handleAnswer = (index: number) => {
    if (!currentQuestion) return;
    
    const isCorrect = index === currentQuestion.correctIndex;
    let points = 0;

    if (isCorrect) {
      points = currentWheelValue.value;
      if (isDoublePoints) points *= 2;
      correctSound.current.currentTime = 0;
      correctSound.current.play().catch(() => {});
    } else {
      wrongSound.current.currentTime = 0;
      wrongSound.current.play().catch(() => {});
    }

    const newPlayers = players.map((p, idx) => 
      idx === currentPlayerIndex ? { ...p, score: p.score + points } : p
    );
    setPlayers(newPlayers);
    setUsedQuestions([...usedQuestions, currentQuestion.id]);
    setFeedback({ 
      isCorrect, 
      text: isCorrect ? 'أحسنت! إجابة صحيحة ✅' : 'للأسف، إجابة خاطئة ❌',
      subText: !isCorrect && index === -1 ? 'انتهى الوقت تماماً وضاع السؤال!' : undefined
    });
    setGameState('RESULT');
  };

  // Helper usage functions
  const useDeleteTwo = () => {
    if (!currentQuestion || players[currentPlayerIndex].helpers.deleteTwo <= 0) return;
    
    helperSound.current.currentTime = 0;
    helperSound.current.play().catch(() => {});

    const correctIdx = currentQuestion.correctIndex;
    const allIndices = [0, 1, 2, 3];
    const incorrectIndices = allIndices.filter(i => i !== correctIdx);
    
    // Pick 2 random incorrect indices to hide
    const toHide: number[] = [];
    while (toHide.length < 2) {
      const rand = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)];
      if (!toHide.includes(rand)) toHide.push(rand);
    }
    
    setHiddenOptions(toHide);
    updateHelper('deleteTwo');
  };

  const useAddTime = () => {
    if (players[currentPlayerIndex].helpers.addTime <= 0) return;
    helperSound.current.currentTime = 0;
    helperSound.current.play().catch(() => {});
    setTimer(t => t + 20);
    updateHelper('addTime');
  };

  const useDoublePoints = () => {
    if (players[currentPlayerIndex].helpers.doublePoints <= 0 || isDoublePoints) return;
    helperSound.current.currentTime = 0;
    helperSound.current.play().catch(() => {});
    setIsDoublePoints(true);
    updateHelper('doublePoints');
  };

  const useSkip = () => {
    if (players[currentPlayerIndex].helpers.skip <= 0) return;
    helperSound.current.currentTime = 0;
    helperSound.current.play().catch(() => {});
    updateHelper('skip');
    nextTurn();
  };

  const updateHelper = (type: keyof HelperState) => {
    const newPlayers = players.map((p, idx) => {
      if (idx === currentPlayerIndex) {
        return {
          ...p,
          helpers: { ...p.helpers, [type]: p.helpers[type] - 1 }
        };
      }
      return p;
    });
    setPlayers(newPlayers);
  };

  const nextTurn = () => {
    const nextIdx = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIdx);
    setFeedback(null);
    setIsTransferred(false);
    setHiddenOptions([]);
    setIsDoublePoints(false);
    setGameState('WHEEL');
  };

  const activePlayer = players[currentPlayerIndex];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-10 bg-slate-800/80 p-5 rounded-[2rem] border border-slate-700 shadow-xl backdrop-blur-md">
        {players.map((p, idx) => (
          <div key={p.id} className={`flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-500 ${idx === currentPlayerIndex ? 'bg-amber-500 text-slate-900 shadow-lg scale-110 ring-4 ring-amber-500/20' : 'bg-slate-700 opacity-60'}`}>
            <span className="text-3xl">{p.avatar}</span>
            <div className="flex flex-col">
              <span className="font-black text-sm leading-tight">{p.name}</span>
              <span className={`font-black ${idx === currentPlayerIndex ? 'text-slate-900' : 'text-amber-400'}`}>{p.score} ⭐</span>
            </div>
          </div>
        ))}
      </div>

      {gameState === 'WHEEL' && (
        <div className="animate-in slide-in-from-bottom duration-500">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-slate-300">دور اللاعب: <span className="text-amber-400 font-black">{activePlayer.name}</span></h3>
          </div>
          <Wheel onResult={handleWheelResult} />
        </div>
      )}

      {gameState === 'TRANSFERRED' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-600/90 backdrop-blur-md text-white p-10 text-center animate-in fade-in zoom-in duration-300">
           <div className="text-9xl mb-8 animate-bounce">⏱️</div>
           <h2 className="text-6xl font-black mb-4">انتهى الوقت!</h2>
           <p className="text-3xl font-bold mb-8">السؤال ينتقل الآن إلى:</p>
           <div className="bg-white text-slate-900 px-12 py-6 rounded-[3rem] text-5xl font-black shadow-2xl flex items-center gap-6">
             <span>{players[(currentPlayerIndex + 1) % players.length].avatar}</span>
             <span>{players[(currentPlayerIndex + 1) % players.length].name}</span>
           </div>
           <p className="mt-8 text-xl font-bold opacity-80 italic">استعد للإجابة بسرعة! ⚡</p>
        </div>
      )}

      {gameState === 'QUESTION' && currentQuestion && (
        <div className="flex flex-col gap-8 animate-in zoom-in duration-300">
          {/* Question Box */}
          <div className={`bg-slate-800 rounded-[3rem] p-8 md:p-14 border-t-[12px] shadow-2xl relative pt-24 ${isTransferred ? 'border-red-500' : 'border-amber-500'}`}>
            
            {isTransferred && (
              <div className="absolute top-4 right-1/2 translate-x-1/2 bg-red-500 text-white px-6 py-1 rounded-full font-black text-sm animate-pulse">
                سؤال منقول! 🔄
              </div>
            )}

            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-slate-900 rounded-full border-[8px] border-slate-900 shadow-[0_15px_45px_rgba(245,158,11,0.5)] z-20 flex flex-col items-center justify-center overflow-hidden">
               <div className={`absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 ${isDoublePoints ? 'animate-ping opacity-50' : 'animate-pulse'}`}></div>
               <div className="relative flex flex-col items-center justify-center text-slate-900 font-black leading-none">
                  <span className="text-[12px] uppercase opacity-70 mb-1">جائزة</span>
                  <span className="text-4xl drop-shadow-sm">{isDoublePoints ? currentWheelValue.value * 2 : currentWheelValue.value}</span>
                  <span className="text-[12px] opacity-70 mt-1">نقطة</span>
               </div>
            </div>

            <div className="flex justify-between items-center mb-10">
              <div className="bg-slate-700 px-6 py-3 rounded-full text-sm font-black text-amber-400 border border-slate-600 shadow-inner flex items-center gap-2">
                 <span className="opacity-50">التصنيف:</span>
                 <span>{currentQuestion.category}</span>
              </div>
              <div className={`w-20 h-20 rounded-2xl border-4 flex flex-col items-center justify-center font-black shadow-lg bg-slate-900 transition-all duration-300 ${timer <= 5 ? 'border-red-500 text-red-500 scale-110' : 'border-emerald-500 text-emerald-500'}`}>
                <span className="text-[10px] opacity-50 uppercase leading-none mb-1 text-center">الوقت</span>
                <span className="text-3xl leading-none">{timer}</span>
              </div>
            </div>

            <div className="mb-14 text-center">
              <h2 className="text-3xl md:text-5xl font-black leading-tight text-white drop-shadow-xl tracking-tight">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentQuestion.options.map((opt, idx) => {
                const isHidden = hiddenOptions.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={isHidden}
                    onClick={() => handleAnswer(idx)}
                    className={`group relative border-2 p-8 rounded-[2rem] text-2xl font-bold transition-all transform active:scale-95 flex items-center gap-6 overflow-hidden shadow-lg ${
                      isHidden 
                        ? 'bg-slate-900/50 border-slate-800 text-transparent cursor-default' 
                        : 'bg-slate-700/30 hover:bg-slate-700 border-slate-600 hover:border-amber-500 text-right text-white'
                    }`}
                  >
                    {!isHidden && (
                      <>
                        <span className="bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center text-amber-500 font-black shrink-0 z-10 shadow-inner border border-slate-700 group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </span>
                        <span className="flex-1 z-10 drop-shadow-sm group-hover:translate-x-[-6px] transition-transform">{opt}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Helpers Panel */}
          {!isTransferred && (
            <div className="bg-slate-800/60 p-6 rounded-[2.5rem] border border-slate-700 backdrop-blur-sm shadow-xl animate-in slide-in-from-bottom duration-700">
              <h4 className="text-center text-slate-400 font-black text-sm uppercase tracking-widest mb-6">وسائل المساعدة المتاحة 🧰</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={useDeleteTwo}
                  disabled={activePlayer.helpers.deleteTwo <= 0 || hiddenOptions.length > 0}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-700 hover:bg-slate-600 border-2 border-transparent hover:border-amber-500 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  <span className="text-3xl font-black text-amber-400 bg-slate-800 px-3 py-1 rounded-xl shadow-inner border border-slate-600">50:50</span>
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-xs mt-1">حذف خيارين</span>
                    <span className="text-[10px] opacity-50 mt-1">({activePlayer.helpers.deleteTwo}) متاحة</span>
                  </div>
                </button>
                <button
                  onClick={useAddTime}
                  disabled={activePlayer.helpers.addTime <= 0}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-700 hover:bg-slate-600 border-2 border-transparent hover:border-emerald-500 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  <span className="text-3xl">⏳</span>
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-xs">زيادة وقت</span>
                    <span className="text-[10px] opacity-50 mt-1">({activePlayer.helpers.addTime}) متاحة</span>
                  </div>
                </button>
                <button
                  onClick={useDoublePoints}
                  disabled={activePlayer.helpers.doublePoints <= 0 || isDoublePoints}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-700 hover:bg-slate-600 border-2 border-transparent hover:border-purple-500 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  <span className="text-3xl">💎</span>
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-xs">مضاعفة النقاط</span>
                    <span className="text-[10px] opacity-50 mt-1">({activePlayer.helpers.doublePoints}) متاحة</span>
                  </div>
                </button>
                <button
                  onClick={useSkip}
                  disabled={activePlayer.helpers.skip <= 0}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-700 hover:bg-slate-600 border-2 border-transparent hover:border-red-500 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  <span className="text-3xl">⏭️</span>
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-xs">تجاوز السؤال</span>
                    <span className="text-[10px] opacity-50 mt-1">({activePlayer.helpers.skip}) متاحة</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(gameState === 'RESULT' || gameState === 'PENALTY') && feedback && (
        <div className="text-center py-10 animate-in zoom-in duration-500">
          <div className={`text-9xl mb-8 drop-shadow-2xl ${feedback.isCorrect ? 'animate-bounce' : 'animate-shake'}`}>
            {gameState === 'PENALTY' ? '🚫' : (feedback.isCorrect ? '✨' : '❌')}
          </div>
          <h2 className={`text-6xl font-black mb-4 ${feedback.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {feedback.text}
          </h2>
          {feedback.subText && (
            <p className="text-slate-400 text-2xl font-bold mb-8">{feedback.subText}</p>
          )}
          {currentQuestion?.explanation && feedback.isCorrect && (
            <div className="bg-slate-800 border-4 border-emerald-500/20 p-10 rounded-[3rem] max-w-2xl mx-auto mb-12 shadow-2xl relative overflow-hidden text-right">
               <div className="absolute top-0 right-0 p-3 bg-emerald-500/20 text-emerald-400 text-sm font-black rounded-bl-2xl">معلومة تهمك 💡</div>
              <p className="text-slate-200 text-2xl leading-relaxed font-bold">{currentQuestion.explanation}</p>
            </div>
          )}
          <button
            onClick={nextTurn}
            className="bg-gradient-to-b from-amber-400 to-amber-600 text-slate-900 font-black text-3xl py-6 px-20 rounded-[2rem] shadow-[0_15px_40px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all border-b-8 border-amber-700 transform hover:scale-105 active:border-b-0 active:translate-y-2"
          >
            التالي ⏭️
          </button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
