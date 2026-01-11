import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const referer = request.headers.get('referer') || ''
  const host = request.headers.get('host') || ''

  // ၁။ Static Assets နဲ့ System Files များကို လွှတ်ပေးခြင်း (Whitelist)
  // PDF, Images, Fonts, PWA files (sw.js, manifest.json) အကုန်လုံး ပါဝင်ပါတယ်
  const isStaticFile = 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|webp|json|js|css|woff2?|webmanifest)$/i) ||
    pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico'

  if (isStaticFile) {
    return NextResponse.next()
  }

  // ၂။ ခြွင်းချက် (Public Pages) - Login မလိုဘဲ ဝင်ခွင့်ပြုမည့် Page များ
  const isPublicPage = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/admin-nmw' ||
    pathname.startsWith('/view-pdf')

  if (isPublicPage) {
    return NextResponse.next()
  }

  // ၃။ Dashboard နှင့် Admin Protection (Redirect Logic)
  const isProtectedPath = pathname.startsWith('/dashboard') || (pathname.startsWith('/admin') && pathname !== '/admin-nmw')

  if (isProtectedPath) {
    const isInternal = referer.includes(host)
    if (!referer || !isInternal) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // ၄။ ကျန်ရှိသော မသိသည့် Path များအားလုံးကို Home (/) သို့ ပို့ခြင်း
  if (pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// ၅။ Matcher Configuration (အမှားအယွင်းမရှိအောင် အတိအကျ သတ်မှတ်ခြင်း)
export const config = {
  matcher: [
    /*
     * middleware မဖြတ်ရမယ့် path တွေကို ဒီမှာ skip ထားတယ်
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:png|jpg|jpeg|gif|svg|ico|pdf|webp)$).*)',
  ],
}