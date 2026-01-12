const CACHE_NAME = 'burmese-beacon-v20'; // Version ကို v4 လို့ တိုးလိုက်ပါ (အရေးကြီးသည်)
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
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

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

// Fetch Logic ကို အရှင်းဆုံး ပြောင်းလိုက်ပါပြီ
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // PDF, Sitemap, API requests တွေကို Service Worker က လုံးဝ မထိအောင် လုပ်လိုက်ပါပြီ
  if (
    url.pathname.endsWith('.pdf') || 
    url.pathname.includes('/pdfjs') || 
    url.pathname.includes('sitemap.xml') || 
    url.pathname.includes('api') || 
    url.host.includes('supabase.co')
  ) {
    return; // Browser ကို သူ့ဘာသာ Network ကနေပဲ တိုက်ရိုက်ယူခိုင်းတာပါ
  }

  // ကျန်တဲ့ ပုံမှန်စာမျက်နှာတွေအတွက် Network ကို အရင်သွားမယ်၊ မရမှ Cache ကို သုံးမယ်
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});