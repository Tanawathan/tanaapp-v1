// 為現有登入用戶初始化個人化資料
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../lib/supabase';

export async function POST(request: NextRequest) {
  console.log('🔄 Initializing user data API called');
  
  try {
    const body = await request.json();
    console.log('📥 Request body:', body);
    
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // 1. 檢查用戶是否存在
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // 2. 檢查並創建 AI 寵物
    let { data: aiPet, error: petError } = await supabase
      .from('ai_pets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (petError && petError.code === 'PGRST116') { // 沒有找到記錄
      console.log('🐾 Creating AI pet for user...');
      
      const { data: newPet, error: createPetError } = await supabase
        .from('ai_pets')
        .insert({
          user_id: userId,
          name: '阿狸',
          type: 'fox',
          level: 1,
          experience_points: 0,
          friendliness: 50,
          intelligence: 45,
          creativity: 55,
          proactivity: 35,
          humor: 40,
          total_conversations: 0,
          successful_recommendations: 0,
          customer_satisfaction_avg: 5.0
        })
        .select()
        .single();

      if (createPetError) {
        console.error('❌ Failed to create AI pet:', createPetError);
        throw createPetError;
      }
      
      aiPet = newPet;
      console.log('✅ AI pet created successfully');
    } else if (petError) {
      console.error('❌ Error fetching AI pet:', petError);
      throw petError;
    } else {
      console.log('✅ AI pet already exists');
    }

    // 3. 檢查並創建用戶偏好設定
    let { data: preferences, error: prefError } = await supabase
      .from('customer_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefError && prefError.code === 'PGRST116') { // 沒有找到記錄
      console.log('⚙️ Creating user preferences...');
      
      const { data: newPreferences, error: createPrefError } = await supabase
        .from('customer_preferences')
        .insert({
          user_id: userId,
          spice_tolerance: 3, // 預設中等辣度
          sweet_preference: 3,
          sour_preference: 3,
          salty_preference: 3,
          dietary_restrictions: [],
          allergens: [],
          preferred_cuisines: ['泰式'],
          decision_speed: 'moderate',
          price_sensitivity: 'moderate',
          adventurous_level: 5
        })
        .select()
        .single();

      if (createPrefError) {
        console.error('❌ Failed to create preferences:', createPrefError);
        throw createPrefError;
      }
      
      preferences = newPreferences;
      console.log('✅ User preferences created successfully');
    } else if (prefError) {
      console.error('❌ Error fetching preferences:', prefError);
      throw prefError;
    } else {
      console.log('✅ User preferences already exist');
    }

    // 4. 跳過創建初始對話記錄 - 避免資料庫架構問題
    console.log('ℹ️ Skipping initial interaction creation to avoid schema issues');

    const welcomeMessage = `歡迎回來，${user.name}！我是您的專屬AI助手阿狸，目前等級${aiPet.level}。我已經了解您的基本偏好設定，讓我們開始個人化的對話吧！🌟\n\n• 您的辣度偏好：中等\n• 偏愛料理：泰式料理\n• 冒險程度：中等\n\n我會根據您的回饋不斷學習和改進！`;

    return NextResponse.json({
      success: true,
      data: {
        user,
        aiPet,
        preferences,
        message: welcomeMessage
      }
    });

  } catch (error) {
    console.error('❌ Initialize user data error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
