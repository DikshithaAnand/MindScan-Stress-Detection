# 🧠 MindScan — AI-Powered Early Stress Detection Platform

> MindScan is an intelligent stress analysis platform that combines Machine Learning, behavioral tracking, and lifestyle monitoring to identify early stress patterns before they become serious.

![Version](https://img.shields.io/badge/version-2.0.0-teal)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

# 🌟 Project Overview

MindScan is a full-stack AI-powered wellness platform designed to analyze user behavior, productivity patterns, and digital activity to predict stress levels using Machine Learning.

The system combines:
- Manual lifestyle inputs
- Browser activity tracking
- Behavioral analytics
- Real-time ML prediction
- Interactive dashboard visualization

The platform focuses on early stress awareness using lightweight AI and privacy-friendly monitoring techniques.

---

# ✨ Core Features

## 🤖 AI-Based Stress Prediction
- Machine Learning powered stress analysis
- Predicts Low, Moderate, and High stress levels
- Uses behavioral and productivity indicators
- Real-time prediction system

---

## 📊 Interactive Analytics Dashboard
- Live stress monitoring
- Focus score visualization
- Trend analysis charts
- Prediction history tracking
- Behavioral analytics overview

---

## 🔌 Smart Browser Monitoring
- Chrome extension integration
- Tracks:
  - Tab switching frequency
  - Active screen time
  - Productivity behavior
- No browsing content collection

---

## 🔐 Secure Authentication System
- JWT-based authentication
- Secure signup and login flow
- Password hashing implementation
- Token-based session management

---

## 💡 Personalized Wellness Insights
- Intelligent stress recommendations
- Productivity improvement suggestions
- Context-aware behavioral insights
- User-friendly wellness feedback

---

## 🛡️ Privacy-Focused Architecture
- Minimal user data collection
- Local environment variable protection
- Secure backend communication
- Privacy-first behavioral analysis

---

# 🗂️ Project Structure

```text
Early-Stress/
│
├── backend/
│   └── main.py
│
├── frontend/
│   └── index.html
│
├── ml_model/
│   ├── train_model.py
│   └── stress_model.pkl
│
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   └── styles.css
│
├── docs/
├── requirements.txt
├── .env.example
└── README.md
```

---

# ⚙️ Tech Stack

## Frontend
- HTML
- CSS
- JavaScript

## Backend
- FastAPI
- Python

## Machine Learning
- scikit-learn
- Random Forest Classifier
- StandardScaler

## Browser Extension
- Chrome Extension API
- Manifest V3

---

# ⚡ Local Installation Guide

## ✅ Prerequisites

- Python 3.10+
- pip
- Google Chrome
- Internet connection (initial setup only)

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/DikshithaAnand/Early-Stress.git

cd Early-Stress
```

---

## 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3️⃣ Configure Environment Variables

```bash
cp .env.example .env
```

Generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Paste the generated key into the `.env` file.

---

## 4️⃣ Train the ML Model

```bash
cd ml_model

python train_model.py

cd ..
```

Expected Output:

```text
✅ Test Accuracy : 94.xx%
✅ CV Accuracy   : 93.xx%
💾 Model saved successfully
```

---

## 5️⃣ Run the Backend Server

```bash
cd backend

uvicorn main:app --reload --port 8000
```

Backend URL:

```text
http://localhost:8000
```

API Documentation:

```text
http://localhost:8000/docs
```

---

## 6️⃣ Launch the Frontend

```bash
start frontend/index.html
```

For Linux:

```bash
xdg-open frontend/index.html
```

For macOS:

```bash
open frontend/index.html
```

---

# 🔌 Chrome Extension Setup

1. Open Chrome Browser
2. Navigate to:

```text
chrome://extensions
```

3. Enable Developer Mode
4. Click **Load Unpacked**
5. Select the `extension/` folder
6. Pin the extension to the toolbar
7. Login to the application
8. Paste the authentication token into the extension popup

---

# 🔌 API Endpoints

## Authentication

```http
POST /signup
POST /login
```

---

## Prediction APIs

```http
POST /predict
GET  /history
GET  /dashboard-stats
GET  /behavior-summary
POST /behavior-data
GET  /me
```

---

# 🤖 Machine Learning Model Overview

MindScan uses a Random Forest Machine Learning model to analyze behavioral and lifestyle patterns for early stress prediction.

The model is optimized for:
- Fast prediction speed
- Lightweight inference
- Behavioral analysis
- Real-time stress classification

---

## 📊 Model Architecture

| Component | Details |
|---|---|
| Algorithm | Random Forest Classifier |
| ML Framework | scikit-learn |
| Pipeline | StandardScaler → RandomForestClassifier |
| Dataset | 4,000+ synthetic records |
| Prediction Classes | Low · Moderate · High Stress |
| Storage Format | `.pkl` |
| Inference | Real-time |

---

## 🧠 Behavioral Features

- Sleep Hours
- Study Duration
- Social Media Usage
- Screen Time
- Mood Level
- Tab Switching Frequency
- Active Working Minutes

---

## 📈 Model Performance

| Metric | Performance |
|---|---|
| Test Accuracy | ~94% |
| Cross Validation Accuracy | ~93% |
| Prediction Speed | Real-time |
| Optimization Goal | Lightweight Execution |

---

## 🔍 Stress Analysis Logic

| Behavioral Signal | Interpretation |
|---|---|
| Sleep < 6 Hours | Increased fatigue risk |
| Study > 12 Hours | Cognitive overload |
| High Tab Switching | Attention fragmentation |
| Excessive Screen Activity | Burnout possibility |
| Low Mood + High Social Media | Emotional stress indicator |

---

# 🔐 Security Features

- SHA-256 password hashing
- JWT-based authentication
- Environment variable protection
- Secure token management
- Privacy-focused architecture

---

# 🚀 Deployment Options

## Cloud Deployment
- Railway
- Render
- Vercel
- Netlify

---

## Docker Deployment

```bash
docker build -t mindscan-api ./backend

docker run -d -p 8000:8000 mindscan-api
```

---

# 🔮 Future Improvements

- 📱 Mobile Application
- 🌍 Multi-language Support
- 🧠 NLP-based Mood Journaling
- ⌚ Wearable Device Integration
- ☁️ Cloud Sync
- 🔔 Smart Wellness Notifications
- 👨‍⚕️ Therapist Dashboard
- 📊 Real-world Model Retraining

---

# 🧑‍💻 Developer Notes

## Run Tests

```bash
pytest tests/
```

---

## Linting

```bash
ruff check backend/
```

---

# 📄 License

This project is licensed under the MIT License.

---

# ⚠️ Disclaimer

MindScan is developed for educational, research, and wellness assistance purposes only.

This platform does not provide medical diagnosis or professional mental health treatment.

If you are experiencing serious mental health concerns, please consult a qualified healthcare professional.

---

# 👩‍💻 Author

## Dikshitha Anand
Student Developer | AI & Machine Learning Enthusiast

### Interests
- Artificial Intelligence
- Machine Learning
- Backend Development
- Behavioral Analytics
- Local AI Systems

⭐ If you found this project useful, consider giving it a star.
