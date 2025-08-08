// 餐廳預約 API
import { NextRequest, NextResponse } from 'next/server';
import { RestaurantReservationManager, ReservationData, ReservationState } from '../../lib/reservation-manager';

export async function POST(request: NextRequest) {
  console.log('🏮 Restaurant Reservation API called');
  
  try {
    const body = await request.json();
    console.log('📥 Request body:', body);
    
    const { action, ...data } = body;

    switch (action) {
      case 'parse_reservation':
        return await parseReservationIntent(data);
      case 'check_availability':
        return await checkTableAvailability(data);
      case 'create_reservation':
        return await createReservation(data);
      case 'get_time_slots':
        return await getAvailableTimeSlots(data);
      default:
        return NextResponse.json({ 
          success: false, 
          error: `Invalid action: ${action}` 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Reservation API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// 解析用戶訊息中的預約意圖
async function parseReservationIntent(data: { userMessage: string }) {
  try {
    const { userMessage } = data;
    
    const parsedData = RestaurantReservationManager.parseReservationIntent(userMessage);
    const validation = RestaurantReservationManager.validateReservationData(parsedData);
    
    // 計算下一步的收集狀態
    let nextStep: ReservationState['step'] = 'initial';
    if (!parsedData.reservationDate) nextStep = 'collecting_date';
    else if (!parsedData.reservationTime) nextStep = 'collecting_time';
    else if (!parsedData.partySize) nextStep = 'collecting_party_size';
    else if (!parsedData.customerName || !parsedData.customerPhone) nextStep = 'collecting_contact';
    else if (validation.isValid) nextStep = 'confirming';

    const state: ReservationState = {
      step: nextStep,
      data: parsedData,
      errors: validation.errors,
      suggestions: []
    };

    const prompt = RestaurantReservationManager.generateCollectionPrompt(state);

    return NextResponse.json({
      success: true,
      data: {
        parsedData,
        validation,
        nextStep,
        state,
        prompt,
        isComplete: validation.isValid
      }
    });
  } catch (error) {
    console.error('❌ Parse reservation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse reservation'
    }, { status: 500 });
  }
}

// 檢查桌位可用性
async function checkTableAvailability(data: { date: string; time: string; partySize: number; restaurantId?: string }) {
  try {
    const { date, time, partySize, restaurantId = 'default' } = data;
    
    const availableTables = await RestaurantReservationManager.getAvailableTables(
      date, 
      time, 
      partySize, 
      restaurantId
    );
    
    return NextResponse.json({
      success: true,
      data: {
        availableTables,
        isAvailable: availableTables.length > 0,
        recommendedTable: availableTables[0] || null,
        alternativeSlots: availableTables.length === 0 ? await getAlternativeTimeSlots(date, partySize, restaurantId) : []
      }
    });
  } catch (error) {
    console.error('❌ Check availability error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check availability'
    }, { status: 500 });
  }
}

// 創建預約
async function createReservation(data: { reservationData: ReservationData }) {
  try {
    const { reservationData } = data;
    
    const result = await RestaurantReservationManager.createReservation(reservationData);
    
    if (result.success && result.reservationId) {
      // 生成確認訊息
      const availableTables = await RestaurantReservationManager.getAvailableTables(
        reservationData.reservationDate,
        reservationData.reservationTime,
        reservationData.partySize,
        reservationData.restaurantId || 'default'
      );
      
      const tableName = availableTables[0]?.name || '適合桌位';
      const confirmationMessage = RestaurantReservationManager.generateConfirmationMessage(
        reservationData,
        result.reservationId,
        tableName
      );
      
      return NextResponse.json({
        success: true,
        data: {
          reservationId: result.reservationId,
          confirmationMessage,
          reservationData
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Create reservation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create reservation'
    }, { status: 500 });
  }
}

// 獲取可用時段
async function getAvailableTimeSlots(data: { date: string; partySize: number; restaurantId?: string }) {
  try {
    const { date, partySize, restaurantId = 'default' } = data;
    const timeSlots = [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
      '19:00', '19:30', '20:00', '20:30'
    ];
    
    const availableSlots = [];
    
    for (const time of timeSlots) {
      const tables = await RestaurantReservationManager.getAvailableTables(date, time, partySize, restaurantId);
      if (tables.length > 0) {
        availableSlots.push({
          time,
          availableTableCount: tables.length,
          recommendedTable: tables[0]
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        date,
        availableSlots,
        totalSlots: availableSlots.length
      }
    });
  } catch (error) {
    console.error('❌ Get time slots error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get time slots'
    }, { status: 500 });
  }
}

// 獲取替代時段
async function getAlternativeTimeSlots(date: string, partySize: number, restaurantId: string) {
  const timeSlots = ['18:00', '18:30', '19:00', '19:30', '20:00'];
  const alternatives = [];
  
  for (const time of timeSlots) {
    const tables = await RestaurantReservationManager.getAvailableTables(date, time, partySize, restaurantId);
    if (tables.length > 0) {
      alternatives.push({ time, tableCount: tables.length });
    }
  }
  
  return alternatives;
}
