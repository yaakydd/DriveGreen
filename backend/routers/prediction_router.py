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
FINAL FIXED PREDICTION ROUTER - CO2 EMISSIONS PREDICTION API
With explicit fuel type ordering: X, Z, E, D, N
"""

predict_router = APIRouter()

# ============================================
# CRITICAL: Fuel type order MUST match training
# ============================================
FUEL_TYPE_ORDER = ['X', 'Z', 'E', 'D', 'N']

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

# Environment flag for verbose logging
VERBOSE_LOGGING = os.getenv("VERBOSE_LOGGING", "false").lower() == "true"


def log_verbose(*args):
    """Conditional logging to reduce I/O overhead in production."""
    if VERBOSE_LOGGING:
        print(*args)


# ============================================
# MODEL LOADING
# ============================================
try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print(f"✓ Model loaded from {model_path}")
    else:
        print(f"✗ Model file not found at {model_path}")
except Exception as e:
    print(f"✗ Could not load model: {e}")

try:
    if os.path.exists(encoder_path):
        encoder = joblib.load(encoder_path)
        print(f"✓ Encoder loaded from {encoder_path}")
        
        # Cache feature names on startup
        if encoder is not None and hasattr(encoder, 'get_feature_names_out'):
            try:
                encoder_feature_names = encoder.get_feature_names_out(["fuel_type"]).tolist()
                print(f"  Encoder features: {encoder_feature_names}")
                
                # CRITICAL VERIFICATION: Check if order matches
                expected_order = [f"fuel_type_{ft}" for ft in FUEL_TYPE_ORDER]
                if encoder_feature_names == expected_order:
                    print(f"  ✓ Fuel type order verified: {FUEL_TYPE_ORDER}")
                else:
                    print(f"  ⚠ WARNING: Fuel type order mismatch!")
                    print(f"    Expected: {expected_order}")
                    print(f"    Got: {encoder_feature_names}")
            except Exception as e:
                print(f"⚠ Warning: Could not cache feature names: {e}")
    else:
        print(f"✗ Encoder file not found at {encoder_path}")
except Exception as e:
    print(f"✗ Could not load encoder: {e}")

try:
    if os.path.exists(feature_names_path):
        feature_names = joblib.load(feature_names_path)
        print(f"✓ Feature names loaded from {feature_names_path}")
        print(f"  Expected column order: {feature_names}")
    else:
        print(f"✗ Feature names file not found at {feature_names_path}")
except Exception as e:
    print(f"✗ Could not load feature names: {e}")


# ============================================
# PYDANTIC MODELS
# ============================================
class PredictionInput(BaseModel):
    """Input validation schema."""
    
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


# ============================================
# PREPROCESSING FUNCTION - FINAL FIX
# ============================================
def preprocess_input(fuel_type: str, engine_size: float, cylinders: int) -> pd.DataFrame:
    """
    CRITICAL: Exact match to training process!
    
    Training order:
    1. Log1p transform: engine_size, cylinders
    2. One-hot encode: fuel_type (with explicit order: X, Z, E, D, N)
    3. Concat: [numerical, categorical]
    4. Reindex to match training column order
    
    Returns DataFrame with proper feature names for XGBoost
    """
    if encoder is None:
        raise ValueError("Encoder not loaded.")
    
    if feature_names is None:
        raise ValueError("Feature names not loaded.")

    log_verbose(f"\n{'='*60}")
    log_verbose(f"PREPROCESSING INPUT")
    log_verbose(f"{'='*60}")
    log_verbose(f"Input: fuel_type={fuel_type}, engine_size={engine_size}, cylinders={cylinders}")

    # Step 1: Log1p transform numerical features
    log_engine_size = np.log1p(engine_size)
    log_cylinders = np.log1p(cylinders)
    
    log_verbose(f"\nStep 1: Log transform")
    log_verbose(f"  engine_size: {engine_size} → {log_engine_size:.4f}")
    log_verbose(f"  cylinders: {cylinders} → {log_cylinders:.4f}")

    # Step 2: One-hot encode fuel type
    fuel_df = pd.DataFrame({"fuel_type": [fuel_type]})
    encoded = encoder.transform(fuel_df)
    
    # Get encoded column names
    encoded_columns = encoder.get_feature_names_out(["fuel_type"])
    
    # Create categorical DataFrame
    cat_df = pd.DataFrame(
        encoded,
        columns=encoded_columns
    )
    
    log_verbose(f"\nStep 2: One-hot encoding")
    log_verbose(f"  fuel_type: {fuel_type}")
    log_verbose(f"  Encoded columns: {encoded_columns.tolist()}")
    log_verbose(f"  Encoded values: {encoded[0]}")

    # Step 3: Create numerical DataFrame
    num_df = pd.DataFrame({
        "engine_size(l)": [log_engine_size],
        "cylinders": [log_cylinders]
    })
    
    log_verbose(f"\nStep 3: Create numerical DataFrame")
    log_verbose(f"  Columns: {num_df.columns.tolist()}")
    log_verbose(f"  Values: {num_df.values[0]}")

    # Step 4: Combine in training order [numerical, categorical]
    X = pd.concat([num_df, cat_df], axis=1)
    
    log_verbose(f"\nStep 4: Concatenate")
    log_verbose(f"  Combined columns: {X.columns.tolist()}")

    # Step 5: CRITICAL - Reindex to match exact training order
    X = X.reindex(columns=feature_names, fill_value=0)
    
    log_verbose(f"\nStep 5: Reindex to training order")
    log_verbose(f"  Expected: {feature_names}")
    log_verbose(f"  Final columns: {X.columns.tolist()}")
    log_verbose(f"  Final values: {X.values[0]}")
    
    # Step 6: Ensure column names are strings (XGBoost requirement)
    X.columns = X.columns.astype(str)
    
    log_verbose(f"\nStep 6: Final validation")
    log_verbose(f"  DataFrame shape: {X.shape}")
    log_verbose(f"  Column types: {X.dtypes.tolist()}")
    log_verbose(f"{'='*60}\n")

    return X


# ============================================
# INTERPRETATION FUNCTION
# ============================================
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


# ============================================
# API ENDPOINTS
# ============================================
@predict_router.post("/predict", response_model=PredictionOutput)
async def predict_emissions(input_data: PredictionInput):
    """
    Main prediction endpoint.
    
    Accepts: fuel_type, engine_size, cylinders
    Returns: CO2 emissions prediction with interpretation
    """
    
    # Check if all components are loaded
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
        log_verbose(f"\n{'='*60}")
        log_verbose(f"NEW PREDICTION REQUEST")
        log_verbose(f"{'='*60}")
        log_verbose(f"Input: {input_data.model_dump()}")
        
        # Preprocess input
        features = preprocess_input(
            input_data.fuel_type,
            input_data.engine_size,
            input_data.cylinders
        )
        
        # Verify DataFrame before prediction
        log_verbose(f"Pre-prediction check:")
        log_verbose(f"  Type: {type(features)}")
        log_verbose(f"  Shape: {features.shape}")
        log_verbose(f"  Columns: {features.columns.tolist()}")
        
        # Make prediction (XGBoost expects DataFrame with feature names)
        log_prediction = model.predict(features)[0]
        log_verbose(f"\nPrediction:")
        log_verbose(f"  Log(CO2): {log_prediction:.4f}")
        
        # Reverse log1p transform
        co2_value = round(float(np.expm1(log_prediction)), 2)
        log_verbose(f"  CO2 emissions: {co2_value} g/km")
        
        # Interpret result
        interpretation, category, color = interpret_emissions(co2_value)
        log_verbose(f"  Category: {category}")
        log_verbose(f"{'='*60}\n")
        
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
        log_verbose(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal prediction error: {str(e)}"
        )


@predict_router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy" if all([model, encoder, feature_names]) else "unhealthy",
        "model_loaded": model is not None,
        "encoder_loaded": encoder is not None,
        "feature_names_loaded": feature_names is not None,
        "fuel_type_order": FUEL_TYPE_ORDER
    }


@predict_router.get("/fuel-types")
async def get_fuel_types():
    """Get available fuel types in correct order."""
    return {
        "fuel_types": FUEL_TYPE_ORDER,
        "descriptions": {
            "X": "Regular Gasoline",
            "Z": "Premium Gasoline", 
            "E": "Ethanol (E85)",
            "D": "Diesel",
            "N": "Natural Gas"
        },
        "order": "This order matches training and must be maintained"
    }


@predict_router.get("/model-info")
async def get_model_info():
    """Get detailed model information."""
    
    # Use cached feature names
    enc_features = encoder_feature_names or []
    
    return {
        "model_type": "XGBoost Regressor",
        "version": "1.0.0",
        "input_features": ["fuel_type", "engine_size", "cylinders"],
        "fuel_type_order": FUEL_TYPE_ORDER,
        "preprocessing_steps": [
            "1. Log1p transform: engine_size → log(1 + engine_size)",
            "2. Log1p transform: cylinders → log(1 + cylinders)",
            "3. One-hot encode: fuel_type → binary columns (order: X, Z, E, D, N)",
            "4. Concatenate: [numerical_features, categorical_features]",
            "5. Reindex to match training column order"
        ],
        "prediction_steps": [
            "6. Model predicts: log(1 + CO2) emissions",
            "7. Reverse transform: CO2 = exp(prediction) - 1"
        ],
        "expected_feature_order": feature_names if feature_names else "Not loaded",
        "encoded_features": ["engine_size(l)", "cylinders"] + enc_features,
        "output": "CO2 emissions in g/km",
        "valid_ranges": {
            "engine_size": "0.9 to 8.4 liters",
            "cylinders": "3 to 16",
            "fuel_type": FUEL_TYPE_ORDER
        },
        "status": {
            "model_loaded": model is not None,
            "encoder_loaded": encoder is not None,
            "feature_names_loaded": feature_names is not None,
            "fuel_order_verified": encoder_feature_names == [f"fuel_type_{ft}" for ft in FUEL_TYPE_ORDER] if encoder_feature_names else False
        }
    }


@predict_router.get("/test-prediction")
async def test_prediction():
    """
    Test endpoint to verify the prediction pipeline.
    Uses: fuel_type='X', engine_size=2.0, cylinders=4
    """
    try:
        test_input = PredictionInput(
            fuel_type="X",
            engine_size=2.0,
            cylinders=4
        )
        
        result = await predict_emissions(test_input)
        
        return {
            "status": "success",
            "test_input": test_input.model_dump(),
            "prediction": result.model_dump(),
            "message": "Test prediction successful"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Test prediction failed"
        }