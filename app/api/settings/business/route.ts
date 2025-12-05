import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOperator } from '@/lib/auth-api';

// GET /api/settings/business - Get business settings
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Return default settings for now
  const settings = {
    maxStaffCapacity: 7,
    optimalStaffMin: 5,
    optimalStaffMax: 7,
    maxFrontOfHouse: 3,
    maxBackOfHouse: 4,
    standardOpenTime: '07:00',
    standardCloseTime: '15:00',
    averageHourlyWage: 15,
    overtimeThreshold: 40,
  };

  return NextResponse.json(settings);
}

// POST /api/settings/business - Update business settings (operators only)
export async function POST(request: NextRequest) {
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const settings = await request.json();
    
    // For now, just return the settings
    // In production, save to database
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
