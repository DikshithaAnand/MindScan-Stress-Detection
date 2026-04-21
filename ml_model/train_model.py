"""
Early-Stress ML Model — v2
Features: sleep, study, social_media, screen_time, mood_level, tab_switches, active_minutes
Run: python train_model.py
"""

import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings
warnings.filterwarnings("ignore")

np.random.seed(42)

FEATURE_NAMES = [
    "sleep_hours", "study_hours", "social_media_hours",
    "screen_time", "mood_level", "tab_switches", "active_minutes"
]

def generate_data(n=4000):
    X, y = [], []
    for _ in range(n):
        r = np.random.random()

        if r < 0.33:   # Low stress
            row = [
                np.random.uniform(7, 9),       # sleep
                np.random.uniform(4, 7),        # study
                np.random.uniform(0.5, 2),      # social media
                np.random.uniform(2, 5),        # screen
                np.random.choice([4, 5]),       # mood
                np.random.randint(2, 12),       # tabs
                np.random.randint(60, 150),     # active mins
            ]
            label = 0

        elif r < 0.66:  # Moderate stress
            row = [
                np.random.uniform(5.5, 7.5),
                np.random.uniform(7, 11),
                np.random.uniform(2, 4.5),
                np.random.uniform(5, 9),
                np.random.choice([3, 4]),
                np.random.randint(10, 35),
                np.random.randint(150, 280),
            ]
            label = 1

        else:           # High stress
            row = [
                np.random.uniform(2, 5.5),
                np.random.uniform(11, 16),
                np.random.uniform(4, 8),
                np.random.uniform(9, 15),
                np.random.choice([1, 2]),
                np.random.randint(30, 80),
                np.random.randint(250, 420),
            ]
            label = 2

        # Noise
        noise = [0.3, 0.5, 0.2, 0.4, 0, 2, 10]
        row = [max(0, v + np.random.normal(0, s)) for v, s in zip(row, noise)]
        X.append(row)
        y.append(label)

    return np.array(X), np.array(y)


def train():
    print("🧠 Generating training data (4 000 samples)...")
    X, y = generate_data(4000)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=4,
            random_state=42,
            class_weight="balanced",
            n_jobs=-1
        ))
    ])

    print("🔧 Training Random Forest pipeline...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    cv     = cross_val_score(model, X, y, cv=5, scoring="accuracy")

    print(f"\n✅ Test Accuracy : {acc:.2%}")
    print(f"✅ CV Accuracy   : {cv.mean():.2%} ± {cv.std():.2%}")
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Low", "Moderate", "High"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Feature importances
    rf   = model.named_steps["clf"]
    imps = rf.feature_importances_
    print("\n🔍 Feature Importances:")
    for name, imp in sorted(zip(FEATURE_NAMES, imps), key=lambda x: -x[1]):
        print(f"  {name:25s} {imp:.3f}")

    with open("stress_model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("\n💾 Model saved → stress_model.pkl")
    return model


if __name__ == "__main__":
    train()
