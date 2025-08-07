'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Star, Users, TrendingUp, LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  phone: string;
  birthday?: string;
}

interface AIPet {
  id: string;
  name: string;
  level: number;
  experience: number;
  status: string;
}

interface SimpleDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchToChat?: () => void;
}

// 阿狸的動態回覆列表
const aliResponses = [
  "主人，歡迎回來！今天想吃什麼呢？我來為您推薦！🍽️",
  "嗨！我是阿狸，您的專屬餐廳服務員！讓我幫您安排用餐～",
  "主人好！我已經為您準備好菜單了，要不要看看今日特餐？✨",
  "歡迎光臨！我是AI服務員阿狸，今天心情特別好呢！😊",
  "主人！我學會了新的服務技巧，讓我來為您服務吧！",
  "嘿！今天餐廳很熱鬧，我推薦您試試招牌料理～🍜",
  "主人，我剛升級了服務技能，保證讓您滿意！",
  "歡迎回來！我一直在等您呢，今天想來點什麼？",
];

// 根據時間和用戶狀態生成個性化回覆
const getPersonalizedResponse = (user: User, pet: AIPet | null): string => {
  const hour = new Date().getHours();
  const userName = user.name || '主人';
  const level = pet?.level || 1;
  const experience = pet?.experience || 0;
  
  // 根據時間段
  if (hour < 11) {
    return `${userName}，早安！☀️ 早餐時間到了，我推薦您來份營養早餐套餐～`;
  } else if (hour < 14) {
    return `${userName}，午安！🌤️ 午餐高峰期，讓我為您快速安排用餐！`;
  } else if (hour < 17) {
    return `${userName}，下午好！☕ 要不要來杯下午茶配點心呢？`;
  } else if (hour < 20) {
    return `${userName}，晚上好！🌆 晚餐時間，今晚想吃什麼好料呢？`;
  } else {
    return `${userName}，夜宵時間！🌙 來點輕食或飲品怎麼樣？`;
  }
};

