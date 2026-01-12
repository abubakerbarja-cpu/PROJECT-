
import React from 'react';
import { Screen } from '../types';

interface NavbarProps {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentScreen, setScreen }) => {
  const menuItems = [
    { id: 'HOME', label: 'الرئيسية', icon: '🏠' },
    { id: 'MODE_SELECT', label: 'اللعب', icon: '🎮' },
    { id: 'LEARN', label: 'تعلّم', icon: '📘' },
    { id: 'LEADERBOARD', label: 'لوحة الشرف', icon: '🏆' },
    { id: 'RULES', label: 'كيف نلعب؟', icon: '🎡' },
    { id: 'ABOUT', label: 'شرح اللعب', icon: '📝' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 z-50 h-16 flex items-center justify-between px-4 md:px-8">
      {/* Game Logo in the Corner (Right side for RTL) */}
      <div 
        className="flex items-center gap-3 cursor-pointer group transition-all"
        onClick={() => setScreen('HOME')}
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-amber-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform">
            🎯
          </div>
        </div>
        <div className="flex flex-col leading-none hidden sm:flex">
          <span className="font-black text-amber-400 text-lg md:text-xl tracking-tight">اِمْرَح وَارْبَح</span>
          <span className="text-[10px] md:text-[11px] text-slate-400 font-bold mt-0.5">نلعب • نتعلّم • نرتقي</span>
        </div>
      </div>

      {/* Navigation Menu (Centered/End) */}
      <div className="flex items-center gap-1.5 md:gap-4 overflow-x-auto no-scrollbar max-w-[65vw] py-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id as Screen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap group ${
              currentScreen === item.id 
                ? 'bg-amber-500 text-slate-900 shadow-lg font-black' 
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <span className={`text-lg transition-transform group-hover:scale-125 ${currentScreen === item.id ? '' : 'grayscale group-hover:grayscale-0'}`}>
              {item.icon}
            </span>
            <span className="text-xs md:text-sm font-bold">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Invisible Spacer for Balance on Mobile if needed, or just let it be flex */}
      <div className="w-10 h-10 hidden lg:block opacity-0"></div>
    </nav>
  );
};

export default Navbar;
