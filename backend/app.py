"""
╔═══════════════════════════════════════════════════════════════╗
║       PHISHING AWARENESS DEMO — PYTHON FLASK BACKEND         ║
║  Alternative to the Node.js server. Use either, not both.    ║
║  NO real data is stored. All submissions are in-memory only.  ║
╚═══════════════════════════════════════════════════════════════╝

Educational cybersecurity phishing simulation server.
Run with: python app.py

Requirements:
    pip install flask flask-limiter

IMPORTANT: FOR EDUCATIONAL USE ONLY.
Credentials are never written to disk or any external service.
"""

from flask import Flask, request, jsonify, send_from_directory, redirect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime
from functools import wraps
import os
import re

app = Flask(__name__, static_folder='..', static_url_path='')

# ─────────────────────────────────────────────────────────────────
#  RATE LIMITING
#  Demonstrates how real services protect against brute force.
# ─────────────────────────────────────────────────────────────────
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[],
    storage_uri="memory://"
)

# ─────────────────────────────────────────────────────────────────
#  IN-MEMORY STORE (no database, no disk writes)
# ─────────────────────────────────────────────────────────────────
demo_store = {
    "submissions": [],
    "start_time": datetime.now(),
    "total_hits": 0,
}

# ─────────────────────────────────────────────────────────────────
#  MIDDLEWARE: Request Logger
# ─────────────────────────────────────────────────────────────────
@app.before_request
def log_request():
    """Log every incoming request for demonstration purposes."""
    ip = get_client_ip()
    print(f"[{datetime.now().isoformat()}] {request.method} {request.path} — IP: {ip}")
    demo_store["total_hits"] += 1

# ─────────────────────────────────────────────────────────────────
#  STATIC PAGE ROUTES
# ─────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    """Serve the fake login page."""
    return send_from_directory('..', 'index.html')

