/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║       PHISHING AWARENESS DEMO — NODE.JS BACKEND              ║
 * ║  Educational cybersecurity simulation server                  ║
 * ║  NO real data is stored. All submissions are in-memory only.  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 * This Express server handles:
 *  - Serving static HTML pages (login, awareness, dashboard, email)
 *  - Receiving form submissions (for demo purposes ONLY)
 *  - Providing a dashboard API with aggregated demo data
 *  - Rate limiting to demonstrate basic protection
 *
 * IMPORTANT: This is for EDUCATIONAL USE ONLY.
 * Credentials are never written to disk or any external service.
 */

const express    = require('express');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────────
//  IN-MEMORY STORE (no database, no disk writes)
//  Resets completely when server restarts.
// ─────────────────────────────────────────────────────────────────
const demoStore = {
  submissions: [],     // Array of submission objects
  startTime: Date.now(),
  totalHits: 0,        // Total page loads (analytics)
};

// ─────────────────────────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all HTML/CSS/JS from the root directory
app.use(express.static(path.join(__dirname, '../')));

// ── Request logger (educational: shows what a server sees) ──
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] ${req.method} ${req.path} — IP: ${getClientIP(req)}`;
  console.log(log);
  demoStore.totalHits++;
  next();
});

// ─────────────────────────────────────────────────────────────────
//  RATE LIMITING (demonstrates basic protection)
//  Limits each IP to 10 login attempts per 15 minutes.
// ─────────────────────────────────────────────────────────────────
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // max 10 submissions per window
  message: {
    error: 'Too many submissions from this IP. This demonstrates rate limiting protection.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️  Rate limit hit from IP: ${getClientIP(req)}`);
    res.status(429).json({
      error: 'Rate limit reached. In a real scenario, this would block brute-force attacks.',
      demo: true
    });
  }
});

// ─────────────────────────────────────────────────────────────────
//  ROUTES — Static Pages
// ─────────────────────────────────────────────────────────────────

// Root → Login page (fake bank login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Awareness page
app.get('/awareness.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../awareness.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard.html'));
});

// Phishing email example
app.get('/phishing-email.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../phishing-email.html'));
});

// ─────────────────────────────────────────────────────────────────
//  API: HANDLE FORM SUBMISSION
//  This is the core "phishing capture" endpoint.
//  In real attack: attacker stores permanently and silently redirects.
//  In this demo: store in memory, redirect to awareness page.
// ─────────────────────────────────────────────────────────────────
app.post('/api/submit', submitLimiter, (req, res) => {
  const { email, password } = req.body;
  const ip = getClientIP(req);
  const ua = req.headers['user-agent'] || 'Unknown';

  // ── Parse browser and OS from User-Agent ──
  const browser = parseBrowser(ua);
  const os      = parseOS(ua);

  // ── Build submission record (DEMO ONLY — never persisted) ──
  const submission = {
    id:        demoStore.submissions.length + 1,
    timestamp: new Date().toISOString(),
    email:     email     || '',
    password:  password  || '',   // In demo only — real attacker stores plaintext
    ip:        ip,
    userAgent: ua,
    browser:   browser,
    os:        os,
    referer:   req.headers['referer'] || 'Direct',
  };

  // Store in memory (only)
  demoStore.submissions.push(submission);

  // ── Console log for educational demonstration ──
  console.log('\n' + '─'.repeat(60));
  console.log('🎣 DEMO: Credential capture simulated!');
  console.log('─'.repeat(60));
  console.log(`📧 Email:     ${submission.email}`);
  console.log(`🔑 Password:  ${'*'.repeat(submission.password.length)} (${submission.password.length} chars)`);
  console.log(`🌐 IP:        ${submission.ip}`);
  console.log(`🖥️  Browser:   ${submission.browser}`);
  console.log(`💻 OS:        ${submission.os}`);
  console.log(`⏰ Time:      ${submission.timestamp}`);
  console.log('─'.repeat(60));
  console.log('⚠️  DEMO ONLY: No data was stored permanently.\n');

  // ── Respond with redirect to awareness page ──
  res.json({
    success: true,
    demo: true,
    message: 'This is a cybersecurity awareness demo. No data was stored.',
    redirect: `/awareness.html?email=${encodeURIComponent(email)}&ts=${encodeURIComponent(submission.timestamp)}&password=${encodeURIComponent(maskForURL(password))}`
  });
});

