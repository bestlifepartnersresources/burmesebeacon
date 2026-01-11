const CACHE_NAME = 'burmese-beacon-v5'; // Version ကို v4 လို့ တိုးလိုက်ပါ (အရေးကြီးသည်)
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-512.png',
  '/icon-152.png',
  '/icon-192.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/myanmarflag.png',
  '/favicon.ico'
];

// Install: အခြေခံဖိုင်တွေကို Cache လုပ်မယ်
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(err => console.log('Failed to cache:', url));
        })
      );
    })
  );
  self.skipWaiting();
});

// Fetch Logic:
self.addEventListener('fetch', (event) => {
  // Login/Signup (POST) တွေဆိုရင် Middleware နဲ့ တိုက်ရိုက်အလုပ်လုပ်ပါစေ
  const url = new URL(event.request.url);
  // --- ဒီအပိုင်းကို အသစ်ထည့်ပေးပါ ---
  // Sitemap နဲ့ Robots.txt တို့ကို Service Worker က လုံးဝ မထိအောင် ကျော်ခိုင်းလိုက်မယ်
  if (url.pathname.includes('sitemap.xml') || url.pathname.includes('robots.txt')) {
    return; // ဘာမှမလုပ်ဘဲ Network ကို တိုက်ရိုက်သွားခိုင်းတာပါ
  }
// Login/Signup (POST) တွေဆိုရင် Middleware နဲ့ တိုက်ရိုက်အလုပ်လုပ်ပါစေ
  if (event.request.method !== 'GET') return;
  // ၁။ API နဲ့ Dynamic data (Supabase / Sidebar)
  // အရင်အတိုင်း Network အရင်သွားပြီး မရမှ Cache ကို သုံးပါတယ်
  if (url.pathname.includes('sidebar_content') || url.host.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Redirect handling (အရင်ပါပြီးသား logic)
          if (response.redirected) {
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // ၂။ Static Assets များ (ဒီနေရာကို ၅၀၃ မဖြစ်အောင် ပြင်ထားပါတယ်)
  // Network ကို အရင်သွားမယ်၊ Middleware က Redirect လုပ်တာကို အနှောင့်အယှက်မပေးတော့ဘူး
  event.respondWith(
    fetch(event.request)
      .then((fetchRes) => {
        // ပုံမှန် ၂၀၀ OK ဖြစ်တဲ့ response တွေကိုပဲ Cache ထဲ ထည့်မယ်/အပ်ဒိတ်လုပ်မယ်
        if (fetchRes.status === 200) {
          const fetchResClone = fetchRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            if (url.protocol.startsWith('http')) {
              cache.put(event.request, fetchResClone);
            }
          });
        }
        return fetchRes;
      })
      .catch(() => {
        // Network မရှိမှ (Offline ဖြစ်မှ) Cache ထဲက ရှာမယ်
        // အရင် App ကအတိုင်း Offline မှာ အလုပ်လုပ်နေပါလိမ့်မယ်
        return caches.match(event.request).then((cachedRes) => {
          return cachedRes || caches.match('/');
        });
      })
  );
});

// Activate: Old Cache တွေကို ရှင်းမယ်
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});