import React, { useRef } from 'react';
import { AppState } from '../types';

interface DataSyncProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const DataSync: React.FC<DataSyncProps> = ({ appState, setAppState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataToExport = {
      apiKey: appState.apiKey,
      appSettings: appState.appSettings,
      menuData: appState.menuData,
      recipes: appState.recipes,
      shoppingList: appState.shoppingList,
      budget: appState.budget,
      remainingItems: appState.remainingItems,
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `семейное-меню-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const importedData = JSON.parse(text);
            if (importedData.apiKey && importedData.menuData && importedData.appSettings) {
              setAppState(prev => ({
                ...prev,
                ...importedData,
                generationLog: [],
                isLoading: false,
                view: 'menu',
              }));
              localStorage.setItem('familyMenuState', JSON.stringify(importedData));
              alert('Данные успешно импортированы!');
            } else {
              throw new Error('Неверный формат файла.');
            }
          }
        } catch (error) {
          alert('Не удалось импортировать данные. Файл поврежден или имеет неверный формат.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4 pt-10 fade-in">
      <h2 className="font-nunito text-2xl font-semibold text-[#8B5E3C] text-center mb-6">Синхронизация с семьёй</h2>
      <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
        <div>
          <button onClick={handleExport} className="w-full h-14 text-white font-nunito font-bold text-lg rounded-2xl bg-[#5E7A6E] shadow-md hover:scale-105 active:scale-100 transition-transform">
            Экспортировать данные
          </button>
          <p className="text-center text-sm text-gray-500 mt-2">Сохраните файл, чтобы поделиться им или создать резервную копию.</p>
        </div>

        <div>
          <button onClick={handleImportClick} className="w-full h-14 text-[#8B5E3C] font-nunito font-bold text-lg rounded-2xl bg-white border-2 border-[#D4A373] shadow-md hover:scale-105 active:scale-100 transition-transform">
            Импортировать данные
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/json"
            className="hidden"
          />
          <p className="text-center text-sm text-gray-500 mt-2">Загрузите файл, чтобы восстановить меню на другом устройстве.</p>
        </div>
      </div>
       <div className="mt-6 text-center text-gray-600 bg-yellow-50 p-4 rounded-lg">
        <p className="font-semibold">Как это работает?</p>
        <p className="text-sm">Экспортируйте файл и поделитесь им с семьей. Они смогут импортировать его и видеть то же меню, список покупок и бюджет!</p>
      </div>
    </div>
  );
};

export default DataSync;
