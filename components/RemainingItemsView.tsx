import React, { useState } from 'react';
import { RemainingItem } from '../types';

interface RemainingItemsViewProps {
  items: RemainingItem[];
  setItems: (items: RemainingItem[]) => void;
}

const RemainingItemsView: React.FC<RemainingItemsViewProps> = ({ items, setItems }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !expiryDate) return;
    // FIX: Add missing `source` property to satisfy the RemainingItem type.
    const newItem: RemainingItem = { id: Date.now().toString(), name, quantity, expiryDate, source: 'Добавлено вручную' };
    setItems([...items, newItem]);
    setName('');
    setQuantity('');
    setExpiryDate('');
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const getExpiryStatus = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { className: 'text-gray-500 bg-gray-200', text: 'Истёк' };
    if (diffDays <= 1) return { className: 'text-red-800 bg-red-200 animate-pulse', text: `Истекает сегодня!` };
    if (diffDays <= 3) return { className: 'text-red-600', text: `Истекает через ${diffDays} дня` };
    return { className: 'text-gray-500', text: `до ${new Date(dateStr).toLocaleDateString()}` };
  };

  return (
    <div className="p-4 pt-10 fade-in">
      <h2 className="font-nunito text-2xl font-semibold text-[#8B5E3C] text-center mb-6">Остатки продуктов</h2>
      
      <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
        <form onSubmit={addItem} className="space-y-3">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Название продукта" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#D4A373] focus:border-[#D4A373]" required />
          <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Количество (напр. 0.5 кг)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#D4A373] focus:border-[#D4A373]" required />
          <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#D4A373] focus:border-[#D4A373]" required />
          <button type="submit" className="w-full h-12 text-white font-nunito font-bold text-lg rounded-xl bg-[#5E7A6E] shadow-md hover:scale-105 active:scale-100 transition-transform">
            Добавить
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <p className="text-center text-gray-500 mt-8">У вас пока нет остатков.</p>}
        {items.sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()).map(item => {
          const status = getExpiryStatus(item.expiryDate);
          return (
            <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg bg-white shadow-sm ${status.className.includes('bg') ? status.className.split(' ').find(c => c.startsWith('bg')) : ''}`}>
              <div>
                <p className="font-nunito font-bold text-lg">{item.name}</p>
                <p className="text-sm text-gray-600">{item.quantity}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-semibold p-1 rounded ${status.className}`}>{status.text}</span>
                <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default RemainingItemsView;
