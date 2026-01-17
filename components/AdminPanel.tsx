
import React, { useState } from 'react';
import { db, isFirestoreAvailable } from '../firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Category, Difficulty, Question } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminPanelProps {
  questions: Question[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ questions }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    category: Category.GENERAL,
    level: Difficulty.EASY,
    explanation: ''
  });

  const isApiAvailable = !!process.env.API_KEY;

  const handleAIGenerate = async () => {
    if (!isApiAvailable) {
      alert("⚠️ عذراً، مفتاح الـ API غير متوفر.");
      return;
    }
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `قم بتوليد 5 أسئلة مسابقات للأطفال (عمر 7-13 سنة) في تصنيف "${newQuestion.category}" وبمستوى صعوبة "${newQuestion.level}".`,
        config: {
          systemInstruction: "أنت خبير في المناهج التعليمية للأطفال. قم بتوليد أسئلة باللغة العربية الفصحى البسيطة والواضحة بتنسيق JSON حصراً.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "أربعة خيارات للسؤال"
                },
                correctIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["text", "options", "correctIndex"]
            }
          }
        }
      });
      const jsonStr = response.text?.trim();
      if (!jsonStr) throw new Error("No response");
      const generatedQuestions = JSON.parse(jsonStr);
      if (isFirestoreAvailable && db) {
        for (const q of generatedQuestions) {
          await addDoc(collection(db, 'questions'), {
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            category: newQuestion.category,
            level: newQuestion.level,
            explanation: q.explanation || ''
          });
        }
        alert("✨ تم التوليد بنجاح!");
      }
    } catch (e) {
      console.error(e);
      alert("❌ فشل التوليد.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!isFirestoreAvailable || !db) return;
    try {
      await addDoc(collection(db, 'questions'), {
        text: newQuestion.text,
        options: newQuestion.options,
        correctIndex: newQuestion.correctIndex,
        category: newQuestion.category,
        level: newQuestion.level,
        explanation: newQuestion.explanation || ''
      });
      alert("تمت الإضافة!");
      setNewQuestion({ text: '', options: ['', '', '', ''], correctIndex: 0, category: Category.GENERAL, level: Difficulty.EASY, explanation: '' });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-10 px-4 md:px-6 bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-700 shadow-2xl text-right" dir="rtl">
      <h2 className="text-2xl md:text-3xl font-black mb-6 text-amber-400 flex flex-wrap items-center justify-between gap-2">
        <span>لوحة الإدارة 🛠️</span>
        {!isFirestoreAvailable && <span className="text-[10px] bg-red-900/50 text-red-300 px-3 py-1 rounded-full">معاينة فقط</span>}
      </h2>
      
      <div className="bg-slate-700/50 p-4 md:p-6 rounded-xl md:rounded-2xl mb-8 border border-slate-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white underline">إضافة سؤال جديد</h3>
          <button 
            onClick={handleAIGenerate}
            disabled={isGenerating || !isApiAvailable}
            className={`px-4 py-2 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 transition-all ${
              isGenerating || !isApiAvailable ? 'bg-slate-600 opacity-50' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
            }`}
          >
            {isGenerating ? 'جاري التوليد...' : 'توليد بالذكاء الاصطناعي ✨'}
          </button>
        </div>

        <div className="space-y-4">
          <textarea 
            placeholder="نص السؤال..." 
            className="w-full p-3 md:p-4 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold text-sm md:text-base outline-none focus:border-amber-500"
            rows={2}
            value={newQuestion.text}
            onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {newQuestion.options?.map((opt, i) => (
              <input 
                key={i}
                type="text" 
                placeholder={`الخيار ${i+1}`}
                className="p-2.5 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold text-sm outline-none focus:border-emerald-500"
                value={opt}
                onChange={e => {
                  const opts = [...(newQuestion.options || [])];
                  opts[i] = e.target.value;
                  setNewQuestion({...newQuestion, options: opts});
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <select className="p-2.5 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold text-sm outline-none" value={newQuestion.category} onChange={e => setNewQuestion({...newQuestion, category: e.target.value as Category})}>
              {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="p-2.5 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold text-sm outline-none" value={newQuestion.level} onChange={e => setNewQuestion({...newQuestion, level: e.target.value as Difficulty})}>
              {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="p-2.5 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold text-sm outline-none" value={newQuestion.correctIndex} onChange={e => setNewQuestion({...newQuestion, correctIndex: parseInt(e.target.value)})}>
              <option value={0}>الأول صح</option><option value={1}>الثاني صح</option><option value={2}>الثالث صح</option><option value={3}>الرابع صح</option>
            </select>
          </div>
          <button 
            onClick={handleAddQuestion}
            disabled={!isFirestoreAvailable}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 md:py-4 rounded-xl font-black text-white shadow-lg transition-all active:scale-95"
          >
            إضافة يدوياً ➕
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white mb-2">قائمة الأسئلة ({questions.length})</h3>
        <div className="max-h-60 md:max-h-96 overflow-y-auto space-y-2 no-scrollbar pl-1">
          {questions.map(q => (
            <div key={q.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex justify-between items-start gap-3">
              <button onClick={() => deleteDoc(doc(db!, 'questions', q.id))} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all">🗑️</button>
              <div className="flex-1">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="bg-slate-800 text-[8px] text-amber-500 px-2 py-0.5 rounded font-black uppercase">{q.category}</span>
                  <span className="bg-slate-800 text-[8px] text-blue-400 px-2 py-0.5 rounded font-black">{q.level}</span>
                </div>
                <p className="font-bold text-slate-300 text-xs md:text-sm">{q.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
