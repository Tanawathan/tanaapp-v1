'use client'

import { useState } from 'react'
import { BaseScene } from '../types/scenes'
import { sceneManager } from '../utils/sceneManager'

interface SceneSelectorProps {
  currentScene: BaseScene
  onSceneChange: (scene: BaseScene) => void
}

export function SceneSelector({ currentScene, onSceneChange }: SceneSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const allScenes = sceneManager.getAllScenes()

  const handleSceneClick = (scene: BaseScene) => {
    onSceneChange(scene)
    setIsExpanded(false)
  }

  return (
    <div className="relative">
      {/* 當前場景顯示按鈕 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-all duration-200 min-w-[160px] justify-center"
      >
        <span className="text-lg">{currentScene.icon}</span>
        <span className="text-sm font-medium text-orange-700">{currentScene.name}</span>
        <span className={`text-orange-400 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* 展開的場景選項 */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="py-2">
            {allScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => handleSceneClick(scene)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  currentScene.id === scene.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                }`}
              >
                <span className="text-lg">{scene.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{scene.name}</div>
                  <div className="text-xs text-gray-500">{scene.description}</div>
                </div>
                {currentScene.id === scene.id && (
                  <span className="text-orange-500 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 背景遮罩 */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}
