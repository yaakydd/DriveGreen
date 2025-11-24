from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import Literal
import joblib
import numpy as np
import pandas as pd
import os

# Create the router instance
predict_router = APIRouter()

# Load model, encoder, and scaler
model = None
encoder = None
scaler = None

model_path = "model/xgboost_model.pkl"
encoder_path = "model/encoder.pkl"
scaler_path = "model/scaler.pkl"

try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print(f" Model loaded successfully")
    else:
        print(f" Model file not found at {model_path}")
except Exception as e:
    print(f" Could not load model: {e}")

try:
    if os.path.exists(encoder_path):
        encoder = joblib.load(encoder_path)
        print(f" Encoder loaded successfully")
    else:
        print(f" Encoder file not found at {encoder_path}")
except Exception as e:
    print(f" Could not load encoder: {e}")

try:
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        print(f" Scaler loaded successfully")
    else:
        print(f" Scaler file not found at {scaler_path}")
except Exception as e:
    print(f" Could not load scaler: {e}")

# Define input schema
class PredictionInput(BaseModel):
    fuel_type: Literal["X", "Z", "E", "D", "N"]
    engine_size: float
    cylinders: int
    
    @validator('engine_size')
    def validate_engine_size(cls, v):
        if v <= 0 or v > 8.4:
            raise ValueError('Engine size must be between 0.1 and 16.0 liters')
        return v
    
    @validator('cylinders')
    def validate_cylinders(cls, v):
        if v < 3 or v > 16:
            raise ValueError('Cylinders must be between 1 and 10')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "fuel_type": "X",
                "engine_size": 1.0,
                "cylinders": 3
            }
        }

class PredictionOutput(BaseModel):
    predicted_co2_emissions: float
    unit: str = "g/km"
    interpretation: str
    category: str
    color: str

def preprocess_input(fuel_type: str, engine_size: float, cylinders: int):
    
    
    #  Log transform numerical features 
    log_engine_size = np.log(engine_size)
    log_cylinders = np.log(cylinders)
    
    # Create DataFrame with log-transformed numerical + categorical features 
    df = pd.DataFrame([{
        "engine_size(l)": log_engine_size,
        "cylinders": log_cylinders,
        "fuel_type": fuel_type
    }])
    
    # One-hot encode categorical 
    cat_encoded = encoder.transform(df[["fuel_type"]])
    cat_encoded_df = pd.DataFrame(
        cat_encoded,
        columns=encoder.get_feature_names_out(["fuel_type"])
    )
    
    # Combine numerical (already log-transformed) + encoded categorical
    num_df = df[["engine_size(l)", "cylinders"]]
    combined = pd.concat([num_df, cat_encoded_df], axis=1)
    
    # Scale inputs
    scaled_input = scaler.transform(combined)
    
    return scaled_input

def interpret_emissions(co2_value: float) -> tuple:
    if co2_value < 120:
        return (
            " Excellent! This vehicle has very low emissions and is highly environmentally friendly. "
            "You'll save money on fuel and contribute less to climate change.",
            "Excellent",
            "#10b981"  # green
        )
    elif co2_value < 160:
        return (
            " Good! This vehicle has moderate emissions and is reasonably eco-friendly. "
            "A solid choice for balancing performance and environmental impact.",
            "Good",
            "#22c55e"  # light green
        )
    elif co2_value < 200:
        return (
            " Average. This vehicle has typical emissions for its class. "
            "Consider more fuel-efficient options if environmental impact is a priority.",
            "Average",
            "#f59e0b"  # orange
        )
    elif co2_value < 250:
        return (
            "High. This vehicle produces above-average emissions. "
            "Expect higher fuel costs and greater environmental impact.",
            "High",
            "#ef4444"  # red
        )
    else:
        return (
            " Very High. This vehicle produces significant emissions. "
            "Fuel costs will be substantial and environmental impact is considerable.",
            "Very High",
            "#dc2626"  # dark red
        )

@predict_router.post("/predict", response_model=PredictionOutput)
async def predict_emissions(input_data: PredictionInput):
    
    if model is None or encoder is None or scaler is None:
        raise HTTPException(
            status_code=503, 
            detail="Prediction service not fully initialized. Missing model, encoder, or scaler."
        )
    
    try:
        # Preprocess input (log transform + encode + scale)
        scaled_features = preprocess_input(
            input_data.fuel_type,
            input_data.engine_size,
            input_data.cylinders
        )
        
        # Make prediction (model returns log transformed values)
        log_prediction = model.predict(scaled_features)[0]
        
        # Reverse log transform to get actual CO2 emissions
        actual_co2 = np.exp(log_prediction)
        co2_value = round(float(actual_co2), 2)
        
        # Get interpretation with color
        interpretation, category, color = interpret_emissions(co2_value)
        
        # Prediction 
        print(f" Prediction Details:")
        print(f"   Input: fuel={input_data.fuel_type}, engine={input_data.engine_size}L, cyl={input_data.cylinders}")
        print(f"   Log prediction: {log_prediction:.4f}")
        print(f"   Actual CO2: {co2_value} g/km")
        print(f"   Category: {category}")
        
        return PredictionOutput(
            predicted_co2_emissions=co2_value,
            interpretation=interpretation,
            category=category,
            color=color
        )
    
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f" Prediction error: {str(e)}")
        raise HTTPException(
            status_code=400, 
            detail=f"Prediction error: {str(e)}"
        )

@predict_router.get("/health")
async def health_check():
    """Check if the prediction service is running"""
    return {
        "status": "healthy" if all([model, encoder, scaler]) else "unhealthy",
        "model_loaded": model is not None,
        "encoder_loaded": encoder is not None,
        "scaler_loaded": scaler is not None
    }

@predict_router.get("/fuel-types")
async def get_fuel_types():
    """Get available fuel types"""
    return {
        "fuel_types": ["X", "Z", "E", "D", "N"],
        "descriptions": {
            "X": "Regular gasoline",
            "Z": "Premium gasoline", 
            "E": "Ethanol (E85)",
            "D": "Diesel",
            "N": "Natural gas"
        }
    }

@predict_router.get("/model-info")
async def get_model_info():
    """Get model information"""
    feature_names = encoder.get_feature_names_out(["fuel_type"]).tolist() if encoder else []
    return {
        "input_features": ["fuel_type", "engine_size", "cylinders"],
        "preprocessing_pipeline": [
            "1. Log transform numerical features (engine_size, cylinders)",
            "2. One-hot encode fuel_type (drop='first')",
            "3. Combine transformed numerical + encoded categorical",
            "4. Scale all features with StandardScaler"
        ],
        "encoded_features": ["engine_size (log)", "cylinders (log)"] + feature_names,
        "output": "CO2 emissions in g/km (reversed from log scale)",
        "model_type": "XGBoost Regressor"
    }
