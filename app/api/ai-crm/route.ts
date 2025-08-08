// AI CRM API - 處理用戶註冊、AI寵物初始化和CRM數據管理
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../lib/supabase';

export async function POST(request: NextRequest) {
  console.log('🔍 AI-CRM API called');
  
  try {
    const body = await request.json();
    console.log('📥 Request body:', body);
    
    const { action, ...data } = body;

    switch (action) {
      case 'register_user':
        return await registerUser(data);
      case 'register_user_immediate':
        return await registerUserImmediate(data);
      case 'login_user':
        return await loginUser(data);
      case 'initialize_ai_pet':
        return await initializeAIPet(data);
      case 'get_user_crm':
        return await getUserCRM(data);
      case 'update_preferences':
        return await updateUserPreferences(data);
      default:
        console.error('❌ Invalid action:', action);
        return NextResponse.json({ 
          success: false, 
          error: `Invalid action: ${action}` 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ CRM API Error:', error);
    
    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * 註冊新用戶並創建AI寵物
 */
async function registerUser(data: { 
  phone: string;
  name?: string;
  email?: string;
}) {
  const { phone, name, email } = data;

  // 1. 創建或更新用戶
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({
      phone,
      name: name || '顧客',
      email,
      last_active_at: new Date().toISOString()
    })
    .select()
    .single();

  if (userError) throw userError;

  // 2. 檢查是否已有AI寵物
  const { data: existingPet, error: petCheckError } = await supabase
    .from('ai_pets')
    .select('*')
    .eq('user_id', user.id)
    .single();

  let aiPet;
  if (petCheckError && petCheckError.code === 'PGRST116') {
    // 沒有AI寵物，創建新的
    const { data: newPet, error: createPetError } = await supabase
      .from('ai_pets')
      .insert({
        user_id: user.id,
        name: 'A-Li 阿狸',
        level: 1,
        experience_points: 0,
        friendliness: 50,
        formality: 70,
        proactivity: 30,
        humor: 40,
        total_conversations: 0,
        successful_recommendations: 0,
        customer_satisfaction_avg: 5.0
      })
      .select()
      .single();

    if (createPetError) throw createPetError;
    aiPet = newPet;
  } else {
    aiPet = existingPet;
  }

  // 3. 初始化用戶偏好設定（如果不存在）
  const { error: prefError } = await supabase
    .from('customer_preferences')
    .upsert({
      user_id: user.id,
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
    });

  if (prefError && prefError.code !== '23505') { // 忽略重複插入錯誤
    console.warn('偏好設定創建警告:', prefError);
  }

  return NextResponse.json({
    success: true,
    data: {
      user,
      aiPet,
      message: aiPet.level === 1 && aiPet.experience_points === 0 
        ? '歡迎！我是您的專屬AI助手阿狸，讓我們一起開始美食之旅吧！🌟'
        : `歡迎回來！我是阿狸，目前等級${aiPet.level}，已經和您對話${aiPet.total_conversations}次了！😊`
    }
  });
}

/**
 * Enhanced immediate user registration with existing CRM data support
 */
async function registerUserImmediate(data: { 
  phone?: string | null;
  email?: string | null;
  name?: string;
  session_id: string;
  preferences?: any;
  interaction_context?: string;
}) {
  try {
    const { phone, email, name, session_id, preferences, interaction_context } = data;

    // Require at least phone or email
    if (!phone && !email) {
      return NextResponse.json({
        success: false,
        error: 'Phone number or email required for user registration'
      }, { status: 400 });
    }

    console.log(`🚀 Immediate user registration: phone=${phone}, email=${email}, name=${name}`);

  // 1. Enhanced existing user check with multiple criteria
  let query = supabase.from('users').select('*');
  
  // Build OR condition for phone and email lookup
  const orConditions = [];
  if (phone) orConditions.push(`phone.eq.${phone}`);
  if (email) orConditions.push(`email.eq.${email}`);
  
  const { data: existingUsers, error: checkError } = await query
    .or(orConditions.join(','))
    .order('created_at', { ascending: false })
    .limit(1);

  let user;
  let isExistingUser = false;
  
  if (existingUsers && existingUsers.length > 0) {
    const existingUser = existingUsers[0];
    isExistingUser = true;
    
    // Update existing user with new information
    const updateData: any = {
      last_active_at: new Date().toISOString()
    };
    
    // Only update if new data is provided and different
    if (name && name !== '顧客' && name !== existingUser.name) {
      updateData.name = name;
    }
    if (phone && !existingUser.phone) {
      updateData.phone = phone;
    }
    if (email && !existingUser.email) {
      updateData.email = email;
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', existingUser.id)
      .select()
      .single();

    if (updateError) throw updateError;
    user = updatedUser;
    console.log(`✅ Using existing user from CRM: ${user.id} (${user.name})`);
  } else {
    // Create new user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        phone: phone || null,
        email: email || null,
        name: name || '顧客',
        last_active_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) throw userError;
    user = newUser;
    console.log(`✅ Created new user: ${user.id}`);
  }

  // 2. Handle AI pet creation/retrieval for existing users
  const { data: existingPet, error: petCheckError } = await supabase
    .from('ai_pets')
    .select('*')
    .eq('user_id', user.id)
    .single();

  let aiPet;
  if (petCheckError && petCheckError.code === 'PGRST116') {
    // Create AI pet for new or existing users without one
    const petData = {
      user_id: user.id,
      name: 'A-Li 阿狸',
      level: 1,
      experience_points: 0,
      friendliness: 50,
      formality: 70,
      proactivity: 30,
      humor: 40,
      total_conversations: 0,
      successful_recommendations: 0,
      customer_satisfaction_avg: 5.0
    };

    // If this is an existing user from CRM, adjust AI pet settings
    if (isExistingUser) {
      petData.friendliness = 60; // More friendly for returning customers
      petData.proactivity = 40;  // More proactive with known customers
      petData.experience_points = 10; // Start with some experience
    }

    const { data: newPet, error: createPetError } = await supabase
      .from('ai_pets')
      .insert(petData)
      .select()
      .single();

    if (createPetError) throw createPetError;
    aiPet = newPet;
    console.log(`✅ Created AI pet for user ${user.id} (existing: ${isExistingUser})`);
  } else {
    aiPet = existingPet;
    console.log(`✅ Found existing AI pet for user ${user.id}`);
  }

  // 3. Enhanced preference handling for existing CRM users - 使用兼容的欄位
  if (preferences || isExistingUser) {
    try {
      // 檢查用戶是否已有偏好設定
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // 創建新的偏好設定 - 使用實際存在的欄位
        const preferenceData = {
          user_id: user.id,
          spice_tolerance: 3,
          sweet_preference: 3,
          sour_preference: 3,
          salty_preference: 3,
          dietary_restrictions: [],
          allergens: [],
          preferred_cuisines: ['泰式'],
          decision_speed: 'moderate',
          price_sensitivity: 'moderate',
          adventurous_level: isExistingUser ? 6 : 5
        };

        const { error: prefError } = await supabase
          .from('customer_preferences')
          .insert(preferenceData);

        if (prefError) {
          console.warn('Preference creation warning:', prefError);
        } else {
          console.log(`✅ Created preferences for ${isExistingUser ? 'existing' : 'new'} user`);
        }
      } else {
        console.log('✅ User preferences already exist');
      }
    } catch (error) {
      console.warn('偏好記錄失敗:', error);
    }
  }

  // 4. 記錄AI互動 (暫時註解，因為資料庫結構不一致)
  try {
    console.log('⚠️  AI互動記錄暫時停用，需要更新資料庫結構');
    /* 
    const { error: interactionError } = await supabase
      .from('ai_interactions')
      .insert({
        user_id: user.id,
        session_id: session_id,
        user_message: '用戶提供聯絡資訊',
        ai_response: `歡迎${user.name}！我已記住您的資訊，接下來可以為您提供更個人化的服務。`,
        registration_state: 'completed',
        data_collected: { phone, email, name, preferences }
      });

    if (interactionError) {
      console.warn('互動記錄警告:', interactionError);
    }
    */
  } catch (error) {
    console.warn('互動記錄失敗:', error);
  }

  // Generate personalized welcome message with login info
  const hasLoginCredentials = user.email && user.phone;
  
  let welcomeMessage;
  if (isExistingUser) {
    welcomeMessage = `Welcome back, ${user.name}! I'm A-Li, your AI assistant. I remember you from our previous interactions. Let me provide you with personalized service based on your preferences! 🌟`;
  } else {
    welcomeMessage = `Welcome ${user.name}! I'm A-Li, your new AI assistant. I've saved your information and I'm ready to provide personalized service. Let's start this journey together! 🌟`;
  }
  
  // Add login information if both email and phone are available
  if (hasLoginCredentials) {
    welcomeMessage += `\n\n🔐 Your account is now ready! You can log in anytime using:\n• Email: ${user.email}\n• Password: ${user.phone}\n\nThis will give you access to your personalized AI assistant and conversation history.`;
  }

  return NextResponse.json({
    success: true,
    user: user,
    aiPet: aiPet,
    isExistingUser: isExistingUser,
    hasLoginCredentials: hasLoginCredentials,
    message: welcomeMessage
  });
  
  } catch (error) {
    console.error('❌ RegisterUserImmediate error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    }, { status: 500 });
  }
}

/**
 * User Login - Email as username, Phone as password
 * Returns user data and AI pet information if credentials match
 */
async function loginUser(data: {
  email: string;
  password: string; // This will be the phone number
}) {
  try {
    const { email, password } = data;

    console.log(`🔐 User login attempt: email=${email}`);

    // Validation
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password (phone number) are required'
      }, { status: 400 });
    }

    // Clean and validate phone number (used as password)
    let cleanedPhone = password.replace(/\s+/g, '').replace(/-/g, '');
    if (cleanedPhone.startsWith('+886')) {
      cleanedPhone = '0' + cleanedPhone.substring(4);
    } else if (cleanedPhone.startsWith('886')) {
      cleanedPhone = '0' + cleanedPhone.substring(3);
    }

    // Validate Taiwan mobile number format
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format. Please use Taiwan mobile number format (09XXXXXXXX)'
      }, { status: 400 });
    }

    // Find user with matching email and phone
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('phone', cleanedPhone)
      .single();

    if (userError || !user) {
      console.log(`❌ Login failed: No user found with email ${email} and phone ${cleanedPhone}`);
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials. Please check your email and phone number.'
      }, { status: 401 });
    }

    // Update last login time and login count (if column exists)
    let updateData: any = {
      last_active_at: new Date().toISOString()
    };
    
    // Check if login_count column exists, if so include it in update
    try {
      const { data: columnCheck } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'users')
        .eq('column_name', 'login_count')
        .single();
      
      if (columnCheck) {
        updateData.login_count = (user.login_count || 0) + 1;
      }
    } catch (err) {
      console.log('ℹ️ login_count column not found, skipping login count update');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.warn('⚠️ Failed to update login time:', updateError);
    }

    // Get user's AI pet information
    const { data: aiPet, error: petError } = await supabase
      .from('ai_pets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (petError && petError.code !== 'PGRST116') {
      console.warn('⚠️ Failed to fetch AI pet:', petError);
    }

    // Get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('customer_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      console.warn('⚠️ Failed to fetch preferences:', prefError);
    }

    console.log(`✅ Login successful for user: ${user.id} (${user.name})`);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        last_active_at: user.last_active_at,
        login_count: user.login_count || 1  // Provide default if column doesn't exist
      },
      aiPet: aiPet,
      preferences: preferences,
      message: `Welcome back, ${user.name}! Ready to continue our conversation.`
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    }, { status: 500 });
  }
}

