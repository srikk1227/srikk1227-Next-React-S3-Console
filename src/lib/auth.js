import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Get the current authenticated user
 * @returns {Promise<import('@clerk/nextjs/server').User | null>}
 */
export async function getCurrentUser() {
  try {
    return await currentUser();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user is authenticated and redirect to sign-in if not
 * @param {string} redirectTo - Where to redirect after sign-in
 */
export async function requireAuth(redirectTo = "/sign-in") {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(redirectTo);
  }
  
  return user;
}

/**
 * Check if user is authenticated (without redirect)
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get user's display name
 * @param {import('@clerk/nextjs/server').User} user
 * @returns {string}
 */
export function getUserDisplayName(user) {
  if (!user) return "Guest";
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.emailAddresses && user.emailAddresses.length > 0) {
    return user.emailAddresses[0].emailAddress;
  }
  
  return "User";
} 

export function protectApiRoute(handler) {
  return async (request) => {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      return handler(request);
    } catch (error) {
      console.error('API route authentication error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
} 