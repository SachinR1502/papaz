import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const role = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    // 1. If trying to access login/register while logged in, redirect to home/dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
        const userRole = role?.toLowerCase();
        if (userRole === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        if (userRole === 'supplier') {
            return NextResponse.redirect(new URL('/supplier/dashboard', request.url));
        }
        if (userRole === 'technician') {
            return NextResponse.redirect(new URL('/technician/dashboard', request.url));
        }
        // For other roles or if role is missing but token exists, go to home
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 2. If trying to access protected routes without token, redirect to login
    const isProtectedRoute =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/supplier') ||
        pathname.startsWith('/technician') ||
        pathname.startsWith('/account') ||
        pathname.startsWith('/checkout');

    if (!token && isProtectedRoute) {
        // Save the attempted URL to redirect back after login (optional enhancement)
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Role-based protection
    if (token) {
        const userRole = role?.toLowerCase();

        // Admin only routes
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Technician only routes
        if (pathname.startsWith('/technician') && userRole !== 'technician') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Supplier only routes
        if (pathname.startsWith('/supplier')) {
            if (userRole !== 'supplier') {
                return NextResponse.redirect(new URL('/', request.url));
            }

            const isCompleted = request.cookies.get('profile_completed')?.value === 'true';
            const onOnboardingPage = pathname === '/supplier/onboarding';

            if (!isCompleted && !onOnboardingPage) {
                return NextResponse.redirect(new URL('/supplier/onboarding', request.url));
            }

            if (isCompleted && onOnboardingPage) {
                return NextResponse.redirect(new URL('/supplier/dashboard', request.url));
            }
        }
    }

    return NextResponse.next();
}

// Config for matching routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images, icons, logo (static assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|icons|logo).*)',
    ],
};