/**
 * 初始化AI寵物（現有用戶添加AI功能）
 */
async function initializeAIPet(data: { userId: string }) {
  const { userId } = data;

  const { data: aiPet, error } = await supabase
    .from('ai_pets')
    .insert({
      user_id: userId,
      name: 'A-Li 阿狸',
      level: 1,
      experience_points: 0,
      friendliness: 50,
      formality: 70,
      proactivity: 30,
      humor: 40
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: { aiPet }
  });
}

/**
 * 獲取用戶完整CRM數據
 */
async function getUserCRM(data: { userId: string }) {
  const { userId } = data;

  // 並行查詢所有CRM數據
  const [
    { data: user, error: userError },
    { data: aiPet, error: petError },
    { data: preferences, error: prefError },
    { data: recentInteractions, error: interactionsError },
    { data: achievements, error: achievementsError }
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('ai_pets').select('*').eq('user_id', userId).single(),
    supabase.from('customer_preferences').select('*').eq('user_id', userId).single(),
    supabase.from('ai_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId)
  ]);

  // 收集所有錯誤但不中斷
  const errors = [userError, petError, prefError, interactionsError, achievementsError]
    .filter(err => err !== null);

  if (errors.length > 0) {
    console.warn('CRM數據查詢警告:', errors);
  }

  return NextResponse.json({
    success: true,
    data: {
      user: user || null,
      aiPet: aiPet || null,
      preferences: preferences || null,
      recentInteractions: recentInteractions || [],
      achievements: achievements || []
    }
  });
}

