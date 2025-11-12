from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os

router = APIRouter()

# Define input schema using Pydantic
class CO2Input(BaseModel):
    fuel_type: str
    cylinders: int
    engine_size: float

# Load model artifacts
model_path = os.path.join(os.path.dirname(__file__), "../model")
model = joblib.load(os.path.join(model_path, "xgboost_model.pkl"))
encoder = joblib.load(os.path.join(model_path, "encoder.pkl"))
scaler = joblib.load(os.path.join(model_path, "scaler.pkl"))

@router.post("/predict/")
def predict(data: CO2Input):
    # Convert input to DataFrame
    df = pd.DataFrame([{
        "engine_size(l)": data.engine_size,
        "cylinders": data.cylinders,
        "fuel_type": data.fuel_type
    }])

    # Encode fuel_type
    encoded_cat = encoder.transform(df[["fuel_type"]])
    encoded_cat_df = pd.DataFrame(
        encoded_cat,
        columns=encoder.get_feature_names_out(["fuel_type"])
    )

    # Combine all features
    df_final = pd.concat([df.drop(columns=["fuel_type"]), encoded_cat_df], axis=1)

    # Scale numerical features
    df_scaled = scaler.transform(df_final)

    # Predict CO2 emissions
    predicted = model.predict(df_scaled)
    predicted_value = float(np.exp(predicted[0]))  # reverse log transform if applied

    return {"predicted_CO2": round(predicted_value, 2)}
