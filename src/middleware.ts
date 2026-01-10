import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const referer = request.headers.get('referer') || ''
  const host = request.headers.get('host') || ''

  // ၁။ ထိပ်ဆုံးကနေ Static files တွေကို Middleware မဖြတ်ခိုင်းဘဲ လွှတ်ပေးမယ်
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|webp)$/) // File extension ပါရင် လွှတ်ပေးမယ်
  ) {
    return NextResponse.next()
  }

  // ၂။ ခြွင်းချက် (Exception) Page များ
  const isAuthOrRoot = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/admin-nmw' ||
    pathname.startsWith('/view-pdf')

  if (isAuthOrRoot) {
    return NextResponse.next()
  }

  // ၃။ Dashboard နဲ့ Admin ကို URL ကနေ တိုက်ရိုက်ဝင်တာ တားဆီးမယ်
  const isProtectedPath = pathname.startsWith('/dashboard') || (pathname.startsWith('/admin') && pathname !== '/admin-nmw')

  if (isProtectedPath) {
    const isInternal = referer.includes(host)
    if (!referer || !isInternal) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // ၄။ ကျန်တဲ့ ဘယ် Path ကိုမဆို Overview (/) ဆီ ပို့မယ်
  // (မှတ်ချက် - ဒီနေရာကို ရောက်လာတာဟာ image လည်းမဟုတ်၊ login လည်းမဟုတ်တဲ့ path တွေပဲ ဖြစ်ရမယ်)
  if (pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// ၅။ Matcher ကို အလွန်တိကျအောင် ပြန်ပြင်ခြင်း
export const config = {
  matcher: [
    /*
     * ၁။ API routes တွေကို ချန်မယ်
     * ၂။ Next.js static files (_next/static, _next/image) တွေကို ချန်မယ်
     * ၃။ PWA files (sw.js, manifest.json) တွေကို အတိအကျ ချန်မယ် (ဒါမှ Redirect မဖြစ်မှာပါ)
     * ၄။ Images, Icons, PDFs အစရှိတဲ့ Static assets တွေကို ချန်မယ်
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:png|jpg|jpeg|gif|svg|ico|pdf|webp)$).*)',
  ],
}