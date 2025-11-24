from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import Literal
import joblib
import numpy as np
import pandas as pd
import os

"""
===== PREDICT ROUTER - CO2 EMISSIONS PREDICTION API =====

This file handles all prediction-related API endpoints.

Main Purpose:
=============
Takes vehicle specifications (fuel type, engine size, cylinders) from frontend
and returns predicted CO2 emissions with interpretation.

Flow:
=====
1. User submits data from frontend form
2. Pydantic validates input (type checking, range validation)
3. preprocess_input() transforms raw data:
   - Log transforms numerical features
   - One-hot encodes categorical feature
   - Scales all features
4. Model predicts log(CO2)
5. Reverse log transform to get actual CO2
6. interpret_emissions() assigns category and color
7. Return JSON response to frontend

Real-world Example:
==================
Input:  {fuel_type: "X", engine_size: 2.0, cylinders: 4}
Output: {predicted_co2_emissions: 139.86, category: "Good", ...}
"""

# ===== CREATE ROUTER INSTANCE =====
predict_router = APIRouter()

# ===== GLOBAL VARIABLES =====
# These are loaded once when server starts
model = None      # XGBoost trained model
encoder = None    # OneHotEncoder for fuel_type
scaler = None     # StandardScaler for all features

# ===== FILE PATHS =====
model_path = "model/xgboost_model.pkl"
encoder_path = "model/encoder.pkl"
scaler_path = "model/scaler.pkl"

# ===== LOAD MODEL =====
try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print(f"✅ Model loaded successfully from {model_path}")
    else:
        print(f"❌ Model file not found at {model_path}")
except Exception as e:
    print(f"❌ Could not load model: {e}")

# ===== LOAD ENCODER =====
try:
    if os.path.exists(encoder_path):
        encoder = joblib.load(encoder_path)
        print(f"✅ Encoder loaded successfully from {encoder_path}")
        # Print encoder info for debugging
        if encoder is not None:
            print(f"   Encoder categories: {encoder.categories_}")
            print(f"   Drop parameter: {encoder.drop}")
    else:
        print(f"❌ Encoder file not found at {encoder_path}")
except Exception as e:
    print(f"❌ Could not load encoder: {e}")

# ===== LOAD SCALER =====
try:
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        print(f"✅ Scaler loaded successfully from {scaler_path}")
    else:
        print(f"❌ Scaler file not found at {scaler_path}")
except Exception as e:
    print(f"❌ Could not load scaler: {e}")

# ===== INPUT VALIDATION SCHEMA =====
class PredictionInput(BaseModel):
    """
    Defines structure and validation for API requests
    
    This ensures frontend sends valid data before processing
    
    Validation Rules:
    ================
    - fuel_type: Must be one of ["X", "Z", "E", "D", "N"]
    - engine_size: Must be between 0.9 and 8.4 (based on dataset min/max)
    - cylinders: Must be between 3 and 16 (based on dataset min/max)
    
    Why these ranges?
    ================
    During training, the model learned from data with these ranges:
    - engine_size: min=0.9, max=8.4
    - cylinders: min=3, max=16
    
    If we allow values outside this range (extrapolation), predictions
    will be unreliable because the model has never seen such data.
    
    Example:
    ========
    Valid:   {fuel_type: "X", engine_size: 2.0, cylinders: 4}
    Invalid: {fuel_type: "Q", engine_size: 15.0, cylinders: 2}
    """
    fuel_type: Literal["X", "Z", "E", "D", "N"]
    engine_size: float
    cylinders: int
    
    @validator('engine_size')
    def validate_engine_size(cls, v):
        """
        Validate engine_size is within training data range
        
        Dataset Range: 0.9 to 8.4 liters
        
        Why this matters:
        ================
        - Too small (< 0.9): Model never trained on such small engines
        - Too large (> 8.4): Model never trained on such large engines
        - Result: Unreliable predictions (extrapolation error)
        
        Real-world context:
        ==================
        - 0.9L: Small city cars (Fiat 500, Smart ForTwo)
        - 2.0L: Standard sedans (Honda Civic, Toyota Corolla)
        - 4.0L: Large SUVs/trucks
        - 8.4L: Heavy-duty trucks, supercars
        """
        # ✅ FIXED: Correct validation range matching dataset
        if v < 0.9 or v > 8.4:
            raise ValueError('Engine size must be between 0.9 and 8.4 liters')
        return v
    
    @validator('cylinders')
    def validate_cylinders(cls, v):
        """
        Validate cylinders is within training data range
        
        Dataset Range: 3 to 16 cylinders
        
        Real-world context:
        ==================
        - 3 cylinders: Small cars (Ford Fiesta, Mitsubishi Mirage)
        - 4 cylinders: Most common (sedans, small SUVs)
        - 6 cylinders: Mid-size cars, SUVs
        - 8 cylinders: Trucks, performance cars
        - 12 cylinders: Luxury cars (Ferrari, Lamborghini)
        - 16 cylinders: Exotic supercars (Bugatti)
        """
        # ✅ FIXED: Correct validation range and error message
        if v < 3 or v > 16:
            raise ValueError('Cylinders must be between 3 and 16')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "fuel_type": "X",
                "engine_size": 2.0,
                "cylinders": 4
            }
        }

