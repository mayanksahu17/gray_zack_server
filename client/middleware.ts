import { NextRequest, NextResponse } from 'next/server';

// List of protected routes
const protectedRoutes = [
  '/manager_dashboard',
  '/front_desk',
  '/restaurant_manager',
  '/housekeeper',
  '/scheck'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for authentication (userData cookie)
    const userData = request.cookies.get('userData')?.value;
    if (!userData) {
      // Not authenticated, redirect to home page
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    // Optionally: Add role-based checks here if needed
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Specify the matcher for which routes to run the middleware on
export const config = {
  matcher: [
    '/manager_dashboard',
    '/front_desk',
    '/restaurant_manager',
    '/housekeeper',
    '/scheck'
  ]
}; 