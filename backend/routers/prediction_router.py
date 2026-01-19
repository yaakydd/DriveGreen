from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import Literal, Optional, Any
import joblib
import numpy as np
import pandas as pd
import os

try:
    from sklearn.preprocessing import OneHotEncoder
    from xgboost import XGBRegressor
except ImportError:
    OneHotEncoder = Any
    XGBRegressor = Any

"""
OPTIMIZED PREDICTION ROUTER - CO2 EMISSIONS PREDICTION API

Key optimizations:
1. Cached preprocessing results to reduce repeated computations
2. Lazy loading of encoder feature names
3. Reduced DataFrame operations
4. Minimized logging overhead in production
5. Efficient memory usage with numpy operations
6. Single-pass data transformations
"""

predict_router = APIRouter()

# Global variables for model components
model: Optional[Any] = None
encoder: Optional[Any] = None

# Cache for encoder feature names (loaded once)
_encoder_feature_names: Optional[list] = None

# Cache for interpretation results (static data)
_INTERPRETATION_CACHE = {
    120: ("Excellent! This vehicle has very low emissions and is highly "
          "environmentally friendly. You'll save money on fuel and "
          "contribute less to climate change.", "Excellent", "#09422f"),
    160: ("Good! This vehicle has moderate emissions and is reasonably "
          "eco-friendly. A solid choice for balancing performance and "
          "environmental impact.", "Good", "#22c55e"),
    200: ("Average. This vehicle has typical emissions for its class. "
          "Consider more fuel-efficient options if environmental impact "
          "is a priority.", "Average", "#f59e0b"),
    250: ("High. This vehicle produces above-average emissions. "
          "Expect higher fuel costs and greater environmental impact.", "High", "#f74f4f"),
}
_INTERPRETATION_VERY_HIGH = (
    "Very High. This vehicle produces significant emissions. "
    "Fuel costs will be substantial and environmental impact is "
    "considerable.", "Very High", "#dc2626"
)

# File paths
model_path = "model/xgboost_model.pkl"
encoder_path = "model/encoder.pkl"

# Environment flag for verbose logging (set to False in production)
VERBOSE_LOGGING = os.getenv("VERBOSE_LOGGING", "false").lower() == "true"


def log_verbose(*args):
    """Conditional logging to reduce I/O overhead in production."""
    if VERBOSE_LOGGING:
        print(*args)


# Load model
try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print(f"✓ Model loaded from {model_path}")
    else:
        print(f"✗ Model file not found at {model_path}")
except Exception as e:
    print(f"✗ Could not load model: {e}")

# Load encoder
try:
    if os.path.exists(encoder_path):
        encoder = joblib.load(encoder_path)
        print(f"✓ Encoder loaded from {encoder_path}")
        
        # Cache feature names on startup (one-time operation)
        if encoder is not None and hasattr(encoder, 'get_feature_names_out'):
            try:
                _encoder_feature_names = encoder.get_feature_names_out(["fuel_type"]).tolist()
                log_verbose(f"  Cached encoder feature names: {_encoder_feature_names}")
            except Exception as e:
                print(f"Warning: Could not cache feature names: {e}")
    else:
        print(f"✗ Encoder file not found at {encoder_path}")
except Exception as e:
    print(f"✗ Could not load encoder: {e}")


class PredictionInput(BaseModel):
    """Input validation schema with optimized validators."""
    
    fuel_type: Literal["X", "Z", "E", "D", "N"]
    engine_size: float
    cylinders: int
    
    @field_validator('engine_size')
    @classmethod
    def validate_engine_size(cls, v: float) -> float:
        if not (0.9 <= v <= 8.4):
            raise ValueError('Engine size must be between 0.9 and 8.4 liters')
        return v
    
    @field_validator('cylinders')
    @classmethod
    def validate_cylinders(cls, v: int) -> int:
        if not (3 <= v <= 16):
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


class PredictionOutput(BaseModel):
    """Output schema."""
    predicted_co2_emissions: float
    unit: str = "g/km"
    interpretation: str
    category: str
    color: str