# ===== OUTPUT SCHEMA =====
class PredictionOutput(BaseModel):
    """
    Defines structure of API response
    
    This ensures frontend always receives consistent format
    """
    predicted_co2_emissions: float  # e.g., 139.86
    unit: str = "g/km"               # Always "g/km"
    interpretation: str              # Human-readable explanation
    category: str                    # "Excellent", "Good", "Average", "High", "Very High"
    color: str                       # Hex color code for UI (e.g., "#10b981")

# ===== PREPROCESSING FUNCTION =====
def preprocess_input(fuel_type: str, engine_size: float, cylinders: int):
    """
    🔑 CRITICAL FUNCTION: Transforms raw input into model-ready features
    
    ⚠️ THIS MUST EXACTLY MATCH THE TRAINING PIPELINE ⚠️
    
    Training Pipeline:
    ==================
    1. Log transform: engine_size → log(engine_size)
    2. Log transform: cylinders → log(cylinders)
    3. One-hot encode: fuel_type → binary columns
    4. Combine: [log_engine, log_cylinders, fuel_columns...]
    5. Scale: StandardScaler (mean=0, std=1)
    6. Train model on scaled features
    7. Target is log(CO2)
    
    Prediction Pipeline (HERE):
    ===========================
    1. ✅ Log transform inputs
    2. ✅ One-hot encode fuel_type
    3. ✅ Combine features
    4. ✅ Scale
    5. ✅ Model predicts log(CO2)
    6. ✅ Reverse: exp(log(CO2)) → actual CO2
    
    Real-world Example:
    ==================
    Input: fuel_type="X", engine_size=2.0, cylinders=4
    
    Step 1 - Log Transform:
    ----------------------
    WHY? CO2 emissions have exponential relationship with engine specs.
    Log makes this relationship linear, easier for model to learn.
    
    ❌ WRONG: np.log(2.0) = 0.6931
       Problem: log(0) = -infinity (undefined)
    
    ✅ CORRECT: np.log1p(2.0) = log(2.0 + 1) = log(3.0) = 1.0986
       Benefit: log1p(0) = log(1) = 0 (no error)
    
    log_engine = log(2.0) = 0.6931
    log_cylinders = log(4) = 1.3863
    
    Step 2 - Create DataFrame:
    -------------------------
    df = {
        "engine_size(l)": 0.6931,
        "cylinders": 1.3863,
        "fuel_type": "X"
    }
    
    Step 3 - One-Hot Encode:
    ------------------------
    If drop='first' (old way):
        fuel_type="X" → [0, 0, 0, 0]  (reference category)
        fuel_type="Z" → [1, 0, 0, 0]
        fuel_type="E" → [0, 1, 0, 0]
        fuel_type="D" → [0, 0, 1, 0]
        fuel_type="N" → [0, 0, 0, 1]
        Columns: [fuel_type_Z, fuel_type_E, fuel_type_D, fuel_type_N]
    
    If drop=None (NEW way):
        fuel_type="X" → [1, 0, 0, 0, 0]
        fuel_type="Z" → [0, 1, 0, 0, 0]
        fuel_type="E" → [0, 0, 1, 0, 0]
        fuel_type="D" → [0, 0, 0, 1, 0]
        fuel_type="N" → [0, 0, 0, 0, 1]
        Columns: [fuel_type_X, fuel_type_Z, fuel_type_E, fuel_type_D, fuel_type_N]
    
    Step 4 - Combine:
    ----------------
    combined = [0.6931, 1.3863, 1, 0, 0, 0, 0]  (if drop=None)
               ↑       ↑        ↑  ↑  ↑  ↑  ↑
               log_eng log_cyl  X  Z  E  D  N
    
    Step 5 - Scale:
    --------------
    For each column: (value - mean) / std
    scaled = [-0.25, -0.38, 0.85, -0.17, -0.17, -0.17, -0.17]
    
    This is what the model expects!
    """
    
    # ===== STEP 1: LOG TRANSFORM =====
    # ✅ CRITICAL FIX: Use np.log() since dataset values are > 0
    # Your dataset: engine_size ∈ [0.9, 8.4], cylinders ∈ [3, 16]
    # All values > 0, so np.log() is safe
    
    try:
        log_engine_size = np.log(engine_size)
        log_cylinders = np.log(cylinders)
    except ValueError as e:
        # This should never happen due to validation, but just in case
        raise ValueError(f"Log transform error: {e}. Engine size and cylinders must be positive.")
    
    print(f"\n  📊 Preprocessing:")
    print(f"     Original: engine={engine_size}L, cylinders={cylinders}")
    print(f"     Log transformed: log(engine)={log_engine_size:.4f}, log(cylinders)={log_cylinders:.4f}")
    
    # ===== STEP 2: CREATE DATAFRAME =====
    # Column names MUST match training data exactly
    df = pd.DataFrame([{
        "engine_size(l)": log_engine_size,  # Log-transformed
        "cylinders": log_cylinders,          # Log-transformed
        "fuel_type": fuel_type               # Original categorical
    }])
    
    # ===== STEP 3: ONE-HOT ENCODE =====
    # Transform fuel_type into binary columns
    # Since you removed drop='first', all 5 fuel types get their own column
    cat_encoded = encoder.transform(df[["fuel_type"]])
    
    # Convert to DataFrame with proper column names
    cat_encoded_df = pd.DataFrame(
        cat_encoded,
        columns=encoder.get_feature_names_out(["fuel_type"])
    )
    
    print(f"     Fuel type '{fuel_type}' encoded as:")
    print(f"     Columns: {list(cat_encoded_df.columns)}")
    print(f"     Values: {cat_encoded_df.values[0]}")
    
    # ===== STEP 4: COMBINE FEATURES =====
    # Concatenate numerical (log-transformed) + categorical (encoded)
    num_df = df[["engine_size(l)", "cylinders"]]
    combined = pd.concat([num_df, cat_encoded_df], axis=1)
    
    print(f"     Combined features: {list(combined.columns)}")
    print(f"     Shape: {combined.shape}")
    
    # ===== STEP 5: SCALE =====
    # Apply StandardScaler trained during model training
    scaled_input = scaler.transform(combined)
    
    print(f"     Scaled features: {scaled_input[0]}\n")
    
    return scaled_input

