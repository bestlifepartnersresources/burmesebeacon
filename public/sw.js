const CACHE_NAME = 'burmese-beacon-v35'; // Version မြှင့်ထားပါတယ်

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

// Install: အခြေခံဖိုင်များကို Cache လုပ်ခြင်း
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
  // GET မဟုတ်ရင် Bypass လုပ်မယ်
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // --- အရေးကြီးဆုံးအပိုင်း: PDF နှင့် Supabase ကို Bypass လုပ်ခြင်း ---
  // ဒီဖိုင်တွေကို Service Worker က ကြားဖြတ်မဖမ်းအောင် တားထားခြင်းဖြစ်သည်
  if (
    url.pathname.endsWith('.pdf') || 
    url.pathname.includes('/pdfjs') || 
    url.host.includes('supabase.co') ||
    url.pathname.includes('sitemap.xml') ||
    url.pathname.includes('robots.txt')    
  ){
    return; // တိုက်ရိုက် Network သို့ လွှတ်ပေးလိုက်ပါ
  }

  // ၁။ API နှင့် Dynamic data (Sidebar စသည်ဖြင့်)
  if (url.pathname.includes('sidebar_content')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.redirected) {
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ၂။ အခြား Static Assets နှင့် စာမျက်နှာများ (Cache-First Strategy)
  // ဒီနည်းလမ်းက PDF မဟုတ်တဲ့ ကျန်တဲ့ စာမျက်နှာတွေကို Offline မှာ အလုပ်လုပ်စေမှာပါ
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // ၂၀၀ OK ဖြစ်မှ Cache ကို Update လုပ်မယ်
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline ဖြစ်ရင် Cache ကဟာကိုပြမယ်၊ မရှိရင် Home ကိုပြမယ်
        return cachedResponse || caches.match('/');
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Activate: Old Cache များကို ရှင်းထုတ်ခြင်း
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