const CACHE_NAME = 'burmese-beacon-v2'; // Version မြှင့်လိုက်ပါ
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/myanmarflag.png',
  '/favicon.ico'
];

// Install: အခြေခံဖိုင်တွေကိုပဲ Cache လုပ်မယ်
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // SW အသစ်ကို ချက်ချင်း Activate ဖြစ်စေဖို့
});

// Fetch Logic: 
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Sidebar content သို့မဟုတ် Supabase API တွေဆိုရင် Network ကိုပဲ အရင်သွားမယ်
  // Cache ထဲကဟာကို မယူဘဲ အမြဲတမ်း Fresh ဖြစ်နေအောင် လုပ်တဲ့ Logic
  if (url.pathname.includes('sidebar_content') || url.host.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Redirect ဖြစ်နေရင် လုံခြုံရေးအရ အသစ်ပြန်ဆောက်ပေးမယ်
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
          // Network မရှိမှသာ Cache ထဲမှာ အဟောင်းရှိရင် ပြမယ်
          return caches.match(event.request);
        })
    );
    return;
  }

  // ကျန်တဲ့ Static assets (logo, icons) တွေအတွက် Cache-First Strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
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