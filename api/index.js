import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

// In-memory cache
const cache = new Map();

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function setCache(key, value, ttlSeconds) {
  cache.set(key, {
    value,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
}

/**
 * GET /api/source/:id
 * Legacy endpoint - redirects to embed
 */
app.get('/api/source/:id', async (c) => {
  try {
    const id = c.req.param('id');
    return c.json({
      success: true,
      message: 'Use /embed/:id for video playback',
      embedUrl: `/embed/${id}`
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * GET /embed/:id
 * Main embed player route
 */
app.get('/embed/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const cacheKey = `embed:${id}`;

    // Try cache first
    const cachedSrc = getCache(cacheKey);
    if (cachedSrc) {
      console.log(`[Embed] Serving cached player for ${id}`);
      return c.html(generateCleanPlayer(cachedSrc));
    }

    console.log(`[Embed] Processing embed for ${id}`);

    // For direct iframe URLs, use them directly
    let iframeSrc = id;
    
    // If it's a URL, decode it
    if (id.startsWith('http') || id.includes('%3A%2F%2F')) {
      try {
        iframeSrc = decodeURIComponent(id);
      } catch (e) {
        iframeSrc = id;
      }
    }

    // Force HTTPS
    if (iframeSrc.startsWith('http://')) {
      iframeSrc = iframeSrc.replace('http://', 'https://');
    }

    // Cache the result
    setCache(cacheKey, iframeSrc, 1800); // 30 minutes

    // Serve the clean player
    return c.html(generateCleanPlayer(iframeSrc));

  } catch (error) {
    console.error('Embed error:', error.message);

    return c.html(generateErrorPage(
      'Video Not Available',
      'This video is currently not available for streaming.'
    ));
  }
});

/**
 * GET / (Homepage with test player)
 */
app.get('/', (c) => {
  const testUrl = 'https://hglink.to/e/0tmqi4jmtowr';
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Clean Video Player - Vercel</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          width: 100%;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 32px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .player-wrapper {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 */
          height: 0;
          overflow: hidden;
          border-radius: 12px;
          background: #000;
          margin-bottom: 20px;
        }
        .player-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #667eea;
        }
        .info h3 {
          color: #333;
          margin-bottom: 10px;
          font-size: 18px;
        }
        .info ul {
          color: #666;
          padding-left: 20px;
        }
        .info li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        code {
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }
        .badge {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">✓ Live Demo</div>
        <h1>🎬 Clean Video Player</h1>
        <p>Ad-free, clean video player with advanced blocking features</p>
        
        <div class="player-wrapper">
          <iframe src="/embed/${encodeURIComponent(testUrl)}" allowfullscreen allow="autoplay; encrypted-media; fullscreen"></iframe>
        </div>
        
        <div class="info">
          <h3>🚀 Features</h3>
          <ul>
            <li><strong>Ad Blocking:</strong> Aggressive popup and ad blocking</li>
            <li><strong>Clean Interface:</strong> Fullscreen video with no distractions</li>
            <li><strong>Caching:</strong> 30-minute cache for faster loading</li>
            <li><strong>Mobile Optimized:</strong> Works perfectly on all devices</li>
          </ul>
        </div>
        
        <div class="info" style="margin-top: 20px;">
          <h3>📖 Usage</h3>
          <ul>
            <li>Embed: <code>/embed/YOUR_VIDEO_URL</code></li>
            <li>Example: <code>/embed/${encodeURIComponent(testUrl)}</code></li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * Generate clean player HTML
 */
function generateCleanPlayer(iframeSrc) {
  // Force HTTPS
  if (iframeSrc && iframeSrc.startsWith('http://')) {
    iframeSrc = iframeSrc.replace('http://', 'https://');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
  <title>Video Player</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #000;
      overflow: hidden;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }
    #loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s ease;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
  <script>${getAdBlockScript()}</script>
</head>
<body>
  <div id="loader">
    <div class="spinner"></div>
  </div>
  <iframe 
    src="${iframeSrc}"
    allowfullscreen
    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope; clipboard-write"
    onload="document.getElementById('loader').style.opacity='0'; setTimeout(() => document.getElementById('loader').style.display='none', 500);"
  ></iframe>
</body>
</html>`;
}

/**
 * Generate error page
 */
function generateErrorPage(errorTitle, errorMessage) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${errorTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
    }
    .error-container {
      text-align: center;
      padding: 40px 20px;
      max-width: 500px;
      animation: fadeIn 0.5s ease-in;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #e94560;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      color: #a8b2d1;
      margin-bottom: 25px;
    }
    .info-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 20px;
      margin-top: 20px;
    }
    .info-box p {
      font-size: 14px;
      margin-bottom: 0;
      color: #8892b0;
    }
    .retry-btn {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 500;
      transition: all 0.3s ease;
      margin-top: 10px;
    }
    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="icon">🎬</div>
    <h1>${errorTitle}</h1>
    <p>${errorMessage}</p>
    <div class="info-box">
      <p>If this issue persists, please try again later.</p>
    </div>
    <a href="javascript:location.reload()" class="retry-btn">Retry</a>
  </div>
</body>
</html>`;
}

/**
 * Get AdBlock script
 */
function getAdBlockScript() {
  return `
(function() {
  'use strict';

  // Aggressive popup blocking
  const originalWindowOpen = window.open;
  window.open = function() {
    console.log('[AdBlock] Blocked popup window');
    return null;
  };

  // Block all new window/tab attempts
  window.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.target === '_blank') {
      e.preventDefault();
      e.stopPropagation();
      console.log('[AdBlock] Blocked new tab');
      return false;
    }
  }, true);

  // Block popunders
  window.addEventListener('blur', function(e) {
    if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
      e.stopImmediatePropagation();
    }
  }, true);

  // Block beforeunload popups
  window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return undefined;
  }, true);

  // Block common ad scripts
  const blockList = [
    'doubleclick', 'googlesyndication', 'googleadservices', 
    'adservice', 'advertising', 'adserver', '/ads/', 
    'popunder', 'popup', 'pop-up'
  ];

  // Override document.write
  const originalDocWrite = document.write;
  document.write = function(content) {
    if (blockList.some(pattern => content.toLowerCase().includes(pattern.toLowerCase()))) {
      return;
    }
    return originalDocWrite.apply(document, arguments);
  };

  // Block createElement
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'iframe') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && blockList.some(pattern => value.toLowerCase().includes(pattern.toLowerCase()))) {
          return;
        }
        return originalSetAttribute.apply(element, arguments);
      };
    }
    return element;
  };

  // Remove ads
  function removeAds() {
    const adSelectors = [
      '[class*="ad-"]', '[id*="ad-"]', '[class*="ads"]', '[id*="ads"]',
      '[class*="banner"]', '[class*="popup"]', '[class*="overlay"]:not([class*="player"])',
      'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
      'iframe[src*="advertising"]'
    ];
    
    adSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (!el.closest('.player') && !el.closest('.player-container') && !el.closest('[class*="player"]')) {
            el.remove();
          }
        });
      } catch (e) {}
    });
  }

  document.addEventListener('DOMContentLoaded', removeAds);
  setInterval(removeAds, 1000);

  // Block right-click on ads
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IFRAME' && e.target.src && 
        blockList.some(pattern => e.target.src.toLowerCase().includes(pattern))) {
      e.preventDefault();
      return false;
    }
  }, true);

  console.log('[Embed] Ad-blocking initialized');
})();
`;
}

// Start server (for local development)
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  serve({
    fetch: app.fetch,
    port
  });
  console.log(`🚀 Server running on http://localhost:${port}`);
}

// Export for Vercel
export default app;
