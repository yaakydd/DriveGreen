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
CORRECTED PREDICTION ROUTER - CO2 EMISSIONS PREDICTION API
Fixed to match exact training column order and ensure DataFrame compatibility with XGBoost
"""

predict_router = APIRouter()

# Global variables for model components
model: Optional[Any] = None
encoder: Optional[Any] = None
feature_names: Optional[list] = None

# Cache for encoder feature names (loaded once)
encoder_feature_names: Optional[list] = None

# Cache for interpretation results (static data)
INTERPRETATION_CACHE = {
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

INTERPRETATION_VERY_HIGH = (
    "Very High. This vehicle produces significant emissions. "
    "Fuel costs will be substantial and environmental impact is "
    "considerable.", "Very High", "#dc2626"
)

# File paths
model_path = "model/xgboost_model.pkl"
encoder_path = "model/encoder.pkl"
feature_names_path = "model/feature_names.pkl"

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
                encoder_feature_names = encoder.get_feature_names_out(["fuel_type"]).tolist()
                print(f"  Encoder features: {encoder_feature_names}")
            except Exception as e:
                print(f"⚠ Warning: Could not cache feature names: {e}")
    else:
        print(f"✗ Encoder file not found at {encoder_path}")
except Exception as e:
    print(f"✗ Could not load encoder: {e}")

# Load feature names
try:
    if os.path.exists(feature_names_path):
        feature_names = joblib.load(feature_names_path)
        print(f"✓ Feature names loaded from {feature_names_path}")
        print(f"  Expected column order: {feature_names}")
    else:
        print(f"✗ Feature names file not found at {feature_names_path}")
except Exception as e:
    print(f"✗ Could not load feature names: {e}")


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
    CRITICAL: This must exactly match the training process!
    
    Training order was:
    1. Transform numerical features with log1p
    2. One-hot encode categorical
    3. Concat: [numerical_transformed, categorical_encoded]
    
    FIXED: Returns a properly formatted DataFrame with exact column names expected by XGBoost
    """
    if encoder is None:
        raise ValueError("Encoder not loaded.")
    
    if feature_names is None:
        raise ValueError("Feature names not loaded.")

    # Step 1: Log1p transform numerical features (MATCH TRAINING)
    log_engine_size = np.log1p(engine_size)
    log_cylinders = np.log1p(cylinders)
    
    log_verbose(f"  Transformed: engine={log_engine_size:.4f}, cylinders={log_cylinders:.4f}")

    # Step 2: One-hot encode fuel type (MATCH TRAINING)
    fuel_df = pd.DataFrame({"fuel_type": [fuel_type]})
    encoded = encoder.transform(fuel_df)
    
    # Get encoded column names from encoder
    encoded_columns = encoder.get_feature_names_out(["fuel_type"])
    
    # Create categorical DataFrame with proper column names
    cat_df = pd.DataFrame(
        encoded,
        columns=encoded_columns
    )
    
    log_verbose(f"  Encoded fuel type: {cat_df.to_dict('records')[0]}")

    # Step 3: Create numerical DataFrame with exact column names from training
    num_df = pd.DataFrame({
        "engine_size(l)": [log_engine_size],
        "cylinders": [log_cylinders]
    })

    # Step 4: Combine in SAME ORDER as training
    # Training does: pd.concat([numerical, categorical], axis=1)
    X = pd.concat([num_df, cat_df], axis=1)
    
    log_verbose(f"  Combined columns (before reorder): {X.columns.tolist()}")

    # Step 5: CRITICAL - Reindex to match exact training order
    # This ensures the DataFrame has the exact columns in the exact order
    X = X.reindex(columns=feature_names, fill_value=0)
    
    log_verbose(f"  Final columns (after reorder): {X.columns.tolist()}")
    log_verbose(f"  Final values: {X.values[0]}")
    
    # Step 6: CRITICAL FIX - Ensure column names are preserved as strings
    # XGBoost needs feature names to match exactly
    X.columns = X.columns.astype(str)
    
    log_verbose(f"  DataFrame shape: {X.shape}")
    log_verbose(f"  DataFrame dtypes: {X.dtypes.to_dict()}")

    return X


