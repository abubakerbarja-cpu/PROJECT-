
import React, { useState, useEffect } from 'react';
import { Screen, GameMode, Player, Category, Difficulty, HelperState, Question } from './types';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import GameEngine from './components/GameEngine';
import Academy from './components/Academy';
import AdminPanel from './components/AdminPanel';
import { QUESTIONS as STATIC_QUESTIONS } from './constants';
import { db, isFirestoreAvailable } from './firebase';
import { collection, onSnapshot, addDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

const ADMIN_PASSWORD = '2025'; // كلمة المرور الافتراضية

const DEFAULT_HELPERS: HelperState = {
  deleteTwo: 1,
  addTime: 1,
  doublePoints: 1,
  skip: 1
};

const CATEGORY_THEMES: Record<Category, { icon: string, label: string, desc: string, color: string }> = {
  [Category.RELIGIOUS]: { 
    icon: '🕌', 
    label: 'علوم الدين', 
    desc: 'أركان الإسلام، الفقه، والأخلاق', 
    color: 'from-emerald-500 to-teal-700' 
  },
  [Category.QURAN]: { 
    icon: '📖', 
    label: 'القرآن الكريم', 
    desc: 'آيات، سور، ومعلومات قرآنية', 
    color: 'from-cyan-500 to-blue-700' 
  },
  [Category.SEERAH]: { 
    icon: '🌙', 
    label: 'السيرة النبوية', 
    desc: 'حياة النبي ﷺ وأصحابه الكرام', 
    color: 'from-indigo-500 to-purple-700' 
  },
  [Category.SPORTS]: { 
    icon: '⚽', 
    label: 'رياضة وكورة', 
    desc: 'أندية، لاعبين، وبطولات عالمية', 
    color: 'from-blue-400 to-indigo-600' 
  },
  [Category.PUZZLES]: { 
    icon: '🧠', 
    label: 'ألغاز ذكية', 
    desc: 'تحديات ذهنية وألغاز ممتعة', 
    color: 'from-amber-400 to-orange-600' 
  },
  [Category.GENERAL]: { 
    icon: '🌍', 
    label: 'ثقافة عامة', 
    desc: 'معلومات منوعة من حول العالم', 
    color: 'from-slate-500 to-slate-700' 
  },
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [questions, setQuestions] = useState<Question[]>(STATIC_QUESTIONS);
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number, avatar: string}[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.ONE_VS_ONE);
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'البطل 1', score: 0, color: '#fbbf24', avatar: '🦁', helpers: { ...DEFAULT_HELPERS } },
    { id: '2', name: 'البطل 2', score: 0, color: '#10b981', avatar: '🦊', helpers: { ...DEFAULT_HELPERS } }
  ]);
  const [gameSettings, setGameSettings] = useState({
    categories: [] as Category[],
    level: Difficulty.MEDIUM
  });

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Fetch Questions from Firestore safely
  useEffect(() => {
    if (!isFirestoreAvailable || !db) {
      console.log("Using static local questions.");
      return;
    }

    try {
      const unsub = onSnapshot(collection(db, 'questions'), (snapshot) => {
        const qData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        if (qData.length > 0) {
          setQuestions(qData);
        }
      }, (error) => {
        console.warn("Firestore onSnapshot error (Questions):", error);
      });
      return unsub;
    } catch (e) {
      console.error("Failed to setup question listener:", e);
    }
  }, []);

  // Fetch Leaderboard from Firestore safely
  useEffect(() => {
    if (!isFirestoreAvailable || !db) return;

    try {
      const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
      const unsub = onSnapshot(q, (snapshot) => {
        setLeaderboard(snapshot.docs.map(doc => doc.data() as any));
      }, (error) => {
        console.warn("Firestore onSnapshot error (Leaderboard):", error);
      });
      return unsub;
    } catch (e) {
      console.error("Failed to setup leaderboard listener:", e);
    }
  }, []);

  const saveScoreToFirestore = async (finalPlayers: Player[]) => {
    if (!isFirestoreAvailable || !db) return;

    try {
      for (const p of finalPlayers) {
        if (p.score > 0) {
          await addDoc(collection(db, 'leaderboard'), {
            name: p.name,
            score: p.score,
            avatar: p.avatar,
            timestamp: serverTimestamp()
          });
        }
      }
    } catch (e) {
      console.error("Failed to save score:", e);
    }
  };

  const handleAdminLogin = () => {
    if (passInput === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPassInput('');
    }
  };

  const handleStartGame = () => {
    setScreen('MODE_SELECT');
  };

  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === GameMode.ONE_VS_ONE) {
      setPlayers([
        { id: '1', name: 'البطل 1', score: 0, color: '#fbbf24', avatar: '🦁', helpers: { ...DEFAULT_HELPERS } },
        { id: '2', name: 'البطل 2', score: 0, color: '#10b981', avatar: '🦊', helpers: { ...DEFAULT_HELPERS } }
      ]);
    } else if (mode === GameMode.TWO_VS_TWO) {
      setPlayers([
        { id: '1', name: 'الفريق 1', score: 0, color: '#fbbf24', avatar: '👥', helpers: { ...DEFAULT_HELPERS } },
        { id: '2', name: 'الفريق 2', score: 0, color: '#10b981', avatar: '👥', helpers: { ...DEFAULT_HELPERS } }
      ]);
    } else {
      setPlayers([
        { id: '1', name: 'المجموعة أ', score: 0, color: '#fbbf24', avatar: '🏢', helpers: { ...DEFAULT_HELPERS } },
        { id: '2', name: 'المجموعة ب', score: 0, color: '#10b981', avatar: '🏢', helpers: { ...DEFAULT_HELPERS } },
        { id: '3', name: 'المجموعة ج', score: 0, color: '#3b82f6', avatar: '🏢', helpers: { ...DEFAULT_HELPERS } }
      ]);
    }
    setScreen('CONFIG');
  };

  const toggleCategory = (cat: Category) => {
    setGameSettings(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const renderScreen = () => {
    switch (screen) {
      case 'HOME':
        return <Landing onStart={handleStartGame} onLearn={() => setScreen('LEARN')} />;
      
      case 'MODE_SELECT':
        return (
          <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in zoom-in duration-500 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-4 text-amber-400 drop-shadow-lg">اختر نمط اللعب 🎮</h2>
            <p className="text-slate-400 text-xl font-bold mb-12">حدد الطريقة التي تود المنافسة بها</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { mode: GameMode.ONE_VS_ONE, icon: '👤vs👤', title: '1 ضد 1', desc: 'تحدي مباشر بين بطلين', color: 'from-blue-500 to-indigo-600' },
                { mode: GameMode.TWO_VS_TWO, icon: '👥vs👥', title: '2 ضد 2', desc: 'تعاون بطلين ضد بطلين آخرين', color: 'from-emerald-500 to-teal-600' },
                { mode: GameMode.GROUPS, icon: '🏢', title: 'مجموعات', desc: 'منافسة كبرى بين عدة مجموعات', color: 'from-purple-500 to-pink-600' }
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => selectMode(item.mode)}
                  className={`group relative p-8 rounded-[3rem] bg-gradient-to-br ${item.color} shadow-2xl transition-all transform hover:scale-105 active:scale-95 border-4 border-white/10 hover:border-white/40 text-right overflow-hidden`}
                >
                  <div className="absolute -left-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform">{item.icon.split('vs')[0]}</div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-6">{item.icon}</div>
                    <h3 className="text-3xl font-black text-white mb-2">{item.title}</h3>
                    <p className="text-white/80 font-bold leading-tight">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setScreen('HOME')}
              className="mt-16 text-slate-500 hover:text-white font-bold transition-all flex items-center gap-2 mx-auto"
            >
              <span>🔙 العودة للرئيسية</span>
            </button>
          </div>
        );

      case 'CONFIG':
        return (
          <div className="max-w-5xl mx-auto py-6 px-4 md:px-0 animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-8">
                <button onClick={() => setScreen('MODE_SELECT')} className="text-slate-400 hover:text-white font-black">← تغيير النمط</button>
                <div className="bg-amber-500 text-slate-900 px-4 py-1 rounded-full font-black text-sm">نمط اللعب: {gameMode}</div>
             </div>

            <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-amber-400 drop-shadow-lg">إعداد المنافسة 🎯</h2>
            <p className="text-center text-slate-400 mb-10 font-bold">خصص تجربتك قبل الانطلاق!</p>
            
            <div className="mb-12 bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
              <h3 className="text-2xl font-black mb-6 text-white flex items-center gap-3">
                <span className="bg-amber-500 text-slate-900 w-10 h-10 rounded-xl flex items-center justify-center">📊</span>
                <span>اختر مستوى الصعوبة</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(Difficulty).map(level => (
                  <button
                    key={level}
                    onClick={() => setGameSettings(prev => ({ ...prev, level }))}
                    className={`p-5 rounded-2xl font-black text-xl transition-all relative overflow-hidden group ${
                      gameSettings.level === level 
                        ? 'bg-amber-500 text-slate-900 shadow-lg scale-105 ring-4 ring-amber-500/20' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    <span className="relative z-10">{level}</span>
                    {gameSettings.level === level && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-black mb-8 text-white flex items-center gap-3">
                <span className="bg-blue-500 text-slate-900 w-10 h-10 rounded-xl flex items-center justify-center">🧩</span>
                <span>نوع السؤال</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Object.entries(CATEGORY_THEMES) as [Category, typeof CATEGORY_THEMES[Category]][]).map(([cat, theme]) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`relative p-6 rounded-[2rem] text-right transition-all group overflow-hidden border-4 h-48 ${
                      gameSettings.categories.includes(cat)
                        ? `border-white shadow-2xl scale-90 bg-gradient-to-br ${theme.color}`
                        : 'border-slate-800 bg-slate-800/40 text-slate-500 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 scale-100'
                    }`}
                  >
                    <div className="absolute -bottom-4 -left-4 text-9xl opacity-10 group-hover:rotate-12 transition-transform pointer-events-none">
                      {theme.icon}
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110 ${
                          gameSettings.categories.includes(cat) ? 'bg-white/20' : 'bg-slate-700'
                        }`}>
                          {theme.icon}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className={`text-2xl font-black mb-1 ${
                          gameSettings.categories.includes(cat) ? 'text-white' : 'text-slate-300'
                        }`}>
                          {theme.label}
                        </h4>
                        <p className={`text-sm font-bold leading-tight ${
                          gameSettings.categories.includes(cat) ? 'text-white/80' : 'text-slate-500'
                        }`}>
                          {theme.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 items-center mt-12">
              <button
                onClick={() => setScreen('SETUP')}
                disabled={gameSettings.categories.length === 0}
                className="w-full max-w-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-black text-3xl py-6 rounded-[2rem] shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 disabled:grayscale disabled:opacity-50"
              >
                <span>تجهيز اللاعبين</span>
                <span className="text-4xl">←</span>
              </button>
            </div>
          </div>
        );

      case 'SETUP':
        return (
          <div className="max-w-xl mx-auto py-10 px-6 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <h2 className="text-3xl font-black text-center mb-8 text-amber-400">تجهيز الأبطال 🎮</h2>
            <div className="space-y-6">
              {players.map((p, idx) => (
                <div key={p.id} className="bg-slate-700 p-4 rounded-2xl flex items-center gap-4">
                  <span className="text-4xl">{p.avatar}</span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => {
                      const newPlayers = [...players];
                      newPlayers[idx].name = e.target.value;
                      setPlayers(newPlayers);
                    }}
                    className="bg-slate-800 border-2 border-slate-600 focus:border-amber-500 outline-none p-3 rounded-xl flex-1 font-bold text-white text-lg"
                    placeholder="اسم اللاعب..."
                  />
                </div>
              ))}
              <div className="pt-6">
                <button
                  onClick={() => setScreen('PLAY')}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-2xl py-4 rounded-2xl shadow-xl transition-all disabled:bg-slate-600"
                >
                  انطلق للمنافسة! 🏁
                </button>
              </div>
            </div>
          </div>
        );

      case 'PLAY':
        return (
          <GameEngine 
            players={players} 
            settings={gameSettings} 
            questions={questions}
            onGameOver={(finalPlayers) => {
               setPlayers(finalPlayers);
               saveScoreToFirestore(finalPlayers);
               setScreen('LEADERBOARD');
            }}
          />
        );
      
      case 'LEARN':
        return <Academy />;

      case 'ABOUT':
        return (
          <div className="max-w-4xl mx-auto py-12 px-8 bg-slate-800 rounded-[3rem] border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-700 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>
            <div className="relative mb-8 pt-6">
              <div className="absolute -inset-4 bg-amber-500/10 blur-3xl rounded-full"></div>
              <h1 className="text-6xl md:text-7xl font-title text-amber-400 drop-shadow-2xl relative mb-4">اِمْرَح وَارْبَح</h1>
              <div className="flex items-center justify-center gap-3 text-xl md:text-2xl text-slate-300 font-black tracking-widest opacity-80">
                <span>نلعب</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>نتعلّم</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>نرتقي</span>
              </div>
            </div>
            <div className="max-w-2xl mx-auto space-y-8 text-right">
              <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-700/50">
                <p className="text-2xl md:text-3xl text-slate-200 leading-relaxed font-bold text-center">اِمْرَح وَارْبَح هي رحلة تعليمية وتنافسية فريدة، صُممت خصيصاً لتجمع بين التسلية وبناء المعرفة لدى الأطفال والناشئة.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 p-8 rounded-3xl border border-slate-600 hover:border-amber-500/50 transition-all text-center group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
                  <h4 className="text-xl font-black text-amber-400 mb-2">هدفنا</h4>
                  <p className="text-slate-400 font-bold">غرس القيم الإسلامية ومعرفة السيرة النبوية بأسلوب عصري ومحبب.</p>
                </div>
                <div className="bg-slate-700/30 p-8 rounded-3xl border border-slate-600 hover:border-amber-500/50 transition-all text-center group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎡</div>
                  <h4 className="text-xl font-black text-amber-400 mb-2">أسلوبنا</h4>
                  <p className="text-slate-400 font-bold">التفاعل، الحماس، وعجلة الحظ التي تجعل من كل سؤال تحدياً جديداً.</p>
                </div>
              </div>
              <p className="text-slate-400 text-lg font-bold leading-relaxed border-t border-slate-700 pt-8">تناسب اللعبة الأطفال من عمر 7 إلى 13 سنة، وتقدم محتوىً ثرياً يغطي الجوانب الدينية والثقافية والرياضية والألغاز، مما ينمي مهارات التفكير والتركيز لدى أبطالنا الصغار.</p>
            </div>
            <div className="mt-12 flex justify-center gap-4">
               <button onClick={() => setScreen('HOME')} className="px-12 py-4 bg-slate-700 text-white rounded-2xl font-black hover:bg-slate-600 transition-all">الرئيسية</button>
               <button onClick={() => setScreen('MODE_SELECT')} className="px-12 py-4 bg-amber-500 text-slate-900 rounded-2xl font-black shadow-lg hover:scale-105 transition-all">ابدأ اللعب ▶</button>
               <button onClick={() => setScreen('ADMIN')} className="hidden lg:block px-12 py-4 bg-slate-900 border border-slate-700 text-white rounded-2xl font-black hover:bg-slate-800 transition-all">الإدارة 🛡️</button>
            </div>
          </div>
        );
      
      case 'LEADERBOARD':
        return (
          <div className="max-w-2xl mx-auto py-10 px-6 text-center">
            <h2 className="text-5xl font-black mb-10 text-amber-400">لوحة الشرف العالمية 🌍</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
              {leaderboard.map((p, idx) => (
                <div key={idx} className={`p-6 rounded-3xl flex items-center justify-between animate-in slide-in-from-right duration-300 ${idx === 0 ? 'bg-amber-500/20 border-2 border-amber-500 scale-105' : 'bg-slate-800 border border-slate-700'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-slate-500 w-10">{idx + 1}</span>
                    <span className="text-4xl">{p.avatar}</span>
                    <span className="text-2xl font-bold">{p.name}</span>
                  </div>
                  <span className="text-3xl font-black text-amber-400">{p.score} ⭐</span>
                </div>
              ))}
              {leaderboard.length === 0 && <p className="text-slate-500">لا يوجد متصدرين بعد، كن الأول!</p>}
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-12">
              <button
                onClick={() => setScreen('HOME')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-2xl font-bold transition-all"
              >العودة للرئيسية 🏠</button>
              <button
                onClick={() => setScreen('ADMIN')}
                className="bg-amber-500 text-slate-900 px-10 py-4 rounded-2xl font-black transition-all"
              >لوحة التحكم الإدارية 🛠️</button>
            </div>
          </div>
        );

      case 'RULES':
        return (
          <div className="max-w-3xl mx-auto py-10 px-6 bg-slate-800 rounded-3xl border border-slate-700 animate-in zoom-in duration-500">
            <h2 className="text-4xl font-black mb-8 text-amber-400 text-center flex items-center justify-center gap-4">
               <span>كيف نلعب؟</span>
               <span>🎡</span>
            </h2>
            <div className="space-y-6 text-xl leading-relaxed text-slate-300">
              <p className="flex items-center gap-4 bg-slate-700/50 p-6 rounded-2xl border-r-4 border-amber-500">
                <span className="bg-amber-500 text-slate-900 w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0">1</span>
                <span>اختر نمط اللعب المفضل (فردي، ثنائي، أو مجموعات).</span>
              </p>
              <p className="flex items-center gap-4 bg-slate-700/50 p-6 rounded-2xl border-r-4 border-amber-500">
                <span className="bg-amber-500 text-slate-900 w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0">2</span>
                <span>اختر مستوى الصعوبة ونوع الأسئلة التي تفضلها.</span>
              </p>
              <p className="flex items-center gap-4 bg-slate-700/50 p-6 rounded-2xl border-r-4 border-amber-500">
                <span className="bg-amber-500 text-slate-900 w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0">3</span>
                <span>قم بلف عجلة الحظ قبل كل سؤال لتحدد جائزتك.</span>
              </p>
              <p className="flex items-center gap-4 bg-slate-700/50 p-6 rounded-2xl border-r-4 border-amber-500">
                <span className="bg-amber-500 text-slate-900 w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0">4</span>
                <span>أجب بسرعة قبل انتهاء الوقت لتجمع أعلى النقاط وتتصدر لوحة الشرف.</span>
              </p>
            </div>
            <div className="mt-10 flex justify-center">
              <button onClick={() => setScreen('MODE_SELECT')} className="bg-amber-500 text-slate-900 font-black px-12 py-4 rounded-2xl text-xl shadow-lg hover:scale-105 transition-all">ابدأ الآن!</button>
            </div>
          </div>
        );

      case 'ADMIN':
        if (!isAdminAuthenticated) {
          return (
            <div className="max-w-md mx-auto py-20 px-8 bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-500 text-center">
              <div className="text-5xl mb-6">🔐</div>
              <h2 className="text-3xl font-black text-white mb-4">دخول الإدارة</h2>
              <p className="text-slate-400 mb-8 font-bold text-sm">يرجى إدخال كلمة المرور للوصول إلى الإعدادات</p>
              <div className="space-y-4">
                <input 
                  type="password"
                  value={passInput}
                  onChange={(e) => {
                    setPassInput(e.target.value);
                    setAuthError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="كلمة المرور..."
                  className={`w-full p-4 bg-slate-900 rounded-2xl border-2 outline-none text-center text-xl font-black text-white transition-all ${authError ? 'border-red-500 animate-shake' : 'border-slate-700 focus:border-amber-500'}`}
                />
                {authError && <p className="text-red-500 text-sm font-bold">كلمة المرور غير صحيحة! ❌</p>}
                <button 
                  onClick={handleAdminLogin}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-4 rounded-2xl text-lg shadow-lg transition-all active:scale-95"
                >
                  دخول
                </button>
                <button 
                  onClick={() => setScreen('HOME')}
                  className="w-full bg-transparent text-slate-500 hover:text-white font-bold py-2 text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="py-10 animate-in fade-in duration-500">
            <AdminPanel questions={questions} />
            <div className="mt-8 text-center flex flex-col gap-4 items-center">
              <button 
                onClick={() => setIsAdminAuthenticated(false)} 
                className="text-amber-500 hover:text-amber-400 font-bold flex items-center gap-2"
              >
                <span>🔒 تسجيل الخروج من الإدارة</span>
              </button>
              <button 
                onClick={() => setScreen('HOME')} 
                className="text-slate-500 hover:text-white font-bold underline text-sm"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        );

      default:
        return <Landing onStart={handleStartGame} onLearn={() => setScreen('LEARN')} />;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-slate-900 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <Navbar currentScreen={screen} setScreen={setScreen} />
      
      <main className="container mx-auto px-4 relative z-10">
        {renderScreen()}
      </main>

      {screen === 'HOME' && (
        <footer className="fixed bottom-4 left-0 right-0 text-center text-slate-500 text-xs font-bold tracking-widest uppercase opacity-30">
          اِمْرَح وَارْبَح • ٢٠٢٤ • نلعب • نتعلّم • نرتقي
        </footer>
      )}
    </div>
  );
};

export default App;
