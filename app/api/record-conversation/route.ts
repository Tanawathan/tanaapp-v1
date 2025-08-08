// 記錄 AI 對話到資料庫
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../lib/supabase';

export async function POST(request: NextRequest) {
  console.log('💬 Recording conversation to database');
  
  try {
    const body = await request.json();
    console.log('📥 Request body:', body);
    
    const { 
      userId,
      sessionId, 
      userMessage,
      aiResponse,
      interactionType = 'general',
      contextData = {},
      extractedPreferences = {},
      sentimentScore,
      satisfactionRating,
      responseTimeMs
    } = body;

    if (!userId || !sessionId || !userMessage || !aiResponse) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: userId, sessionId, userMessage, aiResponse' 
      }, { status: 400 });
    }

    // 準備資料庫記錄 - 只使用絕對必要和確實存在的欄位
    const interactionData = {
      user_id: userId,
      session_id: sessionId,
      user_message: userMessage,
      ai_response: aiResponse,
      interaction_type: interactionType,
      satisfaction_rating: satisfactionRating
    };

    console.log('💾 Saving interaction to database:', {
      userId,
      sessionId,
      interactionType,
      messageLength: userMessage.length,
      responseLength: aiResponse.length
    });

    // 插入到資料庫
    const { data, error } = await supabase
      .from('ai_interactions')
      .insert(interactionData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      throw error;
    }

    console.log('✅ Conversation recorded successfully:', data.id);

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        message: 'Conversation recorded successfully'
      }
    });

  } catch (error) {
    console.error('❌ Record conversation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
