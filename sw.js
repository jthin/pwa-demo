const HOST_URL = "azurestaticapps.net"; // We store our web app url to apply cache first strategy on our assets (we use an external url as an API).
const CACHE_NAME = 'pwa-cache-v1'; // cache name and version number (update version number for each update)
const DATA_CACHE_NAME = 'pwa-data-cache-v1'; // data cache from API calls

const CONTENT_TO_CACHE = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/styles/styles.css',
    '/assets/icons/android-chrome-192x192.png',
    '/assets/icons/android-chrome-512x512.png',
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/favicon-16x16.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/mstile-150x150.png',
    '/assets/icons/safari-pinned-tab.svg'
];

// Install event
self.addEventListener('install', function (e) {
    console.debug('Service Worker -- Install');

    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.debug('Service Worker -- Caching all: app shell and content');
            return cache.addAll(CONTENT_TO_CACHE);
        })
    );
});

// Activate event
self.addEventListener('activate', function (e) {
    console.debug('Service worker is ready!');

    // Clear old cache in case of updates (i.e sw code updates)
    const cacheKeepList = [CACHE_NAME, DATA_CACHE_NAME];

    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (cacheKeepList.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// Fetch event
self.addEventListener('fetch', function (e) {
    if (e.request.url.includes(HOST_URL)) {
        getFromCacheFirst(e);
    } else {
        getFromNetworkFirst(e);
    }
});

const getFromNetworkFirst = (e) => { // Get data from network first
    console.debug('Get data from network first:' + e.request.url);
    e.respondWith(
        fetch(e.request)
            .then(function (response) {
                return caches.open(DATA_CACHE_NAME).then(function (cache) {
                    console.debug('Service Worker -- Fetch and caching new resource: ' + e.request.url);
                    cache.put(e.request, response.clone());
                    return response;
                });
            })
            .catch(function () {
                console.debug('Service Worker -- Get data from cache: ' + e.request.url);
                return caches.match(e.request);
            })
    );
};

const getFromCacheFirst = (e) => { // Get data from cache first
    console.debug('Get data from cache first:' + e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (response) {
            if (response) {
                console.debug('Service Worker -- Get data from cache: ' + e.request.url);
                return response;
            }

            return fetch(e.request).then(function (response) {
                return caches.open(CACHE_NAME).then(function (cache) {
                    console.debug('Service Worker -- Fetch and caching new resource: ' + e.request.url);
                    cache.put(e.request, response.clone());
                    return response;
                });
            });
        })
    );
}; 