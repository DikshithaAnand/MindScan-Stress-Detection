# 🧠 MindScan — AI-Powered Early Stress Detection Platform

> Detect stress before it controls you. MindScan combines manual lifestyle inputs with automatic browser behaviour tracking to predict mental stress with a Random Forest ML model.

![Version](https://img.shields.io/badge/version-2.0.0-teal) ![Python](https://img.shields.io/badge/python-3.10%2B-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green) ![License](https://img.shields.io/badge/license-MIT-yellow)

---

## 📸 Features

| Feature | Description |
|---|---|
| 🤖 ML Prediction | Random Forest trained on 7 lifestyle signals |
| 📊 Live Dashboard | Stress gauge, trend chart, focus score, distribution donut |
| 🔌 Chrome Extension | Auto-tracks tab switches & active screen time |
| 💡 Smart Insights | Human-friendly, contextual recommendations |
| 🔐 JWT Auth | Secure login/signup with hashed passwords |
| 📅 History | Rolling 30-prediction history with timestamps |
| 🛡️ Privacy First | No browsing content collected; env-var secrets |

---

## 🗂️ Project Structure

```
Early-Stress/
├── backend/
│   └── main.py              # FastAPI app — all routes
├── frontend/
│   └── index.html           # Single-file SPA (Landing + Auth + Dashboard)
├── ml_model/
│   ├── train_model.py       # Training script
│   └── stress_model.pkl     # Generated model (run train_model.py)
├── extension/
│   ├── manifest.json        # Chrome Manifest v3
│   ├── background.js        # Service worker — tracking + sync
│   ├── popup.html           # Extension popup UI
│   ├── popup.js             # Popup logic
│   ├── content.js           # Visibility change listener
│   └── styles.css           # Popup styles
├── docs/
│   └── api.md               # API reference
├── .env.example             # Environment variable template
├── requirements.txt         # Python dependencies
└── README.md
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- Python 3.10+
- pip
- A modern browser (Chrome for extension)

### 1. Clone & Install

```bash
git clone https://github.com/DikshithaAnand/Early-Stress.git
cd Early-Stress
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env — at minimum, change SECRET_KEY to something random
```

Generate a secure key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Train the ML Model

```bash
cd ml_model
python train_model.py
# Output: stress_model.pkl (saved in ml_model/)
cd ..
```

Expected output:
```
✅ Test Accuracy : 94.xx%
✅ CV Accuracy   : 93.xx% ± 1.xx%
💾 Model saved → stress_model.pkl
```

### 4. Run the Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

API is live at: http://localhost:8000  
Docs available at: http://localhost:8000/docs

### 5. Open the Frontend

```bash
# Simply open in your browser:
open frontend/index.html
# or on Linux:
xdg-open frontend/index.html
# or on Windows:
start frontend/index.html
```

> **Note:** The frontend talks to `http://localhost:8000` by default. Change the `API` constant at the top of the `<script>` section in `index.html` if your backend runs elsewhere.

### 6. Install the Chrome Extension (Optional)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Click the MindScan extension icon in your toolbar
6. Accept the privacy notice
7. Log into the web app, copy your token from browser DevTools (`localStorage.ms_token`), and paste it into the extension popup

---

## 🔌 API Reference

### Auth

```
POST /signup
Body: { "name": "Alex", "email": "alex@email.com", "password": "secret" }

POST /login
Body: { "email": "alex@email.com", "password": "secret" }
Returns: { "access_token": "...", "name": "Alex", "email": "..." }
```

### Prediction

```
POST /predict   [Bearer token required]
Body: {
  "sleep_hours": 7,
  "study_hours": 6,
  "social_media_hours": 2,
  "screen_time": 4,
  "mood_level": 3,       // 1=Very Stressed … 5=Very Happy
  "tab_switches": 12,    // from extension (optional)
  "active_minutes": 120  // from extension (optional)
}
```

### Dashboard & Behavior

```
GET  /dashboard-stats    [Bearer token required]
GET  /history            [Bearer token required]
POST /behavior-data      [Bearer token required]
GET  /behavior-summary   [Bearer token required]
GET  /me                 [Bearer token required]
```

Full interactive docs: http://localhost:8000/docs

---

## 🤖 ML Model Details

| Property | Value |
|---|---|
| Algorithm | Random Forest Classifier (scikit-learn) |
| Pipeline | StandardScaler → RandomForestClassifier |
| Training samples | 4,000 synthetic |
| Features | sleep_hours, study_hours, social_media_hours, screen_time, mood_level, tab_switches, active_minutes |
| Classes | 0=Low, 1=Moderate, 2=High |
| Typical accuracy | ~94% test, ~93% CV |
| Saved format | `.pkl` via `pickle` |

### Stress Signal Logic

| Signal | Interpretation |
|---|---|
| Sleep < 6h | Amplifies all stress signals |
| Study > 12h | Cognitive overload risk |
| Tab switches > 30 | Distraction / attention fragmentation |
| Active minutes > 300 | Fatigue / burnout risk |
| Social media > 4h + low mood | Emotional stress pattern |

---

## 🔐 Security Notes

- Passwords are SHA-256 hashed (upgrade to bcrypt for production)
- JWT is a custom HMAC-SHA256 implementation — use `python-jose` for production
- `SECRET_KEY` must be set via environment variable (never hardcode)
- CORS is `allow_origins=["*"]` — restrict to your domain in production
- JSON file storage is dev-only — migrate to PostgreSQL/MongoDB for production

---

## 🚀 Production Deployment

### Option A — Railway / Render (Easiest)

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app) or [Render](https://render.com)
3. Set environment variables in the dashboard:
   - `SECRET_KEY` — your secure random string
   - `PORT` — 8000
4. Set start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Deploy

### Option B — VPS (Ubuntu)

```bash
# Install dependencies
sudo apt update && sudo apt install python3-pip nginx -y
pip install -r requirements.txt

# Run with gunicorn
pip install gunicorn
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Configure nginx as reverse proxy
sudo nano /etc/nginx/sites-available/mindscan
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /var/www/mindscan/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mindscan /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option C — Docker

```bash
# Build
docker build -t mindscan-api ./backend

# Run
docker run -d \
  -p 8000:8000 \
  -e SECRET_KEY=your_secret_here \
  -v $(pwd)/data:/app/data \
  mindscan-api
```

### Frontend Deployment (Vercel / Netlify)

1. Update the `API` constant in `frontend/index.html` to your production backend URL
2. Deploy the `frontend/` folder to Vercel, Netlify, or any static host

---

## 🔮 Future Roadmap

### Near-term (v2.1)
- [ ] **bcrypt passwords** — replace SHA-256
- [ ] **python-jose JWT** — proper token library
- [ ] **PostgreSQL storage** — replace JSON files
- [ ] **Email verification** on signup
- [ ] **Forgot password** flow

### Mid-term (v3.0)
- [ ] **Real training data** — export prediction logs → retrain pipeline
- [ ] **Wearable integration** — Apple HealthKit / Google Fit sleep/HR data
- [ ] **Daily check-in reminder** — push notifications
- [ ] **Mood journal** — free-text entry with NLP sentiment analysis
- [ ] **Team/cohort view** — anonymised aggregate stress for study groups

### Long-term (v4.0)
- [ ] **Mobile app** (React Native)
- [ ] **Therapist portal** — optional professional oversight view
- [ ] **Federated ML** — train on device, share only model gradients
- [ ] **Multi-language support**

---

## 🧑‍💻 Development Notes

### Running Tests
```bash
pip install pytest httpx
pytest tests/
```

### Linting
```bash
pip install ruff
ruff check backend/
```

### Regenerating the model
```bash
cd ml_model && python train_model.py
# New stress_model.pkl replaces the old one
# Restart the backend to hot-reload
```

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

## ⚠️ Disclaimer

MindScan is a wellness tool built for educational and personal insight purposes. It is **not a medical device** and does not provide clinical diagnosis. If you are experiencing significant mental health challenges, please consult a qualified healthcare professional.

---

*Built with ❤️ by Dikshitha Anand — upgraded to production-grade by MindScan v2*
