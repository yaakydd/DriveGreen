# backend/app.py

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from model.load_model import load_model_components
from utils.preprocess import prepare_input
import numpy as np

app = FastAPI(title="CO₂ Emission Predictor API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # use your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model components
model, encoder, scaler = load_model_components()

# Request body schema
class VehicleInput(BaseModel):
    fuel_type: str
    cylinders: float
    engine_size_l: float

@app.get("/")
def home():
    return {"message": "Welcome to CO₂ Emission Predictor API!"}

@app.post("/predict")
def predict_emission(data: VehicleInput):
    try:
        input_dict = data.dict()
        X_ready = prepare_input(input_dict, encoder, scaler)
        prediction_log = model.predict(X_ready)[0]
        prediction = np.exp(prediction_log)  # reverse log-transform

        return {
            "predicted_CO2_emission": round(float(prediction), 2)
        }

    except Exception as e:
        return {"error": str(e)}
