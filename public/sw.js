const CACHE_NAME = 'burmese-beacon-v4'; // Version တိုးလိုက်ပါ
const urlsToCache = [
  '/',
  '/manifest.json',
  '/myanmarflag.png',
  '/favicon.ico'
];

// Install: ဖိုင်အခြေခံတွေကို သိမ်းမယ်
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

// Fetch: ဒီနေရာက အဓိက ပြင်ရမှာပါ
self.addEventListener('fetch', (event) => {
  // ၁။ POST request (Login/Signup) တွေကို လုံးဝ Cache မလုပ်ဘဲ လွှတ်ပေးမယ်
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ၂။ Supabase နဲ့ API တွေကို Network တိုက်ရိုက်သွားမယ် (Bypass Cache)
  if (url.host.includes('supabase.co') || url.pathname.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // ၃။ Network-First Strategy (အင်တာနက် အရင်ကြည့်မယ်)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Redirect ဖြစ်နေတဲ့ response (301, 302, 307) သို့မဟုတ် 503 ဆိုရင် Cache မလုပ်ဘူး
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // အဆင်ပြေတဲ့ Response ကိုမှ Cache ထဲ ထည့်မယ်
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (url.protocol.startsWith('http')) {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      })
      .catch(() => {
        // အင်တာနက် လုံးဝမရှိမှသာ သိမ်းထားတဲ့ Cache ထဲက ရှာမယ်
        return caches.match(event.request);
      })
  );
});

// Activate: Cache အဟောင်းတွေ ရှင်းမယ်
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