import React, { useState } from 'react';

interface ClarificationModalProps {
  question: string;
  onSubmit: (answer: string) => void;
}

const ClarificationModal: React.FC<ClarificationModalProps> = ({ question, onSubmit }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl text-center">
        <h2 className="font-nunito text-xl font-bold text-[#8B5E3C] mb-4">Уточняющий вопрос от ИИ</h2>
        <p className="text-gray-700 mb-6">{question}</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Ваш ответ..."
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#D4A373] focus:ring-0 outline-none transition-colors"
            rows={3}
            autoFocus
          />
          <button
            type="submit"
            disabled={!answer.trim()}
            className="w-full mt-4 h-12 text-white font-nunito font-bold text-lg rounded-xl bg-gradient-to-r from-[#8B5E3C] to-[#D4A373] hover:scale-105 active:scale-100 transition-transform disabled:opacity-50"
          >
            Ответить
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClarificationModal;