import React, { useState, useEffect } from 'react';
import { BaseScene } from '../types/scenes';
import { sceneManager } from '../utils/sceneManager';
import { ProductCard, TimeSlotCard, PromotionCard } from './CardRenderer';

interface SceneContainerProps {
  currentScene: BaseScene;
  onSceneChange?: (sceneId: string) => void;
  onProductSelect?: (product: any) => void;
  onAddToCart?: (product: any) => void;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({
  currentScene,
  onSceneChange,
  onProductSelect,
  onAddToCart
}) => {
  const [sceneData, setSceneData] = useState<any[]>([]);

  // 根據場景ID載入對應的資料
  useEffect(() => {
    loadSceneData(currentScene.id);
  }, [currentScene.id]);

  const loadSceneData = (sceneId: string) => {
    switch (sceneId) {
      case 'menu-ordering':
        setSceneData([
          {
            id: '1',
            name: '綠咖哩雞',
            price: 268,
            emoji: '🍛',
            rating: 4.8,
            category: '泰式主食',
            spiciness: '中辣',
            description: '正宗泰式綠咖哩，使用新鮮椰漿熬煮，搭配嫩滑雞肉，香料豐富層次分明，是泰式料理的經典代表。',
            ingredients: ['雞肉', '椰漿', '綠咖哩醬', '茄子', '九層塔', '辣椒']
          },
          {
            id: '2',
            name: '炒河粉',
            price: 180,
            emoji: '🍜',
            rating: 4.6,
            category: '泰式麵食',
            spiciness: '微辣',
            description: '寬版河粉配上豆芽菜、韭菜，用大火快炒，口感Q彈爽滑，是泰式街頭美食的代表。',
            ingredients: ['河粉', '豆芽菜', '韭菜', '雞蛋', '蝦仁', '醬油']
          },
          {
            id: '3',
            name: '冬陰功湯',
            price: 150,
            emoji: '🍲',
            rating: 4.9,
            category: '泰式湯品',
            spiciness: '中辣',
            description: '泰國國湯，酸辣鮮香，使用檸檬葉、香茅、南薑等香料，口感層次豐富，開胃暖胃。',
            ingredients: ['蝦子', '檸檬葉', '香茅', '南薑', '辣椒', '檸檬汁']
          },
          {
            id: '4',
            name: '芒果糯米',
            price: 120,
            emoji: '🥭',
            rating: 4.5,
            category: '泰式甜點',
            spiciness: '不辣',
            description: '香甜軟糯的椰漿糯米配上新鮮芒果，是泰式經典甜點，口感清爽不膩。',
            ingredients: ['芒果', '糯米', '椰漿', '棕櫚糖', '鹽']
          }
        ]);
        break;
        
      case 'reservation':
        setSceneData([
          {
            id: 'slot1',
            time: '18:00',
            date: '今天 8月7日',
            availableTables: 3,
            totalTables: 5
          },
          {
            id: 'slot2',
            time: '18:30',
            date: '今天 8月7日',
            availableTables: 1,
            totalTables: 5
          },
          {
            id: 'slot3',
            time: '19:00',
            date: '今天 8月7日',
            availableTables: 4,
            totalTables: 5
          },
          {
            id: 'slot4',
            time: '19:30',
            date: '今天 8月7日',
            availableTables: 0,
            totalTables: 5
          },
          {
            id: 'slot5',
            time: '20:00',
            date: '今天 8月7日',
            availableTables: 2,
            totalTables: 5
          },
          {
            id: 'slot6',
            time: '20:30',
            date: '今天 8月7日',
            availableTables: 5,
            totalTables: 5
          }
        ]);
        break;
        
      case 'promotion':
        setSceneData([
          {
            id: 'promo1',
            title: '午餐特惠',
            description: '11:30-14:30 所有主食套餐享85折優惠',
            discount: '85折',
            validUntil: '有效至 8月31日',
            type: 'percentage'
          },
          {
            id: 'promo2',
            title: '滿額折扣',
            description: '消費滿500元立即折50元',
            discount: '折50',
            validUntil: '有效至 8月15日',
            type: 'fixed_amount'
          },
          {
            id: 'promo3',
            title: '買一送一',
            description: '冬陰功湯買一送一，限時優惠',
            discount: 'BOGO',
            validUntil: '有效至 8月10日',
            type: 'buy_one_get_one'
          }
        ]);
        break;
        
      default:
        setSceneData([]);
    }
  };

  const renderSceneContent = () => {
    switch (currentScene.id) {
      case 'menu-ordering':
        return (
          <div className="grid grid-cols-2 gap-3">
            {sceneData.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="compact"
                onDetailClick={onProductSelect}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        );
        
      case 'reservation':
        return (
          <div className="grid grid-cols-2 gap-3">
            {sceneData.map((timeSlot) => (
              <TimeSlotCard
                key={timeSlot.id}
                timeSlot={timeSlot}
                variant={
                  timeSlot.availableTables === 0 ? 'closed' :
                  timeSlot.availableTables <= 1 ? 'busy' : 'available'
                }
                onReserve={(slot) => console.log('Reserve:', slot)}
              />
            ))}
          </div>
        );
        
      case 'promotion':
        return (
          <div className="space-y-3">
            {sceneData.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                variant={promotion.type}
                onClaim={(promo) => console.log('Claim:', promo)}
              />
            ))}
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">{currentScene.icon}</span>
            <p className="font-medium">{currentScene.name}</p>
            <p className="text-sm mt-1">{currentScene.description}</p>
            <p className="text-xs mt-2 text-gray-400">此場景正在開發中...</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      {renderSceneContent()}
    </div>
  );
};

// 場景切換按鈕組件
interface SceneSwitcherProps {
  currentScene: BaseScene;
  onSceneChange: (sceneId: string) => void;
}

export const SceneSwitcher: React.FC<SceneSwitcherProps> = ({
  currentScene,
  onSceneChange
}) => {
  const allScenes = sceneManager.getAllScenes();

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl">
      <div className="w-full text-xs text-gray-600 mb-2">快速切換場景：</div>
      {allScenes.map((scene) => (
        <button
          key={scene.id}
          onClick={() => onSceneChange(scene.id)}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            scene.id === currentScene.id
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 hover:bg-orange-50'
          }`}
        >
          <span>{scene.icon}</span>
          <span>{scene.name}</span>
        </button>
      ))}
    </div>
  );
};