// ─────────────────────────────────────────────────────────────────
//  API: DASHBOARD DATA
//  Returns aggregated demo statistics for the dashboard page.
//  Password values are masked even in this demo API response.
// ─────────────────────────────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  const submissions = demoStore.submissions;

  // Compute unique IPs
  const uniqueIPs = new Set(submissions.map(s => s.ip)).size;

  // Compute average time between submissions (seconds)
  let avgResponseTime = 0;
  if (submissions.length > 1) {
    const times = submissions.map(s => new Date(s.timestamp).getTime());
    const diffs = times.slice(1).map((t, i) => (t - times[i]) / 1000);
    avgResponseTime = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
  }

  // Return with passwords masked for extra caution
  const safeSubs = submissions.map(s => ({
    ...s,
    password: maskPassword(s.password),
    // Never return full password even in demo dashboard
  }));

  res.json({
    totalSubmissions: submissions.length,
    uniqueIPs,
    avgResponseTime,
    totalHits: demoStore.totalHits,
    serverUptime: Math.round((Date.now() - demoStore.startTime) / 1000),
    submissions: safeSubs,
    disclaimer: 'DEMO ONLY — no data is permanently stored'
  });
});

// ─────────────────────────────────────────────────────────────────
//  API: CLEAR ALL DATA
//  Allows demo reset without restarting server.
// ─────────────────────────────────────────────────────────────────
app.post('/api/clear', (req, res) => {
  const count = demoStore.submissions.length;
  demoStore.submissions = [];
  console.log(`🗑  Cleared ${count} demo submissions from memory.`);
  res.json({ success: true, cleared: count, message: 'All demo data cleared from memory.' });
});

// ─────────────────────────────────────────────────────────────────
//  API: SERVER STATUS (health check)
// ─────────────────────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    demo: true,
    disclaimer: 'This is a cybersecurity awareness demo. No real data is stored.',
    submissions: demoStore.submissions.length,
    uptime: Math.round((Date.now() - demoStore.startTime) / 1000) + 's'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', demo: true });
});

// ─────────────────────────────────────────────────────────────────
//  UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Get client IP, respecting proxy headers.
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'Unknown'
  );
}

/**
 * Parse browser name from User-Agent string.
 */
function parseBrowser(ua) {
  if (!ua) return 'Unknown';
  if (ua.includes('Edg/'))           return 'Microsoft Edge';
  if (ua.includes('OPR/'))           return 'Opera';
  if (ua.includes('Chrome/'))        return 'Google Chrome';
  if (ua.includes('Firefox/'))       return 'Mozilla Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Apple Safari';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer';
  return 'Unknown Browser';
}

/**
 * Parse OS name from User-Agent string.
 */
function parseOS(ua) {
  if (!ua) return 'Unknown';
  if (ua.includes('Windows NT 10'))  return 'Windows 10/11';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows'))        return 'Windows';
  if (ua.includes('Mac OS X'))       return 'macOS';
  if (ua.includes('Android'))        return 'Android';
  if (ua.includes('iPhone'))         return 'iOS (iPhone)';
  if (ua.includes('iPad'))           return 'iOS (iPad)';
  if (ua.includes('Linux'))          return 'Linux';
  return 'Unknown OS';
}

/**
 * Mask password for dashboard display (show first+last char only).
 */
function maskPassword(pw) {
  if (!pw || pw.length === 0) return '(empty)';
  if (pw.length <= 2) return '****';
  return pw[0] + '●'.repeat(Math.min(pw.length - 2, 8)) + pw[pw.length - 1];
}

/**
 * Mask password for URL parameter (show length only).
 * We pass a masked version to the awareness page.
 */
function maskForURL(pw) {
  if (!pw) return '';
  return pw[0] + '*'.repeat(Math.max(pw.length - 1, 0));
}

// ─────────────────────────────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║    CYBERSECURITY AWARENESS DEMO SERVER           ║');
  console.log('║    Educational Phishing Simulation               ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  🌐 Running at: http://localhost:${PORT}           ║`);
  console.log(`║  📊 Dashboard:  http://localhost:${PORT}/dashboard  ║`);
  console.log(`║  📧 Email Demo: http://localhost:${PORT}/phishing-email.html ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  ⚠️  FOR EDUCATIONAL USE ONLY                     ║');
  console.log('║  No data is stored permanently.                  ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

module.exports = app; // For testing