def interpret_emissions(co2_value: float) -> tuple:
    """Optimized interpretation with cached results."""
    
    if co2_value < 120:
        return INTERPRETATION_CACHE[120]
    elif co2_value < 160:
        return INTERPRETATION_CACHE[160]
    elif co2_value < 200:
        return INTERPRETATION_CACHE[200]
    elif co2_value < 250:
        return INTERPRETATION_CACHE[250]
    else:
        return INTERPRETATION_VERY_HIGH


@predict_router.post("/predict", response_model=PredictionOutput)
async def predict_emissions(input_data: PredictionInput):
    """
    Main prediction endpoint with optimized flow.
    
    Optimizations:
    1. Early validation checks
    2. Reduced logging overhead
    3. Direct numpy operations
    4. Minimal type conversions
    
    FIXED: Ensures DataFrame with proper feature names is passed to XGBoost
    """
    
    if model is None or encoder is None or feature_names is None:
        missing = []
        if model is None:
            missing.append("model")
        if encoder is None:
            missing.append("encoder")
        if feature_names is None:
            missing.append("feature_names")
        
        raise HTTPException(
            status_code=503,
            detail=f"Prediction service not fully initialized. Missing: {', '.join(missing)}"
        )
    
    try:
        log_verbose(f"\n{'='*40}")
        log_verbose(f"PREDICTION REQUEST: {input_data.fuel_type}, "
                   f"{input_data.engine_size}L, {input_data.cylinders} cyl")
        
        # Preprocess - returns a properly formatted DataFrame
        features = preprocess_input(
            input_data.fuel_type,
            input_data.engine_size,
            input_data.cylinders
        )
        
        # Verify DataFrame structure before prediction
        log_verbose(f"  Features type: {type(features)}")
        log_verbose(f"  Features columns: {features.columns.tolist()}")
        
        # Predict - XGBoost will now receive a DataFrame with correct feature names
        log_prediction = model.predict(features)[0]
        log_verbose(f"  Log prediction: {log_prediction:.4f}")
        
        # Reverse log1p transform using expm1
        co2_value = round(float(np.expm1(log_prediction)), 2)
        log_verbose(f"  CO2 emissions: {co2_value} g/km")
        
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
        log_verbose(f"✗ Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    
    except Exception as e:
        log_verbose(f"✗ Prediction error: {e}")
        import traceback
        log_verbose(f"  Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


@predict_router.get("/health")
async def health_check():
    """Lightweight health check."""
    return {
        "status": "healthy" if all([model, encoder, feature_names]) else "unhealthy",
        "model_loaded": model is not None,
        "encoder_loaded": encoder is not None,
        "feature_names_loaded": feature_names is not None,
    }


@predict_router.get("/fuel-types")
async def get_fuel_types():
    """Cached fuel types response."""
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
    """Optimized model info with cached data."""
    
    # Use cached feature names
    enc_features = encoder_feature_names or []
    drop_param = str(encoder.drop) if (encoder and hasattr(encoder, 'drop')) else "unknown"
    
    return {
        "input_features": ["fuel_type", "engine_size", "cylinders"],
        "preprocessing_pipeline": [
            "1. Log1p transform: engine_size → log(1 + engine_size)",
            "2. Log1p transform: cylinders → log(1 + cylinders)",
            "3. One-hot encode: fuel_type → binary columns",
            "4. Combine: [log_engine, log_cylinders, encoded_fuel_columns]",
            "5. Reorder to match training column order",
            "6. Ensure column names are strings for XGBoost compatibility"
        ],
        "model_behavior": [
            "7. Model predicts: log(1 + CO2) emissions",
            "8. Reverse transform: CO2 = expm1(prediction)"
        ],
        "expected_feature_order": feature_names if feature_names else "Not loaded",
        "encoded_features": ["engine_size(l)", "cylinders"] + enc_features,
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
                "feature_names": feature_names is not None
            }
        }
    }