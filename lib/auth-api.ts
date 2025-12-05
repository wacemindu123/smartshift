import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/db/connection';

export type UserRole = 'OPERATOR' | 'EMPLOYEE';

export interface AuthenticatedUser {
  userId: string;
  clerkId: string;
  role: UserRole;
  dbUser: any; // Prisma User type
}

/**
 * Get authenticated user from request
 */
export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return null;
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    // Get or create database user
    let dbUser = await prisma.user.findUnique({
      where: { clerkId }
    });

    const userEmail = clerkUser.emailAddresses[0].emailAddress;
    
    // HARDCODED FOR LOCAL DEVELOPMENT
    // Force specific email to be OPERATOR
    let userRole: UserRole = 'EMPLOYEE';
    if (userEmail === 'widgeon1996@gmail.com') {
      userRole = 'OPERATOR';
      console.log('🔧 HARDCODED: Setting widgeon1996@gmail.com as OPERATOR');
    } else {
      userRole = (clerkUser.publicMetadata?.role as UserRole) || 'EMPLOYEE';
    }

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || userEmail,
          email: userEmail,
          role: userRole,
        },
      });
    } else if (dbUser.role !== userRole) {
      // Sync role if changed
      console.log(`Syncing role for ${dbUser.email}: ${dbUser.role} -> ${userRole}`);
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: userRole },
      });
    }

    return {
      userId: dbUser.id,
      clerkId,
      role: userRole,
      dbUser,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Require authentication for API route
 */
export async function requireAuth() {
  const user = await getAuthUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return user;
}

/**
 * Require operator role for API route
 */
export async function requireOperator() {
  const user = await getAuthUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  if (user.role !== 'OPERATOR') {
    return NextResponse.json(
      { error: 'Forbidden - Operator access required' },
      { status: 403 }
    );
  }
  
  return user;
}