# ===== INTERPRETATION FUNCTION =====
def interpret_emissions(co2_value: float) -> tuple:
    """
    Convert numerical CO2 value into human-readable category
    
    Categories based on EU emission standards:
    ==========================================
    - Excellent: < 120 g/km (Hybrid, electric, very efficient)
    - Good: 120-160 g/km (Modern efficient cars)
    - Average: 160-200 g/km (Standard cars)
    - High: 200-250 g/km (SUVs, older cars)
    - Very High: > 250 g/km (Large SUVs, sports cars, trucks)
    
    Returns:
    ========
    tuple: (interpretation_text, category_label, hex_color)
    
    Example:
    ========
    co2_value = 145
    → ("Good! This vehicle...", "Good", "#22c55e")
    """
    if co2_value < 120:
        return (
            "🌟 Excellent! This vehicle has very low emissions and is highly environmentally friendly. "
            "You'll save money on fuel and contribute less to climate change.",
            "Excellent",
            "#10b981"  # Green
        )
    elif co2_value < 160:
        return (
            "✅ Good! This vehicle has moderate emissions and is reasonably eco-friendly. "
            "A solid choice for balancing performance and environmental impact.",
            "Good",
            "#22c55e"  # Light green
        )
    elif co2_value < 200:
        return (
            "⚠️ Average. This vehicle has typical emissions for its class. "
            "Consider more fuel-efficient options if environmental impact is a priority.",
            "Average",
            "#f59e0b"  # Orange
        )
    elif co2_value < 250:
        return (
            "🔴 High. This vehicle produces above-average emissions. "
            "Expect higher fuel costs and greater environmental impact.",
            "High",
            "#ef4444"  # Red
        )
    else:
        return (
            "🚨 Very High. This vehicle produces significant emissions. "
            "Fuel costs will be substantial and environmental impact is considerable.",
            "Very High",
            "#dc2626"  # Dark red
        )