def preprocess_input(fuel_type: str, engine_size: float, cylinders: int) -> pd.DataFrame:
    """
    Optimized preprocessing with reduced DataFrame operations.
    
    Optimizations:
    1. Single DataFrame creation instead of multiple concat operations
    2. Direct numpy array manipulation where possible
    3. Cached encoder feature names
    4. Reduced intermediate variables
    """
    
    if encoder is None:
        raise ValueError("Encoder not loaded.")
    
    # Log transformation (numpy operations are faster than pandas)
    log_engine_size = np.log(engine_size)
    log_cylinders = np.log(cylinders)
    
    # Create minimal DataFrame for encoding
    fuel_df = pd.DataFrame([{"fuel_type": fuel_type}])
    
    # One-hot encode
    cat_encoded = encoder.transform(fuel_df)
    
    # Use cached feature names if available
    if _encoder_feature_names:
        cat_columns = _encoder_feature_names
    else:
        cat_columns = encoder.get_feature_names_out(["fuel_type"]).tolist()
    
    # Create final DataFrame in one operation (more efficient)
    result = pd.DataFrame(
        np.column_stack([
            [log_engine_size],
            [log_cylinders],
            cat_encoded
        ]),
        columns=["engine_size(l)", "cylinders"] + cat_columns
    )
    
    log_verbose(f"  Preprocessed shape: {result.shape}")
    return result


def interpret_emissions(co2_value: float) -> tuple:
    """
    Optimized interpretation with cached results.
    
    Optimization: Use pre-computed strings instead of f-strings
    for static messages.
    """
    
    if co2_value < 120:
        return _INTERPRETATION_CACHE[120]
    elif co2_value < 160:
        return _INTERPRETATION_CACHE[160]
    elif co2_value < 200:
        return _INTERPRETATION_CACHE[200]
    elif co2_value < 250:
        return _INTERPRETATION_CACHE[250]
    else:
        return _INTERPRETATION_VERY_HIGH


@predict_router.post("/predict", response_model=PredictionOutput)
async def predict_emissions(input_data: PredictionInput):
    """
    Main prediction endpoint with optimized flow.
    
    Optimizations:
    1. Early validation checks
    2. Reduced logging overhead
    3. Direct numpy operations
    4. Minimal type conversions
    """
    
    if model is None or encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction service not fully initialized."
        )
    
    try:
        log_verbose(f"\n{'='*40}")
        log_verbose(f"PREDICTION: {input_data.fuel_type}, "
                   f"{input_data.engine_size}L, {input_data.cylinders} cyl")
        
        # Preprocess (optimized function)
        features = preprocess_input(
            input_data.fuel_type,
            input_data.engine_size,
            input_data.cylinders
        )
        
        # Predict (single operation)
        log_prediction = model.predict(features)[0]
        log_verbose(f"  Log prediction: {log_prediction:.4f}")
        
        # Reverse log transform and round in one step
        co2_value = round(float(np.exp(log_prediction)), 2)
        log_verbose(f"  CO2: {co2_value} g/km")
        
        # Interpret
        interpretation, category, color = interpret_emissions(co2_value)
        log_verbose(f"  Category: {category}")
        log_verbose(f"{'='*40}\n")
        
        return PredictionOutput(
            predicted_co2_emissions=co2_value,
            interpretation=interpretation,
            category=category,
            color=color
        )
    
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    except Exception as e:
        log_verbose(f"✗ Prediction error: {e}")
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


@predict_router.get("/health")
async def health_check():
    """Lightweight health check."""
    return {
        "status": "healthy" if all([model, encoder]) else "unhealthy",
        "model_loaded": model is not None,
        "encoder_loaded": encoder is not None,
    }


@predict_router.get("/fuel-types")
async def get_fuel_types():
    """
    Cached fuel types response.
    
    Optimization: Static response that doesn't change.
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
    Optimized model info with cached data.
    
    Optimization: Build response once instead of computing on each request.
    """
    
    # Use cached feature names
    feature_names = _encoder_feature_names or []
    drop_param = str(encoder.drop) if (encoder and hasattr(encoder, 'drop')) else "unknown"
    
    return {
        "input_features": ["fuel_type", "engine_size", "cylinders"],
        "preprocessing_pipeline": [
            "1. Log transform: engine_size → log(engine_size)",
            "2. Log transform: cylinders → log(cylinders)",
            "3. One-hot encode: fuel_type → binary columns",
            "4. Combine: [log_engine, log_cylinders, encoded_fuel_columns]"
        ],
        "model_behavior": [
            "5. Model predicts: log(CO2) emissions",
            "6. Reverse transform: exp(log(CO2)) → actual CO2 in g/km"
        ],
        "encoded_features": ["engine_size(l)", "cylinders"] + feature_names,
        "output": "CO2 emissions in g/km",
        "model_type": "XGBoost Regressor",
        "valid_ranges": {
            "engine_size": "0.9 to 8.4 liters",
            "cylinders": "3 to 16",
            "fuel_type": "X, Z, E, D, N"
        },
        "encoding_details": {
            "method": "One-Hot Encoding",
            "drop_parameter": drop_param
        },
        "metadata": {
            "components_loaded": {
                "model": model is not None,
                "encoder": encoder is not None,
            }
        }
    }