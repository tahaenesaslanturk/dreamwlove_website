'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "0f9585277314c32e18ead4ec56274f2f",
"index.html": "f885d79770e5fe8522aa6a1840e99b2b",
"/": "f885d79770e5fe8522aa6a1840e99b2b",
"main.dart.js": "5877b85bdc58642b9ed2bfb61641f389",
"favicon.png": "653f85e1e841c11a71ee89920f3e12e2",
"icons/Icon-192.png": "11385f65f83a3a0310bb7099f6e79345",
"icons/Icon-maskable-192.png": "11385f65f83a3a0310bb7099f6e79345",
"icons/Icon-maskable-512.png": "ebe3c28b0ba6b8ed668d2f3d1650fcc3",
"icons/Icon-512.png": "ebe3c28b0ba6b8ed668d2f3d1650fcc3",
"manifest.json": "7c674a482af6fe60752f299ab5c76904",
"assets/images/dwl.jpeg": "449491e602851195a8043da442155a81",
"assets/AssetManifest.json": "18e7b6df236d1fe9925f0782e41af2f2",
"assets/NOTICES": "5a956d4e8abf0e13190904d2fa229c51",
"assets/FontManifest.json": "c09df3c4c05c1680fc5a60a5a582a226",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/flutter_iconpicker/fonts/fa-solid-900.ttf": "0ea892e09437fcaa050b2b15c53173b7",
"assets/packages/flutter_iconpicker/fonts/LineAwesome.ttf": "bcc78af7963d22efd760444145073cd3",
"assets/packages/flutter_iconpicker/fonts/fa-regular-400.ttf": "d51b09f7b8345b41dd3b2201f653c62b",
"assets/packages/flutter_iconpicker/fonts/fa-brands-400.ttf": "51d23d1c30deda6f34673e0d5600fd38",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "ffed6899ceb84c60a1efa51c809a57e4",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "eaed33dc9678381a55cb5c13edaf241d",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "3241d1d9c15448a4da96df05f3292ffe",
"assets/packages/ionicons/fonts/Ionicons.ttf": "0cdf2a324d5c21f08c7f446476aa2ee3",
"assets/fonts/JosefinSans-Thin.ttf": "8f1a5916c7986af420490768a218375a",
"assets/fonts/JosefinSans-Bold.ttf": "9ac2a60828c8f6e627f4f628899398f0",
"assets/fonts/JosefinSans-Light.ttf": "feb0ce986e5e893281a1f05b549a7db9",
"assets/fonts/JosefinSans-LightItalic.ttf": "075ac7a067937bf14714771a7d3412f6",
"assets/fonts/JosefinSans-MediumItalic.ttf": "a727e17c6b49b78755f14f05d68e2462",
"assets/fonts/JosefinSans-SemiBold.ttf": "22108cbbdb8b3ab5b505fdedcd334efa",
"assets/fonts/JosefinSans-Regular.ttf": "6762afeccd02d16a80409b78fb85251c",
"assets/fonts/JosefinSans-ExtraLightItalic.ttf": "1feb71a31cb5136d62fa277568a2cfde",
"assets/fonts/JosefinSans-Medium.ttf": "f03e35cea2a49996d4e149a2b82cf987",
"assets/fonts/JosefinSans-BoldItalic.ttf": "b4436aa971b24be8f7823dbb18ea6fe5",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/fonts/JosefinSans-ThinItalic.ttf": "abac76c2ae47bd550b183ec45cf5fd8a",
"assets/fonts/JosefinSans-ExtraLight.ttf": "b416cdfefb8773398d7bde7095d7b48d",
"assets/fonts/JosefinSans-SemiBoldItalic.ttf": "dbdb2755b1d107b4ea14cd5dc4674a47"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
