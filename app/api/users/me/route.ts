import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  
  // If authResult is a NextResponse, it's an error
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Return the user data
  return NextResponse.json(authResult.dbUser);
}
