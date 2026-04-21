FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend + model
COPY backend/ ./backend/
COPY ml_model/stress_model.pkl ./ml_model/stress_model.pkl

# Data directory for JSON storage (mount as volume in prod)
RUN mkdir -p /app/data

ENV USERS_FILE=/app/data/users.json
ENV BEHAVIOR_FILE=/app/data/behavior_logs.json
ENV HISTORY_FILE=/app/data/prediction_history.json
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"]
