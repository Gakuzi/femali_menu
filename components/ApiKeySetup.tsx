
import React, { useState } from 'react';

interface ApiKeySetupProps {
  onSubmit: (apiKey: string) => void;
  error: string | null;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onSubmit, error }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 fade-in">
      <div className="text-center w-full max-w-md">
        <h1 className="font-nunito text-4xl font-light text-[#8B5E3C] mb-4">СЕМЕЙНОЕ МЕНЮ</h1>
        <p className="text-lg text-gray-600 mb-8">Привет! Давайте создадим ваше идеальное меню вместе с ИИ</p>
        
        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Введите ваш API-ключ Google Gemini"
            className="w-full px-4 py-4 text-center border-2 border-gray-200 rounded-2xl focus:border-[#D4A373] focus:ring-0 outline-none transition-colors duration-300"
            autoFocus
          />
          {error && <p className="text-red-500 mt-4 text-sm">{error} Убедитесь, что ключ активен и вы включили API в <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">makersuite.google.com</a></p>}
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full mt-6 h-14 text-white font-nunito font-bold text-lg rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#D4A373] shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:scale-105 active:scale-100 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Подключить Gemini
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeySetup;
