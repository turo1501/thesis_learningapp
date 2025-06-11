import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const url = new URL(request.url);
    const requestedUserId = url.searchParams.get('userId');

    // Verify the requesting user is authenticated and requesting their own data
    if (!userId || userId !== requestedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get userType from public metadata, default to 'user'
    const userType = user.publicMetadata?.userType as string || 'user';

    return NextResponse.json({ 
      userType,
      userId: user.id,
      success: true
    });

  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 