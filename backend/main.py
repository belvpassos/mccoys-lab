import random
import threading
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

readings = [72]
temperature = [36.5, 36.6, 36.4, 36.7, 36.6, 36.5, 36.6, 36.7, 36.6, 36.6]
pressure = [121, 119, 120, 122, 120, 118, 121, 120, 119, 120]
oxygenation = [98, 97, 98, 99, 98, 97, 98, 98, 99, 98]
sugar = [96, 98, 94, 100, 97, 95, 99, 96, 98, 97]
mood = [4, 4, 3, 4, 5, 4, 3, 4, 4, 4]

def is_alert():
    return len(readings) > 0 and readings[-1] > 100

def sensor_loop():
    while True:
        time.sleep(15)
        readings.append(random.randint(68, 78))
        temperature.append(round(random.uniform(36.4, 36.7), 1))
        pressure.append(random.randint(118, 122))
        oxygenation.append(random.randint(97, 99))
        sugar.append(random.randint(90, 110))
        if len(readings) > 60:
            readings.pop(0)
        if len(temperature) > 60:
            temperature.pop(0)
        if len(pressure) > 60:
            pressure.pop(0)
        if len(oxygenation) > 60:
            oxygenation.pop(0)
        if len(sugar) > 60:
            sugar.pop(0)

threading.Thread(target=sensor_loop, daemon=True).start()

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.get("/readings")
def get_readings():
    return {"readings": readings, "latest": readings[-1], "alert": is_alert(), "simulated": True, "unit": "bpm", "temperature": temperature, "pressure": pressure, "oxygenation": oxygenation, "sugar": sugar, "mood": mood}

@app.post("/measure")
def measure():
    readings.append(105)
    return {"reading": 105, "readings": readings, "alert": True}

@app.post("/mood")
def log_mood(payload: dict):
    value = max(1, min(5, int(payload.get("value", 3))))
    mood.append(value)
    if len(mood) > 60:
        mood.pop(0)
    return {"mood": mood}
