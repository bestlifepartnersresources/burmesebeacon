const CACHE_NAME = 'burmese-beacon-v3'; // Version တစ်ခု ထပ်တိုးလိုက်ပါ
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
      // တစ်ခါတလေ ဖိုင်တစ်ခုမရှိရင် addAll တစ်ခုလုံး Fail တတ်လို့ map နဲ့ စစ်ပါမယ်
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
  const url = new URL(event.request.url);

  // API နဲ့ Dynamic data (Supabase) ဆိုရင် Network ကို အရင်သွားမယ်
  if (url.pathname.includes('sidebar_content') || url.host.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Redirect handling
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
          // Network မရှိမှ Cache ကို ပြန်စစ်မယ်
          return caches.match(event.request);
        })
    );
    return;
  }

  // Static Assets များအတွက် Cache-First Strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then(fetchRes => {
        // ပုံအသစ်တွေဝင်လာရင်လည်း Cache ထဲ အလိုအလျောက် ထည့်သွားမယ်
        return caches.open(CACHE_NAME).then(cache => {
          if (event.request.url.startsWith('http')) { // chrome extension တွေကို cache မလုပ်အောင်
             cache.put(event.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      }).catch(() => {
         // လုံးဝအင်တာနက်မရှိဘဲ cache ထဲမှာလည်းမရှိရင် ဘာမှမပေါ်တာမျိုးမဖြစ်အောင်
         return caches.match('/'); 
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