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
 * GET /
 * Homepage
 */
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Clean Video Player API</title>
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
          max-width: 900px;
          width: 100%;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 36px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 18px;
        }
        .api-section {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 20px;
          border-left: 4px solid #667eea;
        }
        .api-section h3 {
          color: #333;
          margin-bottom: 15px;
          font-size: 20px;
        }
        .endpoint {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          border: 1px solid #e0e0e0;
        }
        .method {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 10px;
        }
        .path {
          font-family: 'Courier New', monospace;
          color: #667eea;
          font-weight: 600;
        }
        .description {
          color: #666;
          margin-top: 10px;
          line-height: 1.6;
        }
        .example {
          background: #2d3748;
          color: #e2e8f0;
          padding: 15px;
          border-radius: 8px;
          margin-top: 10px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          overflow-x: auto;
        }
        .badge {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 5px 15px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .test-btn {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          margin-top: 10px;
          transition: transform 0.2s;
        }
        .test-btn:hover {
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">✓ API Ready</div>
        <h1>🎬 Video Player API</h1>
        <p class="subtitle">Clean, ad-free video embedding with query parameters</p>
        
        <div class="api-section">
          <h3>📡 API Endpoints</h3>
          
          <div class="endpoint">
            <div>
              <span class="method">GET</span>
              <span class="path">/api/embed.js</span>
            </div>
            <p class="description">
              Get video player with query parameters
            </p>
            <div class="example">
              /api/embed.js?url=VIDEO_URL&autoplay=true
            </div>
            <a href="/api/embed.js?url=https://hglink.to/e/0tmqi4jmtowr" class="test-btn" target="_blank">Test This Endpoint</a>
          </div>
          
          <div class="endpoint">
            <div>
              <span class="method">GET</span>
              <span class="path">/api/source/:id</span>
            </div>
            <p class="description">
              Get video source information (JSON response)
            </p>
            <div class="example">
              /api/source/0tmqi4jmtowr
            </div>
            <a href="/api/source/0tmqi4jmtowr" class="test-btn" target="_blank">Test This Endpoint</a>
          </div>
          
          <div class="endpoint">
            <div>
              <span class="method">GET</span>
              <span class="path">/embed/:id</span>
            </div>
            <p class="description">
              Direct embed player (path parameter)
            </p>
            <div class="example">
              /embed/https://hglink.to/e/0tmqi4jmtowr
            </div>
            <a href="/embed/https://hglink.to/e/0tmqi4jmtowr" class="test-btn" target="_blank">Test This Endpoint</a>
          </div>
        </div>
        
        <div class="api-section">
          <h3>📖 Query Parameters</h3>
          <div class="endpoint">
            <p class="description">
              <strong>url</strong> - Video URL to embed (required)<br>
              <strong>autoplay</strong> - Enable autoplay (optional, default: false)<br>
              <strong>muted</strong> - Start muted (optional, default: false)
            </p>
            <div class="example">
              /api/embed.js?url=https://hglink.to/e/0tmqi4jmtowr&autoplay=true&muted=true
            </div>
          </div>
        </div>
        
        <div class="api-section">
          <h3>🔧 Usage in HTML</h3>
          <div class="example">
&lt;iframe 
  src="https://your-app.vercel.app/api/embed.js?url=VIDEO_URL"
  width="100%" 
  height="500"
  frameborder="0"
  allowfullscreen
&gt;&lt;/iframe&gt;
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * GET /api/embed.js
 * Query parameter based embed
 */
app.get('/api/embed.js', async (c) => {
  try {
    const url = c.req.query('url');
    const autoplay = c.req.query('autoplay') === 'true';
    const muted = c.req.query('muted') === 'true';

    if (!url) {
      return c.html(generateErrorPage(
        'Missing URL Parameter',
        'Please provide a video URL using the ?url= parameter'
      ));
    }

    const cacheKey = `embed:query:${url}`;

    // Try cache first
    const cachedSrc = getCache(cacheKey);
    if (cachedSrc) {
      console.log(`[Embed] Serving cached player for ${url}`);
      return c.html(generateCleanPlayer(cachedSrc, autoplay, muted));
    }

    console.log(`[Embed] Processing embed for ${url}`);

    let iframeSrc = url;

    // Force HTTPS
    if (iframeSrc.startsWith('http://')) {
      iframeSrc = iframeSrc.replace('http://', 'https://');
    }

    // Add autoplay/muted params if needed
    const separator = iframeSrc.includes('?') ? '&' : '?';
    const params = [];
    if (autoplay) params.push('autoplay=1');
    if (muted) params.push('muted=1');
    
    if (params.length > 0) {
      iframeSrc = `${iframeSrc}${separator}${params.join('&')}`;
    }

    // Cache the result
    setCache(cacheKey, iframeSrc, 1800); // 30 minutes

    return c.html(generateCleanPlayer(iframeSrc, autoplay, muted));

  } catch (error) {
    console.error('Embed error:', error.message);
    return c.html(generateErrorPage(
      'Video Not Available',
      'This video is currently not available for streaming.'
    ));
  }
});

/**
 * GET /api/source/:id
 * Get source information (JSON)
 */
app.get('/api/source/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    return c.json({
      success: true,
      id: id,
      embedUrl: `/embed/${id}`,
      apiUrl: `/api/embed.js?url=${encodeURIComponent(id)}`,
      message: 'Use embedUrl or apiUrl for video playback'
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
 * Path parameter based embed
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

    let iframeSrc = id;
    
    // If it's a URL, decode it
    if (id.includes('%')) {
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
    setCache(cacheKey, iframeSrc, 1800);

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
 * Generate clean player HTML
 */
function generateCleanPlayer(iframeSrc, autoplay = false, muted = false) {
  // Force HTTPS
  if (iframeSrc && iframeSrc.startsWith('http://')) {
    iframeSrc = iframeSrc.replace('http://', 'https://');
  }

  // Build iframe attributes
  const allowAttr = 'autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope; clipboard-write';

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
      flex-direction: column;
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
      margin-bottom: 20px;
    }
    .loading-text {
      color: rgba(255,255,255,0.7);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
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
    <div class="loading-text">Loading video...</div>
  </div>
  <iframe 
    id="videoFrame"
    src="${iframeSrc}"
    allowfullscreen
    allow="${allowAttr}"
    ${autoplay ? 'autoplay' : ''}
    ${muted ? 'muted' : ''}
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
