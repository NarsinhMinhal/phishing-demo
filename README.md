# 🎣 Phishing Awareness Demo

> **⚠️ DISCLAIMER**: This project is strictly for **cybersecurity education and awareness purposes ONLY**.  
> No real data is stored, transmitted, or used for any malicious purpose.  
> Use only in controlled, authorized environments with explicit consent.

---

## 📖 What This Is

A complete, realistic phishing simulation designed to teach users:
- What phishing attacks look like
- How convincing fake login pages can be
- What data attackers collect (even passively)
- How to recognize and prevent phishing attacks

This project demonstrates the techniques used in real phishing attacks in a **safe, controlled, educational environment**.

---

## 🗂️ Project Structure

```
phishing-demo/
├── backend/
│   ├── server.js           ← Node.js/Express backend (local development)
│   └── app.py              ← Python/Flask alternative backend (local development)
│
├── index.html              ← Fake bank login page (phishing simulation)
├── awareness.html          ← Education page shown after submission
├── dashboard.html          ← Demo analytics dashboard (Live + Local storage)
├── phishing-email.html     ← Annotated phishing email example
│
├── package.json            ← Node.js dependencies & scripts
├── requirements.txt        ← Python dependencies
└── README.md               ← This file
```

---

## 🚀 Setup Instructions

### Option A: Node.js Backend (Recommended)

**Prerequisites:** Node.js 16+ installed ([nodejs.org](https://nodejs.org))

```bash
# 1. Navigate to project directory
cd phishing-demo

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# OR for development with auto-reload:
npm run dev
```

**Open:** `http://localhost:3000`

---

### Option B: Python Flask Backend

**Prerequisites:** Python 3.8+ installed

```bash
# 1. Navigate to project directory
cd phishing-demo

# 2. Install dependencies
pip install flask flask-limiter

# 3. Start the server
python backend/app.py
```

**Open:** `http://localhost:3000`

---

### Option C: GitHub Pages (Standalone Mode)

This project is fully compatible with GitHub Pages. No backend server is required!

1. Create a repository on GitHub.
2. Push this project to the `main` branch.
3. Enable **GitHub Pages** in the repository settings (Settings > Pages).
4. **Data Persistence**: When running on GitHub Pages, the site uses the browser's `localStorage` to save demo entries. They will survive page refreshes but are unique to your browser.

---

## 🌐 Pages & URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000/` | Fake bank login page |
| `http://localhost:3000/awareness.html` | Awareness & education page |
| `http://localhost:3000/dashboard` | Demo analytics dashboard |
| `http://localhost:3000/phishing-email.html` | Annotated phishing email |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/submit` | POST | Handle credential submission (demo) |
| `/api/dashboard` | GET | Get aggregated demo stats |
| `/api/clear` | POST | Clear in-memory data |
| `/api/status` | GET | Server health check |

---

## ✨ Features

### Login Page (Phishing Simulation)
- ✅ Realistic bank-style UI with professional design
- ✅ Dark/light mode toggle
- ✅ Form validation (email format, password length)
- ✅ Password show/hide toggle
- ✅ Fake "processing" loading animation (3 stages)
- ✅ Fake SSL/security badge
- ✅ Fake bank navigation bar
- ✅ Warning banner revealed after submission

### Awareness Page
- ✅ Shows captured credentials (email, masked password)
- ✅ Displays IP address via `api.ipify.org`
- ✅ Device/browser/OS fingerprinting
- ✅ Explains what phishing is
- ✅ Annotated list of how the fake page deceived you
- ✅ 8-tip prevention guide
- ✅ Full metadata table (screen size, timezone, language, etc.)
- ✅ Links to email demo and dashboard

### Dashboard
- ✅ Real-time submission count
- ✅ Unique IP count
- ✅ Browser/OS breakdown with bar charts
- ✅ Submissions table (passwords masked)
- ✅ Auto-refresh every 10 seconds
- ✅ Clear data button
- ✅ Dark/light mode

### Phishing Email Demo
- ✅ Realistic simulated email client UI
- ✅ 6 annotated red flags with explanations
- ✅ Shows common phishing email tricks

### Backend & Hybrid Persistence
- ✅ **Hybrid Storage**: Try backend first, fallback to `localStorage` automatically
- ✅ **Standalone Mode**: Works perfectly on GitHub Pages/CDN without a server
- ✅ **Data Merging**: Dashboard combines backend data with local storage data
- ✅ In-memory only storage (no DB, no disk)
- ✅ Rate limiting (10 requests/15 min per IP)
- ✅ User-Agent parsing (browser + OS detection)
- ✅ IP detection from headers
- ✅ Console logging for educational demonstration
- ✅ Password masking in all API responses

---

## 🛡️ Security & Ethics

- **No permanent storage**: All data lives in RAM and vanishes on server restart
- **No external transmission**: Credentials never leave your local machine
- **Rate limiting**: Demonstrates basic protection against brute force
- **Clear disclaimers**: Warnings on every page
- **Masked passwords**: Even in the demo dashboard, passwords are partially masked
- **No real attack functionality**: Cannot be used to actually phish anyone at scale

---

## 🎓 How to Use This for Training

1. **Run a team exercise**: Set up the server, share the login page URL with your team (explain it's a test beforehand — or after, for maximum impact)
2. **Show the awareness page**: Walk through each section explaining the techniques
3. **Open the dashboard**: Show how quickly and easily an attacker could see submissions
4. **Review the phishing email**: Go through each red flag annotation
5. **Discuss prevention**: Cover the 8 prevention tips on the awareness page

---

## ⚠️ Legal & Ethical Notice

This tool is intended for:
- Security awareness training within organizations
- Academic cybersecurity coursework
- Personal learning and CTF preparation
- Developer education about social engineering

**DO NOT** use this to:
- Phish real users without their explicit written consent
- Deploy on any public server
- Capture real credentials from unsuspecting users
- Use in any way that violates applicable laws

The author assumes no responsibility for misuse. Using this against unauthorized targets is illegal in most jurisdictions.

---

## 🔧 Customization

### Change the fake bank name
Search for "SecureBank" in `index.html` and replace with your desired institution name.

### Add more metadata collection
Edit the `collectMetadata()` function in `awareness.html`.

### Adjust rate limiting
In `server.js`, change `windowMs` and `max` in the `submitLimiter` config.

### Change port
```bash
PORT=8080 npm start        # Node.js
PORT=8080 python app.py    # Python
```

---

## 📚 Learning Resources

- [OWASP Phishing](https://owasp.org/www-community/attacks/Phishing)
- [Have I Been Pwned](https://haveibeenpwned.com/)
- [Google's Phishing Quiz](https://phishingquiz.withgoogle.com/)
- [SANS Security Awareness](https://www.sans.org/security-awareness-training/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

*Built for educational purposes — stay safe online! 🔐*