# ===== MAIN PREDICTION ENDPOINT =====
@predict_router.post("/predict", response_model=PredictionOutput)
async def predict_emissions(input_data: PredictionInput):
    """
    🎯 MAIN API ENDPOINT
    
    Complete Flow:
    ==============
    1. Receive POST request from frontend
    2. Pydantic validates input
    3. Preprocess (log + encode + scale)
    4. Model predicts log(CO2)
    5. Reverse log transform
    6. Interpret result
    7. Return JSON response
    
    Real Example:
    =============
    Request:
    POST /api/predict
    {
      "fuel_type": "X",
      "engine_size": 2.0,
      "cylinders": 4
    }
    
    Response:
    {
      "predicted_co2_emissions": 139.86,
      "unit": "g/km",
      "interpretation": "Good! This vehicle...",
      "category": "Good",
      "color": "#22c55e"
    }
    """
    
    # Check if all components loaded successfully
    if model is None or encoder is None or scaler is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction service not fully initialized. Missing model, encoder, or scaler."
        )
    
    try:
        print(f"\n{'='*60}")
        print(f"🚗 NEW PREDICTION REQUEST")
        print(f"{'='*60}")
        print(f"📥 Input:")
        print(f"   Fuel type: {input_data.fuel_type}")
        print(f"   Engine size: {input_data.engine_size} L")
        print(f"   Cylinders: {input_data.cylinders}")
        
        # ===== STEP 1: PREPROCESS =====
        scaled_features = preprocess_input(
            input_data.fuel_type,
            input_data.engine_size,
            input_data.cylinders
        )
        
        # ===== STEP 2: PREDICT (RETURNS LOG CO2) =====
        # Model was trained on log(CO2), so it predicts log(CO2)
        log_prediction = model.predict(scaled_features)[0]
        
        print(f"  🤖 Model prediction (log scale): {log_prediction:.4f}")
        
        # ===== STEP 3: REVERSE LOG TRANSFORM =====
        # Convert log(CO2) back to actual CO2
        # exp() is the inverse of log()
        actual_co2 = np.exp(log_prediction)
        co2_value = round(float(actual_co2), 2)
        
        print(f"  🔄 Reversed to actual CO2: {co2_value} g/km")
        
        # ===== STEP 4: INTERPRET =====
        interpretation, category, color = interpret_emissions(co2_value)
        
        print(f"\n  📊 Final Result:")
        print(f"     CO2 Emissions: {co2_value} g/km")
        print(f"     Category: {category}")
        print(f"     Color: {color}")
        print(f"{'='*60}\n")
        
        # ===== STEP 5: RETURN RESPONSE =====
        return PredictionOutput(
            predicted_co2_emissions=co2_value,
            interpretation=interpretation,
            category=category,
            color=color
        )
    
    except ValueError as e:
        # Handle validation errors
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        # Handle unexpected errors
        print(f"❌ Prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail=f"Prediction error: {str(e)}"
        )

# ===== UTILITY ENDPOINTS =====

@predict_router.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Returns status of all components
    """
    return {
        "status": "healthy" if all([model, encoder, scaler]) else "unhealthy",
        "model_loaded": model is not None,
        "encoder_loaded": encoder is not None,
        "scaler_loaded": scaler is not None
    }

@predict_router.get("/fuel-types")
async def get_fuel_types():
    """
    Get available fuel types and descriptions
    
    Useful for frontend dropdown menus
    """
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
    """
    Get model pipeline information
    
    Useful for documentation and debugging
    """
    feature_names = encoder.get_feature_names_out(["fuel_type"]).tolist() if encoder else []
    return {
        "input_features": ["fuel_type", "engine_size", "cylinders"],
        "preprocessing_pipeline": [
            "1. Log transform: engine_size → log(engine_size)",
            "2. Log transform: cylinders → log(cylinders)",
            "3. One-hot encode: fuel_type",
            "4. Combine: [log_engine, log_cylinders, encoded_fuel]",
            "5. Scale: StandardScaler (mean=0, std=1)"
        ],
        "model_behavior": [
            "6. Model predicts: log(CO2)",
            "7. Reverse transform: exp(log(CO2)) → actual CO2"
        ],
        "encoded_features": ["engine_size(l) (log)", "cylinders (log)"] + feature_names,
        "output": "CO2 emissions in g/km",
        "model_type": "XGBoost Regressor",
        "valid_ranges": {
            "engine_size": "0.9 to 8.4 liters",
            "cylinders": "3 to 16"
        },
        "drop_parameter": str(encoder.drop) if encoder else "unknown"
    }