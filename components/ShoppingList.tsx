import React, { useState, useMemo } from 'react';
import { ShoppingList as ShoppingListType, Recipe, ShoppingListItem, Purchase } from '../types';
import { MoneyIcon } from './icons/Icons';

interface ShoppingListProps {
  list: ShoppingListType;
  setList: (list: ShoppingListType) => void;
  recipes: Record<string, Recipe>;
  onSelectRecipe: (recipeName: string) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ list, setList, recipes, onSelectRecipe }) => {
  const [modalItem, setModalItem] = useState<ShoppingListItem | null>(null);
  const [editItem, setEditItem] = useState<ShoppingListItem | null>(null);

  const updateItem = (updatedItem: ShoppingListItem) => {
    const newList = list.shoppingList.map(item => item.item === updatedItem.item ? updatedItem : item);
    // Recalculate total actual cost
    const newActualCost = newList.reduce((acc, item) => acc + item.purchasedPrice, 0);
    setList({ ...list, shoppingList: newList, actualTotalCost: newActualCost });
  };

  const handlePartialPurchase = (item: ShoppingListItem, quantity: string, price: number) => {
    const newPurchase: Purchase = { id: Date.now().toString(), quantity, price, date: new Date().toISOString() };
    const updatedItem = {
      ...item,
      purchases: [...item.purchases, newPurchase],
      purchasedPrice: item.purchasedPrice + price
    };
    // Here you would also update purchasedQuantity, which requires parsing "kg", "l" etc.
    // For simplicity, we only update price for now.
    updateItem(updatedItem);
  };
  
  const toggleItemCompletion = (itemToToggle: ShoppingListItem) => {
    const updatedItem = {
      ...itemToToggle,
      isCompleted: !itemToToggle.isCompleted,
      purchasedPrice: !itemToToggle.isCompleted ? itemToToggle.plannedPrice : 0 // Simplified logic
    };
    updateItem(updatedItem);
  };

  const groupedList = useMemo(() => {
    return list.shoppingList.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);
  }, [list.shoppingList]);
  
  const recipesUsingItem = useMemo(() => {
    if (!modalItem) return [];
    const itemName = modalItem.item.toLowerCase();
    return Object.values(recipes).filter(recipe => 
        recipe.ingredients.some(ing => ing.toLowerCase().includes(itemName))
    );
  }, [modalItem, recipes]);

  const completedCount = useMemo(() => list.shoppingList.filter(i => i.isCompleted).length, [list.shoppingList]);
  const progress = list.shoppingList.length > 0 ? (completedCount / list.shoppingList.length) * 100 : 0;

  return (
    <div className="p-4 pt-10 fade-in">
      <h2 className="font-nunito text-2xl font-semibold text-[#8B5E3C] text-center mb-1">Список покупок</h2>
      <p className="text-center text-gray-500 mb-6">{list.shoppingList.length} пункта</p>
      
      <div className="mb-6">
          <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-[#8B5E3C]">({completedCount}/{list.shoppingList.length}) куплено</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] h-2.5 rounded-full progress-bar-animated" style={{ width: `${progress}%` }}></div>
          </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(groupedList).map(([category, items]) => (
          <details key={category} open className="bg-white p-4 rounded-2xl shadow-sm group">
            <summary className="font-nunito font-bold text-lg text-[#8B5E3C] cursor-pointer list-none flex justify-between">
              {category}
            </summary>
            <ul className="space-y-2 mt-3">
              {items.map(item => (
                <li key={item.item} onDoubleClick={() => setEditItem(item)} className="p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1" onClick={() => setModalItem(item)}>
                          <div onClick={(e) => { e.stopPropagation(); toggleItemCompletion(item); }} className={`w-7 h-7 border-2 border-[#D4A373] rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${item.isCompleted ? 'bg-[#5E7A6E]' : ''}`}>
                            {item.isCompleted && <div className="w-3 h-3 bg-white rounded-full"></div>}
                          </div>
                          <div>
                            <p className={`font-lato font-medium text-lg ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.item}</p>
                            <p className={`text-sm ${item.isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>{item.plannedQuantity}</p>
                          </div>
                      </div>
                      <p className={`font-nunito font-bold text-lg ${item.isCompleted ? 'text-gray-400 line-through' : 'text-[#8B5E3C]'}`}>{item.plannedPrice} ₽</p>
                  </div>
                  {item.isPartial && !item.isCompleted && (
                      <div className="pl-10 mt-2 space-x-2">
                          <button onClick={() => handlePartialPurchase(item, item.minQty || '1', item.plannedPrice / 2)} className="px-2 py-1 text-xs bg-[#E07A5F] text-white rounded">Купить {item.minQty || 'часть'}</button>
                      </div>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-lg">
        <div className="text-center">
            <span className="text-sm text-gray-500">План</span>
            <p className="font-nunito text-xl font-bold text-gray-500">{list.plannedTotalCost} ₽</p>
        </div>
         <div className="text-center">
            <span className="text-sm text-[#8B5E3C] font-semibold">Факт</span>
            <p className="font-nunito text-2xl font-bold text-[#8B5E3C]">{list.actualTotalCost} ₽</p>
        </div>
      </div>
      
      {modalItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setModalItem(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-nunito font-bold text-xl text-[#8B5E3C] mb-4">"{modalItem.item}" используется в:</h3>
            <ul className="space-y-2">
                {recipesUsingItem.map(recipe => (
                    <li key={recipe.name} className="p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200" onClick={() => { onSelectRecipe(recipe.name); setModalItem(null); }}>
                        {recipe.name}
                    </li>
                ))}
            </ul>
            <button onClick={() => setModalItem(null)} className="mt-6 w-full py-2 bg-[#8B5E3C] text-white rounded-lg">Закрыть</button>
          </div>
        </div>
      )}
      
      {editItem && <EditItemModal item={editItem} onSave={(updated) => { updateItem(updated); setEditItem(null); }} onCancel={() => setEditItem(null)} />}

      <style>{`.progress-bar-animated { background-size: 200% 200%; animation:-gradient 3s ease infinite; }`}</style>
    </div>
  );
};

const EditItemModal: React.FC<{item: ShoppingListItem, onSave: (item: ShoppingListItem) => void, onCancel: () => void}> = ({item, onSave, onCancel}) => {
    const [formState, setFormState] = useState(item);

    const handleSave = () => {
        // Recalculate planned price based on new values
        // This is a simplification; a real app would need unit price.
        onSave(formState);
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-nunito font-bold text-xl text-[#8B5E3C] mb-4">Редактировать "{item.item}"</h3>
            <div className="space-y-3">
                <input type="text" value={formState.plannedQuantity} onChange={e => setFormState({...formState, plannedQuantity: e.target.value})} className="w-full p-2 border rounded" placeholder="Количество"/>
                <input type="number" value={formState.plannedPrice} onChange={e => setFormState({...formState, plannedPrice: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded" placeholder="Цена"/>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Отмена</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#8B5E3C] text-white rounded-lg">Сохранить</button>
            </div>
          </div>
        </div>
    );
};


export default ShoppingList;
