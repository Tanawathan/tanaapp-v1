import React from 'react';
import { CardTemplate, CARD_TEMPLATES } from '../types/scenes';

// 產品卡片組件 (已存在的ProductCard)
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    emoji: string;
    rating?: number;
    category?: string;
    spiciness?: string;
    description?: string;
    ingredients?: string[];
  };
  variant?: 'compact' | 'detailed' | 'grid';
  onDetailClick?: (product: any) => void;
  onAddToCart?: (product: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'compact',
  onDetailClick,
  onAddToCart
}) => {
  return (
    <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col items-center">
        <span className="text-xl mb-1">{product.emoji}</span>
        <h4 className="font-bold text-gray-800 text-xs mb-1">{product.name}</h4>
        <p className="text-orange-600 font-bold text-sm mb-2">¥{product.price}</p>
        <div className="flex space-x-1 w-full">
          <button 
            onClick={() => onDetailClick?.(product)}
            className="flex-1 bg-blue-500 text-white py-1.5 rounded-md font-medium text-xs hover:bg-blue-600 transition-colors"
          >
            詳細
          </button>
          <button 
            onClick={() => onAddToCart?.(product)}
            className="flex-1 bg-orange-500 text-white py-1.5 rounded-md font-medium text-xs hover:bg-orange-600 transition-colors"
          >
            加入
          </button>
        </div>
      </div>
    </div>
  );
};

// 時段卡片組件 (新)
interface TimeSlotCardProps {
  timeSlot: {
    id: string;
    time: string;
    date: string;
    availableTables: number;
    totalTables: number;
    price?: number;
  };
  variant?: 'available' | 'busy' | 'closed';
  onReserve?: (timeSlot: any) => void;
}

export const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  timeSlot,
  variant = 'available',
  onReserve
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'available':
        return 'border-green-200 bg-green-50';
      case 'busy':
        return 'border-yellow-200 bg-yellow-50';
      case 'closed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusColor = () => {
    switch (variant) {
      case 'available':
        return 'text-green-600';
      case 'busy':
        return 'text-yellow-600';
      case 'closed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`rounded-xl p-3 border ${getVariantStyle()} shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-800">{timeSlot.time}</span>
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {timeSlot.availableTables}/{timeSlot.totalTables} 桌
        </span>
      </div>
      
      <div className="text-xs text-gray-600 mb-3">
        {timeSlot.date}
      </div>
      
      <button
        onClick={() => onReserve?.(timeSlot)}
        disabled={variant === 'closed' || timeSlot.availableTables === 0}
        className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
          variant === 'available' && timeSlot.availableTables > 0
            ? 'bg-green-500 text-white hover:bg-green-600'
            : variant === 'busy' && timeSlot.availableTables > 0
            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {variant === 'closed' || timeSlot.availableTables === 0 ? '已滿' : '預約'}
      </button>
    </div>
  );
};

// 優惠卡片組件 (新)
interface PromotionCardProps {
  promotion: {
    id: string;
    title: string;
    description: string;
    discount: string;
    validUntil: string;
    type: 'percentage' | 'fixed_amount' | 'buy_one_get_one';
  };
  variant?: 'percentage' | 'fixed_amount' | 'buy_one_get_one';
  onClaim?: (promotion: any) => void;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  variant = 'percentage',
  onClaim
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'percentage':
        return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200';
      case 'fixed_amount':
        return 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200';
      case 'buy_one_get_one':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <div className={`rounded-xl p-4 border ${getVariantStyle()} shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-gray-800 text-sm">{promotion.title}</h4>
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {promotion.discount}
        </span>
      </div>
      
      <p className="text-gray-600 text-xs mb-3 leading-relaxed">
        {promotion.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {promotion.validUntil}
        </span>
        <button
          onClick={() => onClaim?.(promotion)}
          className="bg-red-500 text-white py-1.5 px-3 rounded-lg font-medium text-xs hover:bg-red-600 transition-colors"
        >
          使用優惠
        </button>
      </div>
    </div>
  );
};

// 卡片渲染器類
export class CardRenderer {
  private templates: Map<string, CardTemplate>;

  constructor() {
    this.templates = new Map();
    this.registerDefaultTemplates();
  }

  // 註冊預設模板
  private registerDefaultTemplates() {
    this.registerTemplate({
      ...CARD_TEMPLATES.ProductCard,
      component: ProductCard
    });

    this.registerTemplate({
      ...CARD_TEMPLATES.TimeSlotCard,
      component: TimeSlotCard
    });

    this.registerTemplate({
      ...CARD_TEMPLATES.PromotionCard,
      component: PromotionCard
    });
  }

  // 註冊新模板
  registerTemplate(template: CardTemplate): void {
    this.templates.set(template.id, template);
  }

  // 渲染卡片
  renderCard(templateId: string, data: any, variant?: string): React.ReactElement | null {
    const template = this.templates.get(templateId);
    if (!template) {
      console.warn(`Template not found: ${templateId}`);
      return null;
    }

    const Component = template.component;
    return React.createElement(Component, {
      ...data,
      variant: variant || template.variants[0],
      key: data.id || Math.random()
    });
  }

  // 獲取可用模板
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  // 檢查模板是否存在
  hasTemplate(templateId: string): boolean {
    return this.templates.has(templateId);
  }
}

// 全局卡片渲染器實例
export const cardRenderer = new CardRenderer();
