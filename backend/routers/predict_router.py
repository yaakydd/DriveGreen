from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import pandas as pd
from utils.preprocess import preprocess_input

router = APIRouter(prefix="/predict", tags=["Prediction"])

# Load saved artifacts
model = joblib.load("model/xgboost_model.pkl")
encoder = joblib.load("model/encoder.pkl")
scaler = joblib.load("model/scaler.pkl")

# Input schema for the request
class VehicleInput(BaseModel):
    fuel_type: str
    cylinders: float
    engine_size: float

@router.post("/")
def predict_emission(data: VehicleInput):
    """Predict CO₂ emissions based on vehicle attributes"""
    try:
        # Prepare input as a DataFrame
        input_df = pd.DataFrame([data.dict()])

        # Preprocess input
        processed_input = preprocess_input(input_df, encoder, scaler)

        # Predict
        prediction = model.predict(processed_input)[0]

        # Inverse of log-transform if used during training
        emission = float(np.exp(prediction))

        return {"predicted_co2_emission": round(emission, 2)}

    except Exception as e:
        return {"error": str(e)}
