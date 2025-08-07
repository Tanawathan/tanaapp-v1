import { BaseScene, SceneService, SCENES } from '../types/scenes';
import { chatWithAI } from '../lib/openai';

export class SceneManager {
  private currentScene: BaseScene;
  private sceneHistory: BaseScene[] = [];
  private onSceneChange?: (scene: BaseScene) => void;

  constructor() {
    // 預設啟動菜單點餐場景
    this.currentScene = SCENES.find(s => s.id === 'menu-ordering') || SCENES[0];
  }

  // 設置場景變更回調
  setOnSceneChange(callback: (scene: BaseScene) => void) {
    this.onSceneChange = callback;
  }

  // 切換場景
  switchScene(sceneId: string): boolean {
    const newScene = SCENES.find(s => s.id === sceneId);
    if (!newScene) {
      console.warn(`Scene not found: ${sceneId}`);
      return false;
    }

    // 記錄歷史
    this.sceneHistory.push(this.currentScene);
    
    // 更新當前場景
    this.currentScene = newScene;
    
    // 觸發回調
    this.onSceneChange?.(this.currentScene);
    
    console.log(`Switched to scene: ${newScene.name}`);
    return true;
  }

  // 根據場景ID切換場景（用於AI自動切換）
  switchToScene(sceneId: string): boolean {
    return this.switchScene(sceneId);
  }

  // 返回上一個場景
  goBack(): boolean {
    if (this.sceneHistory.length === 0) return false;
    
    const previousScene = this.sceneHistory.pop()!;
    this.currentScene = previousScene;
    
    this.onSceneChange?.(this.currentScene);
    return true;
  }

  // 獲取當前場景
  getCurrentScene(): BaseScene {
    return this.currentScene;
  }

  // 獲取所有可用場景
  getAllScenes(): BaseScene[] {
    return SCENES;
  }

  // 根據用戶輸入推薦場景
  suggestScene(userInput: string): string | null {
    const input = userInput.toLowerCase();
    
    // 簡單的場景識別邏輯
    const sceneKeywords = {
      'menu-ordering': ['菜單', '點餐', '推薦', '菜品', '食物', '餐點', '吃', '美食'],
      'table-booking': ['訂位', '預約', '座位', '桌子', '時間', '訂桌'],
      'promotions': ['優惠', '折扣', '活動', '特價', '促銷', '便宜'],
      'customer-service': ['問題', '客服', '諮詢', '幫助', '聯絡', '過敏'],
      'order-tracking': ['訂單', '狀態', '進度', '配送', '追蹤'],
      'restaurant-info': ['地址', '位置', '營業時間', '電話', '資訊', '環境'],
      'shopping-cart': ['購物車', '結帳', '付款', '支付', '刷卡', '現金']
    };

    for (const [sceneId, keywords] of Object.entries(sceneKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return sceneId;
      }
    }

    return null;
  }

  // AI訊息處理 - 使用簡化的場景切換邏輯
  async processAIMessage(userInput: string): Promise<{
    response: string
    suggestedScene?: string
    shouldSwitchScene?: boolean
    suggestedSceneId?: string
    functionCall?: any
  }> {
    try {
      // 構建系統提示詞
      const systemPrompt = `你是阿狸(A-Li)，TanaAPP泰式餐廳的AI助手 🏮✨

當前場景：${this.currentScene.name}

核心特質：
- 熱情友善，對泰式料理充滿熱忱 🌶️
- 使用繁體中文，說話輕鬆活潑但專業
- 善於理解用戶意圖，提供個人化服務

重要指令：
1. 如果用戶想要點餐，在回應末尾加上 [SCENE_SWITCH: menu-ordering]
2. 如果用戶想要訂位，在回應末尾加上 [SCENE_SWITCH: table-booking]  
3. 如果用戶詢問優惠，在回應末尾加上 [SCENE_SWITCH: event-promotions]
4. 保持對話的連續性，記住之前討論的內容

回應要求：控制在100字以內，親切自然。`;

      // 調用 OpenAI
      const aiResponse = await chatWithAI([
        { role: 'user', content: userInput }
      ], systemPrompt);

      // 檢查是否需要場景切換
      const sceneMatch = aiResponse.match(/\[SCENE_SWITCH:\s*([^\]]+)\]/);
      let shouldSwitchScene = false;
      let suggestedSceneId = undefined;

      if (sceneMatch) {
        suggestedSceneId = sceneMatch[1].trim();
        shouldSwitchScene = true;
      }

      // 清理回應中的場景切換標記
      const cleanResponse = aiResponse.replace(/\[SCENE_SWITCH:[^\]]+\]/g, '').trim();

      return {
        response: cleanResponse,
        suggestedScene: suggestedSceneId,
        shouldSwitchScene,
        suggestedSceneId,
        functionCall: undefined
      };

    } catch (error) {
      console.error('Scene Manager AI Processing Error:', error);
      return {
        response: '抱歉，處理您的訊息時出現了問題，請稍後再試 😅'
      };
    }
  }

  // 獲取場景的AI上下文
  getSceneAIContext(): string {
    return `
當前場景：${this.currentScene.name}
場景描述：${this.currentScene.description}
可用服務：${this.currentScene.services.join('、')}
支持的卡片類型：${this.currentScene.cardTemplates.join('、')}
    `.trim();
  }
}

// 導出單例實例
export const sceneManager = new SceneManager();
