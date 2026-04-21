from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import json
import os
import time
import hmac
import hashlib
import base64
from datetime import datetime, date

# --------------------------------------------------
# App Config
# --------------------------------------------------
app = FastAPI(
    title="MindScan API",
    version="4.0.0",
    description="AI Stress Detection Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Files
# --------------------------------------------------
USERS_FILE = "users.json"
BEHAVIOR_FILE = "behavior_logs.json"
HISTORY_FILE = "prediction_history.json"

SECRET_KEY = "mindscan-secret-key"

security = HTTPBearer()

# --------------------------------------------------
# Helper Functions
# --------------------------------------------------
def load_json(path, default):
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return default


def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# --------------------------------------------------
# JWT Token
# --------------------------------------------------
def create_token(email):
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "HS256", "typ": "JWT"}).encode()
    ).decode().rstrip("=")

    payload = base64.urlsafe_b64encode(
        json.dumps({
            "sub": email,
            "exp": time.time() + 86400
        }).encode()
    ).decode().rstrip("=")

    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header}.{payload}".encode(),
        hashlib.sha256
    ).hexdigest()

    return f"{header}.{payload}.{signature}"


def verify_token(token):
    try:
        header, payload, sign = token.split(".")

        expected = hmac.new(
            SECRET_KEY.encode(),
            f"{header}.{payload}".encode(),
            hashlib.sha256
        ).hexdigest()

        if expected != sign:
            return None

        pad = "=" * (-len(payload) % 4)

        data = json.loads(
            base64.urlsafe_b64decode(payload + pad)
        )

        if data["exp"] < time.time():
            return None

        return data["sub"]

    except:
        return None


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security)
):
    email = verify_token(creds.credentials)

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    return email


# --------------------------------------------------
# Models
# --------------------------------------------------
class Signup(BaseModel):
    name: str
    email: str
    password: str


class Login(BaseModel):
    email: str
    password: str


class Predict(BaseModel):
    sleep_hours: float
    study_hours: float
    social_media_hours: float
    screen_time: float
    mood_level: int
    tab_switches: int = 0
    active_minutes: int = 0


class Behavior(BaseModel):
    tab_switches: int = 0
    active_minutes: int = 0
    screen_start: str | None = None
    screen_end: str | None = None


# --------------------------------------------------
# Stress Logic
# --------------------------------------------------
def manual_stress(data):
    score = 0

    if data.sleep_hours < 6:
        score += 3

    if data.study_hours > 8:
        score += 2

    if data.social_media_hours > 4:
        score += 2

    if data.screen_time > 8:
        score += 2

    score += (5 - data.mood_level)

    if score <= 4:
        return "Low Stress", 25

    elif score <= 8:
        return "Moderate Stress", 60

    return "High Stress", 90


def live_stress(tab_switches, active_minutes):

    # Focus score
    focus = round(max(0, min(100, 100 - (tab_switches * 0.8))))

    # Fatigue penalty
    if active_minutes <= 60:
        fatigue = 0
    elif active_minutes <= 180:
        fatigue = 10
    else:
        fatigue = 20

    # Stress score
    score = round(
        (tab_switches * 0.7) +
        ((100 - focus) * 0.4) +
        fatigue
    )

    score = max(0, min(100, score))

    # Level
    if score <= 33:
        level = "Low Stress"
    elif score <= 66:
        level = "Moderate Stress"
    else:
        level = "High Stress"

    return level, score, focus

# --------------------------------------------------
# Routes
# --------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "MindScan API Running"
    }


@app.post("/signup")
def signup(data: Signup):
    users = load_json(USERS_FILE, {})

    if data.email in users:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    users[data.email] = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password)
    }

    save_json(USERS_FILE, users)

    return {
        "message": "Signup successful"
    }


@app.post("/login")
def login(data: Login):
    users = load_json(USERS_FILE, {})
    user = users.get(data.email)

    if not user:
        raise HTTPException(401, "Invalid credentials")

    if user["password"] != hash_password(data.password):
        raise HTTPException(401, "Invalid credentials")

    return {
        "access_token": create_token(data.email),
        "name": user["name"],
        "email": user["email"]
    }


@app.get("/me")
def me(user=Depends(get_current_user)):
    users = load_json(USERS_FILE, {})
    return users.get(user, {})


@app.post("/predict")
def predict(data: Predict, user=Depends(get_current_user)):
    level, gauge = manual_stress(data)

    result = {
        "level": level,
        "gauge": gauge,
        "timestamp": datetime.now().isoformat()
    }

    history = load_json(HISTORY_FILE, {})
    history.setdefault(user, []).append(result)

    save_json(HISTORY_FILE, history)

    return result


@app.post("/behavior-data")
def behavior(data: Behavior, user=Depends(get_current_user)):
    logs = load_json(BEHAVIOR_FILE, {})

    entry = {
        "tab_switches": data.tab_switches,
        "active_minutes": data.active_minutes,
        "screen_start": data.screen_start,
        "screen_end": data.screen_end,
        "date": date.today().isoformat(),
        "timestamp": datetime.now().isoformat()
    }

    logs.setdefault(user, []).append(entry)
    logs[user] = logs[user][-100:]

    save_json(BEHAVIOR_FILE, logs)

    return {
        "message": "Behavior synced"
    }


@app.get("/dashboard-stats")
def dashboard_stats(user=Depends(get_current_user)):
    logs = load_json(BEHAVIOR_FILE, {}).get(user, [])
    hist = load_json(HISTORY_FILE, {}).get(user, [])

    today = date.today().isoformat()

    today_logs = [x for x in logs if x.get("date") == today]

    if today_logs:
        latest = today_logs[-1]
        tabs = latest.get("tab_switches", 0)
        mins = latest.get("active_minutes", 0)
    else:
        tabs = 0
        mins = 0

    live_level, live_score, focus = live_stress(tabs, mins)

    recent = hist[-7:]

    valid_gauges = [
        x.get("gauge", 50)
        for x in recent
        if isinstance(x.get("gauge", 50), (int, float))
    ]

    avg = round(sum(valid_gauges)/len(valid_gauges),1) if valid_gauges else 0


    return {
        "avg_stress_gauge": avg,
        "last_prediction": hist[-1]["level"] if hist else live_level,
        "tab_switches_today": tabs,
        "active_minutes_today": mins,
        "focus_score": focus,
        "prediction_count": len(hist),
        "live_stress": live_level,
        "stress_score": live_score,
        "trend": [
            {
                "date": x.get("timestamp","")[:10],
                "gauge": x.get("gauge",50)
            }
            for x in recent
        ]
    }

@app.get("/history")
def history(user=Depends(get_current_user)):
    data = load_json(HISTORY_FILE, {}).get(user, [])

    return {
        "history": data[-20:]
    }