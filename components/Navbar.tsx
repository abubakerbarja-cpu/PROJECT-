
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
    { id: 'LEADERBOARD', label: 'الترتيب', icon: '🏆' },
    { id: 'RULES', label: 'القواعد', icon: '🎡' },
    { id: 'ADMIN', label: 'الإدارة', icon: '🔐' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 z-50 h-16 flex items-center justify-between px-3 md:px-8">
      {/* Game Logo */}
      <div 
        className="flex items-center gap-2 md:gap-3 cursor-pointer group transition-all shrink-0"
        onClick={() => setScreen('HOME')}
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-amber-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-lg md:text-xl shadow-lg transform group-hover:scale-110 transition-transform">
            🎯
          </div>
        </div>
        <div className="flex flex-col leading-none hidden xs:flex">
          <span className="font-black text-amber-400 text-sm md:text-lg tracking-tight">اِمْرَح وَارْبَح</span>
          <span className="text-[8px] md:text-[10px] text-slate-400 font-bold">نلعب • نتعلّم</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex items-center gap-1 md:gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id as Screen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl transition-all whitespace-nowrap group ${
              currentScreen === item.id 
                ? 'bg-amber-500 text-slate-900 shadow-md font-black scale-95' 
                : item.id === 'ADMIN' 
                  ? 'text-rose-400 hover:bg-rose-500/10' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <span className={`text-base md:text-lg transition-transform group-hover:scale-110 ${currentScreen === item.id ? '' : 'grayscale group-hover:grayscale-0'}`}>
              {item.icon}
            </span>
            <span className="text-[10px] md:text-sm font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
