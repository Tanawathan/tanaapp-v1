// 場景系統類型定義
export interface BaseScene {
  id: string;
  name: string;
  description: string;
  services: string[];
  cardTemplates: string[];
  dialogFlow: string;
  isActive: boolean;
  icon: string;
}

export interface SceneService {
  id: string;
  name: string;
  description: string;
  cardTemplate: string;
  data: any[];
}

export interface CardTemplate {
  id: string;
  component: React.ComponentType<any>;
  variants: string[];
  usageScenes: string[];
}

// 場景數據結構
export const SCENES: BaseScene[] = [
  {
    id: 'menu-ordering',
    name: '菜單點餐',
    description: '瀏覽菜單、了解菜品詳情、加入購物車',
    services: ['菜單推薦', '產品詳情', '加入購物車', '營養資訊'],
    cardTemplates: ['ProductCard'],
    dialogFlow: '推薦 → 興趣確認 → 詳情展示 → 購買決策',
    isActive: true,
    icon: '🍽️'
  },
  {
    id: 'reservation',
    name: '訂位預約',
    description: '查看空桌、選擇時間、確認訂位',
    services: ['查看空桌', '選擇時間', '確認訂位', '修改訂位', '取消訂位'],
    cardTemplates: ['TimeSlotCard', 'TableCard', 'ReservationCard'],
    dialogFlow: '需求詢問 → 時段選擇 → 桌位確認 → 預約完成',
    isActive: false,
    icon: '📅'
  },
  {
    id: 'promotion',
    name: '活動優惠',
    description: '查看當前優惠活動和折扣資訊',
    services: ['今日特價', '會員優惠', '節慶活動', '限時促銷', '優惠券'],
    cardTemplates: ['PromotionCard', 'CouponCard', 'EventCard'],
    dialogFlow: '優惠推播 → 條件說明 → 使用引導 → 確認套用',
    isActive: false,
    icon: '🎉'
  },
  {
    id: 'customer-service',
    name: '客服諮詢',
    description: '常見問題解答和客戶服務',
    services: ['FAQ問答', '菜品查詢', '過敏原資訊', '營業資訊', '聯絡方式'],
    cardTemplates: ['FAQCard', 'InfoCard', 'ContactCard'],
    dialogFlow: '問題理解 → 答案提供 → 深度說明 → 滿意確認',
    isActive: false,
    icon: '❓'
  },
  {
    id: 'order-tracking',
    name: '訂單追蹤',
    description: '查看訂單狀態和配送進度',
    services: ['訂單狀態', '配送追蹤', '訂單修改', '取消訂單', '客訴處理'],
    cardTemplates: ['OrderCard', 'StatusCard', 'TrackingCard'],
    dialogFlow: '訂單查詢 → 狀態顯示 → 操作選項 → 動作執行',
    isActive: false,
    icon: '📦'
  },
  {
    id: 'restaurant-info',
    name: '餐廳資訊',
    description: '餐廳地址、營業時間等基本資訊',
    services: ['地址導航', '營業時間', '環境介紹', '停車資訊', '交通指引'],
    cardTemplates: ['LocationCard', 'HoursCard', 'GalleryCard'],
    dialogFlow: '需求識別 → 資訊提供 → 動作執行 → 額外協助',
    isActive: false,
    icon: '🏪'
  },
  {
    id: 'payment',
    name: '支付結帳',
    description: '處理付款和結帳流程',
    services: ['支付方式', '優惠券', '發票開立', '付款確認', '收據發送'],
    cardTemplates: ['PaymentCard', 'ReceiptCard', 'InvoiceCard'],
    dialogFlow: '金額確認 → 支付選擇 → 細節確認 → 完成付款',
    isActive: false,
    icon: '💳'
  }
];

// 卡片模板註冊表
export const CARD_TEMPLATES: Record<string, CardTemplate> = {
  ProductCard: {
    id: 'ProductCard',
    component: null as any, // 將在組件中設定
    variants: ['compact', 'detailed', 'grid'],
    usageScenes: ['menu-ordering']
  },
  TimeSlotCard: {
    id: 'TimeSlotCard',
    component: null as any,
    variants: ['available', 'busy', 'closed'],
    usageScenes: ['reservation']
  },
  PromotionCard: {
    id: 'PromotionCard',
    component: null as any,
    variants: ['percentage', 'fixed_amount', 'buy_one_get_one'],
    usageScenes: ['promotion']
  },
  FAQCard: {
    id: 'FAQCard',
    component: null as any,
    variants: ['simple', 'detailed'],
    usageScenes: ['customer-service']
  },
  OrderCard: {
    id: 'OrderCard',
    component: null as any,
    variants: ['active', 'completed', 'cancelled'],
    usageScenes: ['order-tracking']
  },
  InfoCard: {
    id: 'InfoCard',
    component: null as any,
    variants: ['basic', 'featured'],
    usageScenes: ['restaurant-info', 'customer-service']
  },
  PaymentCard: {
    id: 'PaymentCard',
    component: null as any,
    variants: ['credit_card', 'mobile_payment', 'cash'],
    usageScenes: ['payment']
  }
};