@app.route('/awareness.html')
def awareness():
    return send_from_directory('..', 'awareness.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory('..', 'dashboard.html')

@app.route('/phishing-email.html')
def phishing_email():
    return send_from_directory('..', 'phishing-email.html')

# ─────────────────────────────────────────────────────────────────
#  API: HANDLE FORM SUBMISSION
# ─────────────────────────────────────────────────────────────────
@app.route('/api/submit', methods=['POST'])
@limiter.limit("10 per 15 minutes")
def submit():
    """
    CORE ENDPOINT: Simulates credential capture.
    
    In a real phishing attack, this stores credentials permanently.
    In this DEMO: store in memory only, redirect to awareness page.
    """
    data     = request.get_json(silent=True) or {}
    email    = data.get('email', '').strip()
    password = data.get('password', '')
    ip       = get_client_ip()
    ua       = request.headers.get('User-Agent', 'Unknown')

    # Parse browser and OS
    browser = parse_browser(ua)
    os_name = parse_os(ua)

    # Build submission record (DEMO ONLY)
    submission = {
        "id":        len(demo_store["submissions"]) + 1,
        "timestamp": datetime.now().isoformat(),
        "email":     email,
        "password":  password,   # Stored in memory only for demo
        "ip":        ip,
        "userAgent": ua,
        "browser":   browser,
        "os":        os_name,
        "referer":   request.headers.get('Referer', 'Direct'),
    }

    # Store in memory (only)
    demo_store["submissions"].append(submission)

    # ── Console output for educational demonstration ──
    print("\n" + "─" * 60)
    print("🎣 DEMO: Credential capture simulated!")
    print("─" * 60)
    print(f"📧 Email:     {email}")
    print(f"🔑 Password:  {'*' * len(password)} ({len(password)} chars)")
    print(f"🌐 IP:        {ip}")
    print(f"🖥️  Browser:   {browser}")
    print(f"💻 OS:        {os_name}")
    print(f"⏰ Time:      {submission['timestamp']}")
    print("─" * 60)
    print("⚠️  DEMO ONLY: No data was stored permanently.\n")

    # Redirect to awareness page
    from urllib.parse import quote
    masked_pw = email[0] + '*' * max(len(password) - 1, 0) if password else ''
    redirect_url = (
        f"/awareness.html"
        f"?email={quote(email)}"
        f"&ts={quote(submission['timestamp'])}"
        f"&password={quote(masked_pw)}"
    )

    return jsonify({
        "success":  True,
        "demo":     True,
        "message":  "This is a cybersecurity awareness demo. No data was stored.",
        "redirect": redirect_url
    })

# ─────────────────────────────────────────────────────────────────
#  API: DASHBOARD DATA
# ─────────────────────────────────────────────────────────────────
@app.route('/api/dashboard')
def dashboard_data():
    """Return aggregated demo statistics."""
    subs = demo_store["submissions"]

    unique_ips = len(set(s["ip"] for s in subs))

    # Mask passwords in response
    safe_subs = [
        {**s, "password": mask_password(s["password"])}
        for s in subs
    ]

    uptime = int((datetime.now() - demo_store["start_time"]).total_seconds())

    return jsonify({
        "totalSubmissions": len(subs),
        "uniqueIPs":        unique_ips,
        "avgResponseTime":  0,
        "totalHits":        demo_store["total_hits"],
        "serverUptime":     uptime,
        "submissions":      safe_subs,
        "disclaimer":       "DEMO ONLY — no data is permanently stored"
    })

# ─────────────────────────────────────────────────────────────────
#  API: CLEAR DATA
# ─────────────────────────────────────────────────────────────────
@app.route('/api/clear', methods=['POST'])
def clear_data():
    """Clear all in-memory demo submissions."""
    count = len(demo_store["submissions"])
    demo_store["submissions"] = []
    print(f"🗑  Cleared {count} demo submissions from memory.")
    return jsonify({"success": True, "cleared": count})

# ─────────────────────────────────────────────────────────────────
#  API: STATUS
# ─────────────────────────────────────────────────────────────────
@app.route('/api/status')
def status():
    return jsonify({
        "status":      "running",
        "demo":        True,
        "disclaimer":  "Cybersecurity awareness demo. No real data stored.",
        "submissions": len(demo_store["submissions"]),
    })

# Rate limit error handler
@app.errorhandler(429)
def rate_limit_handler(e):
    return jsonify({
        "error": "Too many submissions. This demonstrates rate limiting protection.",
        "demo":  True
    }), 429

# ─────────────────────────────────────────────────────────────────
#  UTILITY FUNCTIONS
# ─────────────────────────────────────────────────────────────────

def get_client_ip():
    """Get client IP, respecting proxy headers."""
    if request.headers.get('X-Forwarded-For'):
        return request.headers['X-Forwarded-For'].split(',')[0].strip()
    return request.remote_addr or 'Unknown'

def parse_browser(ua: str) -> str:
    """Parse browser name from User-Agent string."""
    if 'Edg/' in ua:     return 'Microsoft Edge'
    if 'OPR/' in ua:     return 'Opera'
    if 'Chrome/' in ua:  return 'Google Chrome'
    if 'Firefox/' in ua: return 'Mozilla Firefox'
    if 'Safari/' in ua and 'Chrome' not in ua: return 'Apple Safari'
    return 'Unknown Browser'

def parse_os(ua: str) -> str:
    """Parse OS name from User-Agent string."""
    if 'Windows NT 10' in ua: return 'Windows 10/11'
    if 'Windows' in ua:       return 'Windows'
    if 'Mac OS X' in ua:      return 'macOS'
    if 'Android' in ua:       return 'Android'
    if 'iPhone' in ua:        return 'iOS (iPhone)'
    if 'iPad' in ua:          return 'iOS (iPad)'
    if 'Linux' in ua:         return 'Linux'
    return 'Unknown OS'

def mask_password(pw: str) -> str:
    """Mask password for display (show first+last char only)."""
    if not pw: return '(empty)'
    if len(pw) <= 2: return '****'
    return pw[0] + '●' * min(len(pw) - 2, 8) + pw[-1]

# ─────────────────────────────────────────────────────────────────
#  START SERVER
# ─────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    print('')
    print('╔══════════════════════════════════════════════════╗')
    print('║    CYBERSECURITY AWARENESS DEMO SERVER (Flask)   ║')
    print('║    Educational Phishing Simulation               ║')
    print('╠══════════════════════════════════════════════════╣')
    print(f'║  🌐 Running at: http://localhost:{port}           ║')
    print(f'║  📊 Dashboard:  http://localhost:{port}/dashboard  ║')
    print('╠══════════════════════════════════════════════════╣')
    print('║  ⚠️  FOR EDUCATIONAL USE ONLY                     ║')
    print('║  No data is stored permanently.                  ║')
    print('╚══════════════════════════════════════════════════╝')
    print('')
    app.run(debug=True, host='0.0.0.0', port=port)
