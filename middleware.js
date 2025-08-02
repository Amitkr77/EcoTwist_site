// import { NextResponse } from 'next/server';

// export function middleware(request) {
//   const token = request.cookies.get('token');
//   const isProtected = request.nextUrl.pathname.startsWith('/dashboard');

//   if (isProtected && !token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/dashboard/:path*'],
// };


// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('token')?.value;

  const protectedRoutes = ['/cart', '/checkout', '/account'];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/account/:path*'],
};
