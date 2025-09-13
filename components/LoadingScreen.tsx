import React from 'react';
import { GenerationLogEntry } from '../types';

interface LoadingScreenProps {
  log: GenerationLogEntry[];
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ log, progress }) => {
  const isDone = progress >= 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#F9F7F4] to-[#EDE0D4] flex flex-col items-center justify-center z-50 p-4 fade-in">
      <div className="relative w-24 h-24 mb-6">
         <svg className="w-full h-full" viewBox="0 0 100 100">
            <path d="M 50,50 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" stroke="#D4A373" strokeWidth="4" fill="none" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
            <svg className="w-10 h-10 text-[#8B5E3C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214C14.246 3.963 12.684 3 10.5 3A8.25 8.25 0 002.25 11.25c0 1.13.235 2.203.654 3.162l2.122-2.121A5.25 5.25 0 0110.5 6a5.27 5.27 0 012.286.545l2.576-2.576z" />
            </svg>
        </div>
      </div>

      <div className="w-full max-w-sm text-center">
        <div className="w-full bg-gray-200/50 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}>
          </div>
        </div>

        <div className="h-48 overflow-y-auto text-left space-y-2 text-sm font-mono text-[#8B5E3C] p-3 bg-white/30 rounded-lg">
          {log.map((entry, i) => (
            <div key={i}>
              <p className="font-bold">{entry.title}</p>
              <ul className="pl-2 list-inside">
                {entry.details.map((detail, j) => (
                  <li key={j} className="text-gray-600 truncate">{detail}</li>
                ))}
              </ul>
              {entry.preview && entry.preview.length > 0 && (
                <div className="mt-1 ml-4 pl-2 border-l-2 border-gray-300 text-xs text-gray-500 italic space-y-1">
                    {entry.preview.map((line, k) => <p key={k}>{line}</p>)}
                </div>
              )}
            </div>
          ))}
        </div>

        {isDone && (
            <div className="mt-6">
                <p className="text-2xl font-nunito font-bold text-[#5E7A6E]">Готово!</p>
                <p className="text-lg text-gray-700">Добро пожаловать в "СЕМЕЙНОЕ МЕНЮ"</p>
            </div>
        )}
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
