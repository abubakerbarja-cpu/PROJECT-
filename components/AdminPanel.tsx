
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

  // التحقق من توفر مفتاح API للذكاء الاصطناعي
  const isApiAvailable = !!process.env.API_KEY;

  const handleAIGenerate = async () => {
    // التحقق الأول: هل المفتاح موجود؟
    if (!isApiAvailable) {
      alert("⚠️ عذراً، مفتاح الـ API غير متوفر. يرجى التأكد من إعداد بيئة العمل.");
      return;
    }

    if (isGenerating) return;
    setIsGenerating(true);

    try {
      // Use Gemini 3 Pro for complex text tasks such as educational content generation
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
                correctIndex: { 
                  type: Type.NUMBER,
                  description: "مؤشر الإجابة الصحيحة (0-3)"
                },
                explanation: { 
                  type: Type.STRING,
                  description: "تفسير بسيط للإجابة"
                }
              },
              required: ["text", "options", "correctIndex"],
              propertyOrdering: ["text", "options", "correctIndex", "explanation"]
            }
          }
        }
      });

      // Correctly extract text output from GenerateContentResponse property
      const jsonStr = response.text?.trim();
      if (!jsonStr) throw new Error("No response from AI");
      
      const generatedQuestions = JSON.parse(jsonStr);
      
      // إذا كانت قاعدة البيانات متوفرة، نحفظ الأسئلة
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
        alert("✨ تم توليد وإضافة 5 أسئلة بنجاح إلى قاعدة البيانات!");
      } else {
        // إذا كان وضع Local Only، نعرض الأسئلة للمستخدم فقط
        console.log("Generated Questions:", generatedQuestions);
        alert(`تم التوليد بنجاح (وضع المعاينة)! تم توليد ${generatedQuestions.length} أسئلة بنجاح. لا يمكن الحفظ لأن قاعدة البيانات غير متصلة.`);
      }
      
    } catch (e) {
      console.error("AI Generation error:", e);
      alert("❌ فشل توليد الأسئلة. تأكد من إعدادات الـ API والاتصال.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!isFirestoreAvailable || !db) {
      alert("قاعدة البيانات غير متوفرة حالياً (Local Only). لا يمكن إضافة الأسئلة يدوياً.");
      return;
    }
    if (!newQuestion.text || newQuestion.options?.some(o => !o)) {
      alert("يرجى إكمال جميع الحقول");
      return;
    }
    try {
      await addDoc(collection(db, 'questions'), {
        text: newQuestion.text,
        options: newQuestion.options,
        correctIndex: newQuestion.correctIndex,
        category: newQuestion.category,
        level: newQuestion.level,
        explanation: newQuestion.explanation || ''
      });
      alert("تمت إضافة السؤال بنجاح!");
      setNewQuestion({
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        category: Category.GENERAL,
        level: Difficulty.EASY,
        explanation: ''
      });
    } catch (e) {
      console.error(e);
      alert("خطأ في إضافة السؤال");
    }
  };

  const handleDelete = async (id: string) => {
    if (!isFirestoreAvailable || !db) return;
    if (confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
      try {
        await deleteDoc(doc(db, 'questions', id));
      } catch (e) {
        console.error(e);
        alert("فشل حذف السؤال");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl animate-in zoom-in duration-500 text-right" dir="rtl">
      <h2 className="text-3xl font-black mb-8 text-amber-400 flex items-center justify-between">
        <span>لوحة الإدارة 🛠️</span>
        {!isFirestoreAvailable && <span className="text-xs bg-red-900/50 text-red-300 px-3 py-1 rounded-full animate-pulse">وضع المعاينة (Local Only)</span>}
      </h2>
      
      <div className="bg-slate-700/50 p-6 rounded-2xl mb-10 border border-slate-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-white">إضافة سؤال جديد</h3>
          <div className="flex flex-col items-end gap-1">
            <button 
              onClick={handleAIGenerate}
              disabled={isGenerating || !isApiAvailable}
              className={`px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all w-full md:w-auto justify-center ${
                isGenerating || !isApiAvailable
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-lg'
              }`}
            >
              {isGenerating ? 'جاري التوليد... ⏳' : 'توليد بالذكاء الاصطناعي ✨'}
            </button>
            {!isApiAvailable && (
              <span className="text-[10px] text-rose-400 font-bold">⚠️ ميزة الذكاء الاصطناعي تتطلب مفتاح API</span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <textarea 
            placeholder="نص السؤال..." 
            className="w-full p-4 bg-slate-800 rounded-xl border border-slate-600 focus:border-amber-500 outline-none text-white font-bold"
            rows={3}
            value={newQuestion.text}
            onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newQuestion.options?.map((opt, i) => (
              <input 
                key={i}
                type="text" 
                placeholder={`الخيار ${i+1}`}
                className="p-3 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold focus:border-emerald-500 outline-none"
                value={opt}
                onChange={e => {
                  const opts = [...(newQuestion.options || [])];
                  opts[i] = e.target.value;
                  setNewQuestion({...newQuestion, options: opts});
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-bold px-1 text-right">التصنيف</label>
              <select 
                className="p-3 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold outline-none"
                value={newQuestion.category}
                onChange={e => setNewQuestion({...newQuestion, category: e.target.value as Category})}
              >
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-bold px-1 text-right">الصعوبة</label>
              <select 
                className="p-3 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold outline-none"
                value={newQuestion.level}
                onChange={e => setNewQuestion({...newQuestion, level: e.target.value as Difficulty})}
              >
                {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-bold px-1 text-right">الإجابة الصحيحة</label>
              <select 
                className="p-3 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold outline-none"
                value={newQuestion.correctIndex}
                onChange={e => setNewQuestion({...newQuestion, correctIndex: parseInt(e.target.value)})}
              >
                <option value={0}>الخيار الأول</option>
                <option value={1}>الخيار الثاني</option>
                <option value={2}>الخيار الثالث</option>
                <option value={3}>الخيار الرابع</option>
              </select>
            </div>
          </div>
          <input 
            type="text" 
            placeholder="تفسير الإجابة (اختياري)"
            className="w-full p-3 bg-slate-800 rounded-xl border border-slate-600 text-white font-bold outline-none focus:border-blue-500"
            value={newQuestion.explanation}
            onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
          />
          <button 
            onClick={handleAddQuestion}
            disabled={!isFirestoreAvailable}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-black text-white shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            إضافة السؤال يدوياً ➕
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4 text-white">
          {isFirestoreAvailable ? `الأسئلة الحالية في Firestore (${questions.length})` : `الأسئلة الافتراضية (${questions.length})`}
        </h3>
        <div className="max-h-96 overflow-y-auto space-y-3 no-scrollbar pl-2">
          {questions.map(q => (
            <div key={q.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-700 flex justify-between items-start group hover:border-amber-500/50 transition-colors">
              <button 
                onClick={() => handleDelete(q.id)} 
                disabled={!isFirestoreAvailable}
                className="text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-lg transition-all disabled:opacity-0"
                title="حذف"
              >
                🗑️
              </button>
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black ${q.level === Difficulty.HARD ? 'bg-red-900/40 text-red-400' : 'bg-blue-900/40 text-blue-400'}`}>{q.level}</span>
                  <span className="bg-slate-800 text-[10px] text-amber-500 px-2 py-0.5 rounded font-black uppercase">{q.category}</span>
                </div>
                <p className="font-bold text-slate-200">{q.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
