# MindScan API Reference — v2.0

Base URL (local): `http://localhost:8000`

All protected routes require:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST /signup
Create a new account.

**Request**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "mypassword"
}
```
**Response 200**
```json
{ "message": "Account created", "name": "Alex Johnson" }
```
**Errors:** `400` email already registered | `422` validation error

---

### POST /login
Sign in and receive a JWT token (valid 24h).

**Request**
```json
{ "email": "alex@example.com", "password": "mypassword" }
```
**Response 200**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "name": "Alex Johnson",
  "email": "alex@example.com"
}
```
**Errors:** `401` invalid credentials

---

### GET /me 🔒
Get current user info.

**Response 200**
```json
{ "name": "Alex Johnson", "email": "alex@example.com" }
```

---

## Predictions

### POST /predict 🔒
Run a stress prediction.

**Request**
```json
{
  "sleep_hours": 6.5,
  "study_hours": 8.0,
  "social_media_hours": 3.0,
  "screen_time": 7.0,
  "mood_level": 3,
  "tab_switches": 22,
  "active_minutes": 195
}
```

| Field | Type | Range | Notes |
|---|---|---|---|
| sleep_hours | float | 0–12 | Hours slept last night |
| study_hours | float | 0–18 | Hours studying/working |
| social_media_hours | float | 0–12 | Hours on social platforms |
| screen_time | float | 0–18 | Total screen hours |
| mood_level | int | 1–5 | 1=Very Stressed, 5=Very Happy |
| tab_switches | int | 0–200 | From Chrome extension (optional) |
| active_minutes | int | 0–600 | From Chrome extension (optional) |

**Response 200**
```json
{
  "level": "Moderate Stress",
  "color": "#fbbf24",
  "emoji": "😐",
  "gauge": 60,
  "tips": ["Improve your sleep schedule...", "..."],
  "insights": ["You switched tabs 22 times today. Try Pomodoro blocks."],
  "probabilities": {
    "low": 12.3,
    "moderate": 71.4,
    "high": 16.3
  },
  "inputs": { ...original inputs... },
  "timestamp": "2025-04-20T14:23:11.000Z"
}
```

---

## Behaviour Tracking

### POST /behavior-data 🔒
Save a behaviour data snapshot (called by Chrome Extension).

**Request**
```json
{
  "tab_switches": 16,
  "active_minutes": 142,
  "screen_start": "09:00",
  "screen_end": "11:22"
}
```
**Response 200**
```json
{ "message": "Behavior data saved", "entry": { ...saved entry... } }
```

---

### GET /behavior-summary 🔒
Get today's aggregated behaviour data.

**Response 200**
```json
{
  "today": {
    "tab_switches": 38,
    "active_minutes": 247,
    "sessions": 3
  },
  "history_count": 12
}
```

---

## Dashboard

### GET /dashboard-stats 🔒
Aggregated stats for the dashboard UI.

**Response 200**
```json
{
  "avg_stress_gauge": 54.2,
  "last_prediction": "Moderate Stress",
  "last_confidence": 71.4,
  "tab_switches_today": 38,
  "active_minutes_today": 247,
  "focus_score": 69,
  "prediction_count": 7,
  "trend": [
    { "date": "2025-04-14", "gauge": 45 },
    { "date": "2025-04-15", "gauge": 60 },
    ...
  ]
}
```

### GET /history 🔒
Last 20 predictions for the current user.

**Response 200**
```json
{
  "history": [ ...prediction objects... ],
  "total": 7
}
```

---

## Error Format

All errors follow FastAPI's standard format:
```json
{ "detail": "Human-readable error message" }
```

| Code | Meaning |
|---|---|
| 400 | Bad request / validation |
| 401 | Invalid or missing token |
| 422 | Pydantic validation error |
| 500 | Internal server error |
