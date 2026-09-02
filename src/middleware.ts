import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ahmed-factory-dev-secret-change-me!');

const PUBLIC_PATHS = ['/login'];

const ROLE_ACCESS: Record<string, string[]> = {
  '/settings':   ['owner'],
  '/reports':    ['owner'],
  '/expenses':   ['owner'],
  '/billing':    ['owner', 'counter'],
  '/bills':      ['owner', 'counter'],
  '/customers':  ['owner', 'counter'],
  '/stock':      ['owner', 'store'],
  '/catalogue':  ['owner', 'store'],
};

function hasAccess(pathname: string, role: string): boolean {
  for (const [route, roles] of Object.entries(ROLE_ACCESS)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return roles.includes(role);
    }
  }
  return true;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets, API routes, and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Public paths don't need auth
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('session')?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;

    if (!hasAccess(pathname, role)) {
      // Redirect to dashboard if no access
      return NextResponse.redirect(new URL('/', req.url));
    }
  } catch {
    // Invalid token — redirect to login
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('session');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
