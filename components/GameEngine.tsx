
import React, { useState, useEffect, useRef } from 'react';
import { Player, Question, Category, Difficulty, HelperState } from '../types';
import Wheel from './Wheel';

interface GameEngineProps {
  players: Player[];
  settings: {
    categories: Category[];
    level: Difficulty;
  };
  questions: Question[];
  onGameOver: (players: Player[]) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ players: initialPlayers, settings, questions, onGameOver }) => {
  const [players, setPlayers] = useState(initialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameState, setGameState] = useState<'WHEEL' | 'QUESTION' | 'RESULT' | 'PENALTY' | 'TRANSFERRED'>('WHEEL');
  const [currentWheelValue, setCurrentWheelValue] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timer, setTimer] = useState(30);
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string; subText?: string } | null>(null);
  const [isTransferred, setIsTransferred] = useState(false);
  
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [isDoublePoints, setIsDoublePoints] = useState(false);

  const correctSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'));
  const wrongSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3'));
  const tickSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1056/1056-preview.mp3'));
  const timeoutSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'));
  const helperSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3'));

  useEffect(() => {
    let interval: any;
    if (gameState === 'QUESTION' && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => {
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

    let available = questions.filter(q => 
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

  const useDeleteTwo = () => {
    if (!currentQuestion || players[currentPlayerIndex].helpers.deleteTwo <= 0) return;
    helperSound.current.currentTime = 0;
    helperSound.current.play().catch(() => {});
    const correctIdx = currentQuestion.correctIndex;
    const allIndices = [0, 1, 2, 3];
    const incorrectIndices = allIndices.filter(i => i !== correctIdx);
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
    <div className="max-w-4xl mx-auto py-4 md:py-8 px-2 md:px-4">
      {/* Players Header */}
      <div className="flex justify-between items-center mb-6 md:mb-10 bg-slate-800/80 p-3 md:p-5 rounded-2xl md:rounded-[2rem] border border-slate-700 shadow-xl backdrop-blur-md overflow-x-auto no-scrollbar gap-2">
        {players.map((p, idx) => (
          <div key={p.id} className={`flex items-center gap-2 md:gap-4 px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all duration-500 whitespace-nowrap ${idx === currentPlayerIndex ? 'bg-amber-500 text-slate-900 shadow-lg scale-105 ring-2 md:ring-4 ring-amber-500/20' : 'bg-slate-700 opacity-60'}`}>
            <span className="text-2xl md:text-3xl">{p.avatar}</span>
            <div className="flex flex-col">
              <span className="font-black text-[10px] md:text-sm leading-tight">{p.name}</span>
              <span className={`font-black text-xs md:text-base ${idx === currentPlayerIndex ? 'text-slate-900' : 'text-amber-400'}`}>{p.score} ⭐</span>
            </div>
          </div>
        ))}
      </div>

      {gameState === 'WHEEL' && (
        <div className="animate-in slide-in-from-bottom duration-500">
          <div className="text-center mb-4 md:mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-300">دور اللاعب: <span className="text-amber-400 font-black">{activePlayer.name}</span></h3>
          </div>
          <Wheel onResult={handleWheelResult} />
        </div>
      )}

      {gameState === 'TRANSFERRED' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-600/90 backdrop-blur-md text-white p-6 md:p-10 text-center animate-in fade-in zoom-in duration-300">
           <div className="text-6xl md:text-9xl mb-6 md:mb-8 animate-bounce">⏱️</div>
           <h2 className="text-4xl md:text-6xl font-black mb-4">انتهى الوقت!</h2>
           <p className="text-xl md:text-3xl font-bold mb-6 md:mb-8">السؤال ينتقل الآن إلى:</p>
           <div className="bg-white text-slate-900 px-8 py-4 md:px-12 md:py-6 rounded-2xl md:rounded-[3rem] text-2xl md:text-5xl font-black shadow-2xl flex items-center gap-4 md:gap-6">
             <span>{players[(currentPlayerIndex + 1) % players.length].avatar}</span>
             <span>{players[(currentPlayerIndex + 1) % players.length].name}</span>
           </div>
        </div>
      )}

      {gameState === 'QUESTION' && currentQuestion && (
        <div className="flex flex-col gap-4 md:gap-8 animate-in zoom-in duration-300">
          <div className={`bg-slate-800 rounded-3xl md:rounded-[3rem] p-5 md:p-14 border-t-[8px] md:border-t-[12px] shadow-2xl relative pt-16 md:pt-24 ${isTransferred ? 'border-red-500' : 'border-amber-500'}`}>
            {isTransferred && <div className="absolute top-2 md:top-4 right-1/2 translate-x-1/2 bg-red-500 text-white px-4 py-0.5 md:py-1 rounded-full font-black text-[10px] md:text-sm animate-pulse whitespace-nowrap">سؤال منقول! 🔄</div>}
            
            <div className="absolute -top-10 md:-top-16 left-1/2 -translate-x-1/2 w-20 h-20 md:w-32 md:h-32 bg-slate-900 rounded-full border-[6px] md:border-[8px] border-slate-900 shadow-xl z-20 flex flex-col items-center justify-center overflow-hidden">
               <div className={`absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 ${isDoublePoints ? 'animate-ping opacity-50' : ''}`}></div>
               <div className="relative flex flex-col items-center justify-center text-slate-900 font-black leading-none text-center">
                  <span className="text-[8px] md:text-[12px] uppercase opacity-70 mb-0.5">جائزة</span>
                  <span className="text-2xl md:text-4xl drop-shadow-sm">{isDoublePoints ? currentWheelValue.value * 2 : currentWheelValue.value}</span>
                  <span className="text-[8px] md:text-[12px] opacity-70 mt-0.5">نقطة</span>
               </div>
            </div>

            <div className="flex justify-between items-center mb-6 md:mb-10">
              <div className="bg-slate-700 px-3 py-1.5 md:px-6 md:py-3 rounded-full text-[10px] md:text-sm font-black text-amber-400 border border-slate-600 shadow-inner">
                 {currentQuestion.category}
              </div>
              <div className={`w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl border-2 md:border-4 flex flex-col items-center justify-center font-black shadow-lg bg-slate-900 transition-all ${timer <= 5 ? 'border-red-500 text-red-500' : 'border-emerald-500 text-emerald-500'}`}>
                <span className="text-xl md:text-3xl leading-none">{timer}</span>
              </div>
            </div>

            <div className="mb-8 md:mb-14 text-center">
              <h2 className="text-xl md:text-4xl lg:text-5xl font-black leading-snug text-white drop-shadow-xl">{currentQuestion.text}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              {currentQuestion.options.map((opt, idx) => {
                const isHidden = hiddenOptions.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={isHidden}
                    onClick={() => handleAnswer(idx)}
                    className={`group relative border-2 p-4 md:p-8 rounded-2xl md:rounded-[2rem] text-lg md:text-2xl font-bold transition-all transform active:scale-95 flex items-center gap-3 md:gap-6 overflow-hidden shadow-lg ${
                      isHidden ? 'bg-slate-900/50 border-slate-800 text-transparent cursor-default h-12 md:h-auto' : 'bg-slate-700/30 hover:bg-slate-700 border-slate-600 hover:border-amber-500 text-right text-white'
                    }`}
                  >
                    {!isHidden && (
                      <>
                        <span className="bg-slate-800 w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center text-amber-500 font-black shrink-0 z-10 border border-slate-700 text-sm md:text-xl">{idx + 1}</span>
                        <span className="flex-1 z-10 drop-shadow-sm">{opt}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {!isTransferred && (
            <div className="bg-slate-800/60 p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-slate-700 backdrop-blur-sm shadow-xl animate-in slide-in-from-bottom duration-700">
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                <button onClick={useDeleteTwo} disabled={activePlayer.helpers.deleteTwo <= 0 || hiddenOptions.length > 0} className="flex flex-col items-center gap-1 p-2 md:p-4 rounded-xl bg-slate-700 hover:bg-slate-600 border-2 border-transparent hover:border-amber-500 disabled:opacity-30 transition-all">
                  <span className="text-sm md:text-2xl font-black text-amber-400">50:50</span>
                  <span className="font-black text-[10px] md:text-xs">({activePlayer.helpers.deleteTwo})</span>
                </button>
                <button onClick={useAddTime} disabled={activePlayer.helpers.addTime <= 0} className="flex flex-col items-center gap-1 p-2 md:p-4 rounded-xl bg-slate-700 hover:bg-slate-600 border-2 border-transparent hover:border-emerald-500 disabled:opacity-30 transition-all">
                  <span className="text-xl md:text-2xl">⏳</span>
                  <span className="font-black text-[10px] md:text-xs">({activePlayer.helpers.addTime})</span>
                </button>
                <button onClick={useDoublePoints} disabled={activePlayer.helpers.doublePoints <= 0 || isDoublePoints} className="flex flex-col items-center gap-1 p-2 md:p-4 rounded-xl bg-slate-700 hover:bg-slate-600 border-2 border-transparent hover:border-purple-500 disabled:opacity-30 transition-all">
                  <span className="text-xl md:text-2xl">💎</span>
                  <span className="font-black text-[10px] md:text-xs">({activePlayer.helpers.doublePoints})</span>
                </button>
                <button onClick={useSkip} disabled={activePlayer.helpers.skip <= 0} className="flex flex-col items-center gap-1 p-2 md:p-4 rounded-xl bg-slate-700 hover:bg-slate-600 border-2 border-transparent hover:border-red-500 disabled:opacity-30 transition-all">
                  <span className="text-xl md:text-2xl">⏭️</span>
                  <span className="font-black text-[10px] md:text-xs">({activePlayer.helpers.skip})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(gameState === 'RESULT' || gameState === 'PENALTY') && feedback && (
        <div className="text-center py-6 md:py-10 animate-in zoom-in duration-500 px-4">
          <div className={`text-6xl md:text-9xl mb-6 md:mb-8 drop-shadow-2xl ${feedback.isCorrect ? 'animate-bounce' : 'animate-shake'}`}>{gameState === 'PENALTY' ? '🚫' : (feedback.isCorrect ? '✨' : '❌')}</div>
          <h2 className={`text-3xl md:text-6xl font-black mb-4 ${feedback.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.text}</h2>
          {feedback.subText && <p className="text-slate-400 text-lg md:text-2xl font-bold mb-6 md:mb-8">{feedback.subText}</p>}
          
          {currentQuestion?.explanation && feedback.isCorrect && (
            <div className="bg-slate-800 border-2 md:border-4 border-emerald-500/20 p-6 md:p-10 rounded-2xl md:rounded-[3rem] max-w-2xl mx-auto mb-8 md:mb-12 shadow-2xl text-right">
              <p className="text-slate-200 text-lg md:text-2xl leading-relaxed font-bold">{currentQuestion.explanation}</p>
            </div>
          )}
          
          <button onClick={nextTurn} className="w-full md:w-auto bg-gradient-to-b from-amber-400 to-amber-600 text-slate-900 font-black text-xl md:text-3xl py-4 md:py-6 px-12 md:px-20 rounded-2xl md:rounded-[2rem] shadow-xl hover:scale-105 active:translate-y-1 transition-all">التالي ⏭️</button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