/**
 * 更新用戶偏好設定
 */
async function updateUserPreferences(data: {
  userId: string;
  preferences: Record<string, any>;
}) {
  const { userId, preferences } = data;

  const { data: updatedPrefs, error } = await supabase
    .from('customer_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // 同時更新AI寵物的學習點數
  const { error: petUpdateError } = await supabase
    .from('ai_pets')
    .update({
      experience_points: supabase.rpc('increment', { x: 5 }), // 增加5點經驗
      last_interaction_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (petUpdateError) {
    console.warn('AI寵物經驗更新失敗:', petUpdateError);
  }

  return NextResponse.json({
    success: true,
    data: { preferences: updatedPrefs }
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');

  try {
    switch (action) {
      case 'check_user':
        if (!userId) {
          return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }
        return await checkUserExists(userId);
        
      case 'ai_pet_status':
        if (!userId) {
          return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }
        return await getAIPetStatus(userId);
        
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('CRM GET API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * 檢查用戶是否存在
 */
async function checkUserExists(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, phone, name, last_active_at')
    .eq('id', userId)
    .single();

  return NextResponse.json({
    success: true,
    data: { 
      exists: !error && !!user,
      user: error ? null : user
    }
  });
}

/**
 * 獲取AI寵物狀態
 */
async function getAIPetStatus(userId: string) {
  const { data: aiPet, error } = await supabase
    .from('ai_pets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    return NextResponse.json({
      success: true,
      data: { 
        exists: false,
        aiPet: null
      }
    });
  }

  // 計算升級進度
  const nextLevelExp = aiPet.level * 100; // 每級需要 level * 100 經驗
  const progressPercent = (aiPet.experience_points % nextLevelExp) / nextLevelExp * 100;

  return NextResponse.json({
    success: true,
    data: {
      exists: true,
      aiPet: {
        ...aiPet,
        nextLevelExp,
        progressPercent,
        canLevelUp: aiPet.experience_points >= nextLevelExp
      }
    }
  });
}