export default function SimpleDashboard({ user, onLogout, onSwitchToChat }: SimpleDashboardProps) {
  const [pet, setPet] = useState<AIPet | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await fetch('/api/pet', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'user-phone': user.phone, // 通過header傳遞用戶手機號
          },
        });

        if (response.ok) {
          const petData = await response.json();
          setPet(petData);
        }
      } catch (error) {
        console.error('獲取寵物信息失敗:', error);
      }
    };

    fetchPet();
  }, [user.phone]);

  // 動態生成阿狸的話語
  useEffect(() => {
    if (pet) {
      setIsTyping(true);
      setTimeout(() => {
        const message = getPersonalizedResponse(user, pet);
        setCurrentMessage(message);
        setIsTyping(false);
      }, 1000);
    }
  }, [pet, user]);

  // 點擊阿狸頭像顯示詳細信息
  const handlePetClick = () => {
    setShowPetModal(true);
  };

  // 關閉寵物模態框
  const closePetModal = () => {
    setShowPetModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 主要內容 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 阿狸寵物卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            {pet ? (
              <>
                {/* 阿狸頭像與公告板 */}
                <div className="relative inline-block mb-6">
                  {/* 阿狸頭像按鈕 */}
                  <button
                    onClick={handlePetClick}
                    className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-lg relative mb-4 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="text-6xl animate-pulse">🦊</div>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                      Lv.{pet.level}
                    </div>
                    {/* 點擊提示 */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      點擊查看詳細資料
                    </div>
                  </button>

                  {/* 小公告板 */}
                  <div className="notice-board mx-auto max-w-sm">
                    {/* 公告板內容 */}
                    <div className="text-center">
                      <div className="text-amber-800 text-xs font-semibold mb-2 flex items-center justify-center">
                        <span className="mr-1">📋</span>
                        阿狸小公告
                      </div>
                      {isTyping ? (
                        <div className="flex items-center justify-center space-x-1 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full typing-dots"></div>
                            <div className="w-2 h-2 bg-amber-500 rounded-full typing-dots" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-amber-500 rounded-full typing-dots" style={{animationDelay: '0.4s'}}></div>
                          </div>
                          <span className="text-amber-700 text-sm ml-2">阿狸正在寫公告...</span>
                        </div>
                      ) : (
                        <p className="text-gray-800 text-sm font-medium leading-relaxed">
                          {currentMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 阿狸服務狀態 */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl mb-1">❤️</div>
                      <div className="text-sm text-gray-600">服務熱忱</div>
                      <div className="font-semibold">100%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-sm text-gray-600">服務經驗</div>
                      <div className="font-semibold">{pet.experience}/100</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">😊</div>
                      <div className="text-sm text-gray-600">服務狀態</div>
                      <div className="font-semibold">{pet.status}</div>
                    </div>
                  </div>
                </div>

                {/* 經驗值進度條 */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${pet.experience}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">正在載入您的 AI 助手...</p>
              </div>
            )}
          </div>
        </div>

        {/* 功能按鈕區 */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105">
            <div className="text-center">
              <div className="text-3xl mb-2">🍽️</div>
              <h3 className="text-lg font-bold">點餐服務</h3>
              <p className="text-sm opacity-90 mt-1">讓阿狸為您點餐</p>
            </div>
          </button>

          <button 
            onClick={onSwitchToChat}
            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="text-lg font-bold">與阿狸聊天</h3>
              <p className="text-sm opacity-90 mt-1">AI 餐廳服務員</p>
            </div>
          </button>
        </div>

        {/* 餐廳服務狀態 */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🏪 餐廳服務狀態</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">營業中</div>
              <div className="text-sm text-orange-600">餐廳狀態</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">15分</div>
              <div className="text-sm text-green-600">預估等待</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{pet?.level || 1}</div>
              <div className="text-sm text-purple-600">阿狸等級</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">在線</div>
              <div className="text-sm text-blue-600">服務狀態</div>
            </div>
          </div>
        </div>

        {/* 阿狸的服務記錄 */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🦊 阿狸的服務記錄</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🍔</span>
                <span className="text-sm text-gray-700">為您推薦今日特餐</span>
              </div>
              <span className="text-xs text-gray-500">2小時前</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">☕</span>
                <span className="text-sm text-gray-700">協助您選擇飲品搭配</span>
              </div>
              <span className="text-xs text-gray-500">4小時前</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🎂</span>
                <span className="text-sm text-gray-700">記住了您的生日偏好</span>
              </div>
              <span className="text-xs text-gray-500">1天前</span>
            </div>
          </div>
        </div>

        {/* 登出按鈕卡片 */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col space-y-3">
            {onSwitchToChat && (
              <button
                onClick={onSwitchToChat}
                className="flex items-center justify-center space-x-2 w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors shadow-lg"
              >
                <span>💬</span>
                <span>與阿狸聊天</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex items-center justify-center space-x-2 w-full px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors shadow-lg"
            >
              <LogOut size={16} />
              <span>登出帳號</span>
            </button>
          </div>
        </div>
      </div>

      {/* 寵物詳細信息模態框 */}
      {showPetModal && pet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative">
            {/* 關閉按鈕 */}
            <button
              onClick={closePetModal}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {/* 寵物詳細信息 */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
                <div className="text-4xl">🦊</div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">阿狸</h2>
              <p className="text-gray-600 mb-6">等級 {pet.level} 餐廳服務員</p>

              {/* 詳細素質 */}
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-600 font-semibold flex items-center">
                      <span className="mr-2">❤️</span>服務熱忱
                    </span>
                    <span className="text-red-600 font-bold">100/100</span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-600 font-semibold flex items-center">
                      <span className="mr-2">⚡</span>服務經驗
                    </span>
                    <span className="text-blue-600 font-bold">{pet.experience}/100</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{width: `${pet.experience}%`}}></div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-600 font-semibold flex items-center">
                      <span className="mr-2">🎯</span>專業技能
                    </span>
                    <span className="text-purple-600 font-bold">85/100</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-600 font-semibold flex items-center">
                      <span className="mr-2">😊</span>客戶滿意度
                    </span>
                    <span className="text-green-600 font-bold">95/100</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
              </div>

              {/* 服務狀態 */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">當前狀態</h3>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-2xl">😊</span>
                  <span className="text-lg font-medium text-gray-700">{pet.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
