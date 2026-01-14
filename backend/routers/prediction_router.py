from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import Literal, Optional, Any
import joblib
import numpy as np
import pandas as pd
import os

# Import sklearn types for proper type hints
try:
    from sklearn.preprocessing import OneHotEncoder, StandardScaler
    from xgboost import XGBRegressor
except ImportError:
    # If sklearn/xgboost not installed, use Any as fallback
    OneHotEncoder = Any  # type: ignore
    StandardScaler = Any  # type: ignore
    XGBRegressor = Any  # type: ignore

"""
PREDICTION ROUTER - CO2 EMISSIONS PREDICTION API ENDPOINTS

This file handles all prediction-related API endpoints for a CO2 emissions
prediction system.

WHAT THIS FILE DOES:

Takes vehicle specifications (fuel type, engine size, cylinders) from the
frontend and returns predicted CO2 emissions with a human-readable interpretation.

COMPLETE FLOW OF THE WEBSITE:

1. User fills out a form on the website with vehicle details
2. Frontend sends data to this API
3. Pydantic validates the input (checks types and ranges)
4. The preprocess_input() function transforms raw data:
   - Applies log transformation to numerical features
   - One-hot encodes the categorical feature (fuel type)
   - Scales all features using StandardScaler
5. The trained model predicts log(CO2)
6. We reverse the log transformation to get actual CO2 value
7. The interpret_emissions() function assigns a category and color
8. JSON response is sent back to frontend

REAL-WORLD EXAMPLE:
-------------------
Input:  {"fuel_type": "X", "engine_size": 2.0, "cylinders": 4}
Output: {"predicted_co2_emissions": 139.86, "category": "Good", ...}
"""

# SECTION 1: CREATING ROUTER INSTANCE

# This creates a router object that will handle all /predict endpoints
predict_router = APIRouter()


# SECTION 2: GLOBAL VARIABLES FOR MODEL COMPONENTS

# These variables store our machine learning components
# They start as None and get loaded when the server starts
# Using proper type hints tells Pylance what methods these objects have

model: Optional[Any] = None      # XGBoost trained model
encoder: Optional[Any] = None    # OneHotEncoder for fuel_type
scaler: Optional[Any] = None     # StandardScaler for all features


# SECTION 3: FILE PATHS

# These paths point to where our saved model files are stored
model_path = "model/xgboost_model.pkl"
encoder_path = "model/encoder.pkl"
scaler_path = "model/scaler.pkl"


# SECTION 4: LOADING THE MODEL

# This block runs ONCE when the server starts
# It loads the trained XGBoost model from disk into memory

try:
    # Check if the file exists before trying to load it
    if os.path.exists(model_path):
        # joblib.load() reads the saved model file
        model = joblib.load(model_path)
        print(f"✓ Model loaded successfully from {model_path}")
    else:
        print(f"✗ Model file not found at {model_path}")
except Exception as e:
    # If anything goes wrong, print the error but don't crash
    print(f"✗ Could not load model: {e}")

# SECTION 5: LOADING THE ENCODER
# This block loads the OneHotEncoder used during training
# The encoder converts categorical data (fuel type) into numbers
# Example: "X" → [1, 0, 0, 0, 0]

try:
    if os.path.exists(encoder_path):
        encoder = joblib.load(encoder_path)
        print(f"✓ Encoder loaded successfully from {encoder_path}")
        
        # Print debug information to help us understand the encoder
        if encoder is not None:
            # Use hasattr to safely check for attributes
            if hasattr(encoder, 'categories_'):
                print(f"  Encoder categories: {encoder.categories_}")
            if hasattr(encoder, 'drop'):
                print(f"  Drop parameter: {encoder.drop}")
    else:
        print(f"✗ Encoder file not found at {encoder_path}")
except Exception as e:
    print(f"✗ Could not load encoder: {e}")

# SECTION 6: LOADING THE SCALER
# This block loads the StandardScaler used during training
# The scaler standardizes features to have mean=0 and std=1
# This helps the model make better predictions

try:
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        print(f"✓ Scaler loaded successfully from {scaler_path}")
    else:
        print(f"✗ Scaler file not found at {scaler_path}")
except Exception as e:
    print(f"✗ Could not load scaler: {e}")

# SECTION 7: INPUT VALIDATION SCHEMA
# This block defines the input validation schema for our API
class PredictionInput(BaseModel):
    """
    This class defines what valid input looks like for our API.
    
    COMPLETE BEGINNER EXPLANATION:

    Think of this like a strict form validator. Before we do any prediction,
    we check that:
    1. All required fields are present
    2. Each field has the correct data type
    3. Values are within acceptable ranges
    
    WHY WE NEED THIS:

    - Prevents crashes from bad data
    - Ensures predictions are reliable
    - Gives users clear error messages
    
    VALIDATION RULES:

    - fuel_type: Must be exactly one of ["X", "Z", "E", "D", "N"]
    - engine_size: Must be between 0.9 and 8.4 liters
    - cylinders: Must be between 3 and 16
    
    WHY THESE SPECIFIC RANGES?

    During training, our model learned from real vehicle data that had:
    - Engine sizes from 0.9L to 8.4L
    - Cylinder counts from 3 to 16
    
    If someone sends us a request with engine_size=50, the model has never
    seen such data and will give unreliable predictions. This is called
    "extrapolation" and it's bad for machine learning.
    
    REAL-WORLD EXAMPLES:

    Valid:   {"fuel_type": "X", "engine_size": 2.0, "cylinders": 4}
    Invalid: {"fuel_type": "Q", "engine_size": 15.0, "cylinders": 2}
                     ↑                ↑                    ↑
                   Wrong letter    Too big           Too small
    """
    
    # Literal means it MUST be one of these exact values
    fuel_type: Literal["X", "Z", "E", "D", "N"]
    
    # float means decimal numbers are allowed
    engine_size: float
    
    # int means whole numbers only
    cylinders: int
    
    @validator('engine_size')
    def validate_engine_size(cls, v):
        """
        Custom validator for engine_size field.
        
        WHAT THIS DOES:

        Before accepting any engine_size value, this function checks if it's
        within the safe range of 0.9 to 8.4 liters.
        
        PARAMETERS:

        cls: The class itself (PredictionInput) - automatically provided
        v: The value being validated (the engine_size number)
        
        REAL-WORLD CONTEXT:

        - 0.9L: Tiny city cars (Fiat 500, Smart ForTwo)
        - 2.0L: Standard sedans (Honda Civic, Toyota Corolla)
        - 4.0L: Large SUVs and trucks
        - 8.4L: Heavy-duty trucks, exotic supercars
        
        If someone tries to predict for a 15L engine, we reject it because:
        1. It's extremely rare (almost doesn't exist)
        2. Our model never trained on such data
        3. Prediction would be a wild guess
        """
        if v < 0.9 or v > 8.4:
            # Raise an error that FastAPI will send to the user
            raise ValueError('Engine size must be between 0.9 and 8.4 liters')
        return v
    
    @validator('cylinders')
    def validate_cylinders(cls, v):
        """
        Custom validator for cylinders field.
        
        WHAT THIS DOES:

        Checks if the number of cylinders is within 3 to 16.
        
        REAL-WORLD CONTEXT:

        - 3 cylinders: Small economy cars (Ford Fiesta, Mitsubishi Mirage)
        - 4 cylinders: Most common (sedans, compact SUVs)
        - 6 cylinders: Mid-size cars, SUVs
        - 8 cylinders: Trucks, performance cars, muscle cars
        - 12 cylinders: Luxury supercars (Ferrari, Lamborghini)
        - 16 cylinders: Extremely rare (Bugatti Veyron/Chiron)
        """
        if v < 3 or v > 16:
            raise ValueError('Cylinders must be between 3 and 16')
        return v
    
    # This provides an example for API documentation
    class Config:
        json_schema_extra = {
            "example": {
                "fuel_type": "X",
                "engine_size": 2.0,
                "cylinders": 4
            }
        }


# SECTION 8: OUTPUT SCHEMA

class PredictionOutput(BaseModel):
    """
    Defines the structure of our API response.
    
    COMPLETE BEGINNER EXPLANATION:

    This ensures that every prediction response has the exact same format,
    making it easy for the frontend to display the results.
    
    FIELDS EXPLAINED:

    - predicted_co2_emissions: The number (e.g., 139.86)
    - unit: Always "g/km" (grams per kilometer)
    - interpretation: Human-readable explanation
    - category: Simple label like "Good" or "High"
    - color: Hex code for UI coloring (e.g., "#10b981" for green)
    """
    predicted_co2_emissions: float  # Example: 139.86
    unit: str = "g/km"               # Always "g/km"
    interpretation: str              # Long explanation text
    category: str                    # "Excellent", "Good", "Average", "High", "Very High"
    color: str                       # Hex color code like "#10b981"


# SECTION 9: PREPROCESSING FUNCTION

def preprocess_input(fuel_type: str, engine_size: float, cylinders: int):
    """
    MOST CRITICAL FUNCTION IN THIS FILE 
    
    This function transforms raw user input into the exact format our
    machine learning model expects.
    

    COMPLETE BEGINNER EXPLANATION

    
    Imagine you're teaching a student (the model) math. During training,
    you always wrote numbers in a specific way:
    - Always used base-10 logarithms
    - Always scaled values to be between -1 and 1
    - Always put features in a specific order
    
    Now, when the student takes a test, the questions MUST be formatted
    the exact same way, or the student won't understand them!
    
    That's what this function does - it formats new data exactly like
    the training data.
    
 
     THE COMPLETE PIPELINE

    
    TRAINING PIPELINE (what happened when we built the model):

    1. Load raw data from CSV
    2. Log transform: engine_size → log(engine_size)
    3. Log transform: cylinders → log(cylinders)
    4. One-hot encode: fuel_type → binary columns [0,1,0,0,0]
    5. Combine all features into one array
    6. Scale using StandardScaler (mean=0, std=1)
    7. Train XGBoost model on log(CO2) as target
    
    PREDICTION PIPELINE (what happens now):

    1. Receive: fuel_type="X", engine_size=2.0, cylinders=4
    2. Log transform engine_size and cylinders
    3. One-hot encode fuel_type
    4. Combine features
    5. Scale
    6. Model predicts log(CO2)
    7. Reverse: exp(log(CO2)) → actual CO2
    

    REAL-WORLD EXAMPLE WALKTHROUGH

    
    INPUT: fuel_type="X", engine_size=2.0, cylinders=4
    
    ┌─────────────────────────────────────────────────────────────────────┐
    │ STEP 1: LOG TRANSFORMATION                                          │
    └─────────────────────────────────────────────────────────────────────┘
    
    WHY? CO2 emissions have an exponential relationship with engine specs.
    A 4L engine doesn't produce twice the CO2 of a 2L engine - it might
    produce 2.5x or 3x more. Log transformation makes this relationship
    linear, which is easier for the model to learn.
    
    MATH:
    log(engine_size) = log(2.0) = 0.6931
    log(cylinders) = log(4) = 1.3863
    
    NOTE: We use np.log() (natural logarithm, base e) because all our
    values are positive (0.9 to 8.4 for engines, 3 to 16 for cylinders).
    
    ┌─────────────────────────────────────────────────────────────────────┐
    │ STEP 2: CREATE DATAFRAME                                            │
    └─────────────────────────────────────────────────────────────────────┘
    
    We create a pandas DataFrame because the encoder expects this format:
    
    df = {
        "engine_size(l)": 0.6931,
        "cylinders": 1.3863,
        "fuel_type": "X"
    }
    
    ┌─────────────────────────────────────────────────────────────────────┐
    │ STEP 3: ONE-HOT ENCODING                                            │
    └─────────────────────────────────────────────────────────────────────┘
    
    Machine learning models only understand numbers, not text. One-hot
    encoding converts "X" into numbers:
    
    fuel_type="X" → [1, 0, 0, 0, 0]
    fuel_type="Z" → [0, 1, 0, 0, 0]
    fuel_type="E" → [0, 0, 1, 0, 0]
    fuel_type="D" → [0, 0, 0, 1, 0]
    fuel_type="N" → [0, 0, 0, 0, 1]
    
    This creates 5 new columns: [fuel_type_X, fuel_type_Z, fuel_type_E,
                                   fuel_type_D, fuel_type_N]
    
    ┌─────────────────────────────────────────────────────────────────────┐
    │ STEP 4: COMBINE ALL FEATURES                                        │
    └─────────────────────────────────────────────────────────────────────┘
    
    Now we have:
    - 2 numerical features (log-transformed)
    - 5 categorical features (one-hot encoded)
    
    Combined array = [0.6931, 1.3863, 1, 0, 0, 0, 0]
                      ↑       ↑        ↑  ↑  ↑  ↑  ↑
                      log_eng log_cyl  X  Z  E  D  N
    
    ┌─────────────────────────────────────────────────────────────────────┐
    │ STEP 5: STANDARDIZATION (SCALING)                                   │
    └─────────────────────────────────────────────────────────────────────┘
    
    StandardScaler transforms each feature to have:
    - Mean (average) = 0
    - Standard deviation = 1
    
    Formula for each value: (value - mean) / std
    
    WHY? Features have different scales:
    - log(engine_size) ranges from -0.1 to 2.1
    - One-hot features are 0 or 1
    
    Without scaling, the model would think log(engine_size) is more
    important just because its numbers are bigger!
    
    After scaling: [-0.25, -0.38, 0.85, -0.17, -0.17, -0.17, -0.17]
    
    THIS is what the model expects!
    
    ==========================================================================
    """
    

    # STEP 1: LOG TRANSFORMATION

    # Apply natural logarithm to numerical features
    # This is safe because engine_size ∈ [0.9, 8.4] and cylinders ∈ [3, 16]
    # All values are > 0, so np.log() won't cause errors
    
    try:
        log_engine_size = np.log(engine_size)
        log_cylinders = np.log(cylinders)
    except ValueError as e:
        # This should never happen due to validation, but we handle it anyway
        raise ValueError(f"Log transform error: {e}. Engine size and cylinders must be positive.")
    
    # Print debug information to console
    print(f"\n Preprocessing:")
    print(f"   Original: engine={engine_size}L, cylinders={cylinders}")
    print(f"   Log transformed: log(engine)={log_engine_size:.4f}, log(cylinders)={log_cylinders:.4f}")
    

    # STEP 2: CREATE DATAFRAME
    # Create a pandas DataFrame with one row
    # Column names MUST match what the encoder expects
    
    df = pd.DataFrame([{
        "engine_size(l)": log_engine_size,  # Log-transformed value
        "cylinders": log_cylinders,          # Log-transformed value
        "fuel_type": fuel_type               # Original categorical value
    }])
    

    # STEP 3: ONE-HOT ENCODING

    # Check if encoder is loaded (fixes Pylance warning)
    if encoder is None:
        raise ValueError("Encoder not loaded. Cannot perform one-hot encoding.")
    
    # Transform fuel_type into binary columns
    # Example: "X" → [1, 0, 0, 0, 0]
    cat_encoded = encoder.transform(df[["fuel_type"]])
    
    # Convert sparse matrix to DataFrame with proper column names
    # get_feature_names_out() returns: ['fuel_type_X', 'fuel_type_Z', ...]
    cat_encoded_df = pd.DataFrame(
        cat_encoded,
        columns=encoder.get_feature_names_out(["fuel_type"])
    )
    
    # Print debug information
    print(f"       Fuel type '{fuel_type}' encoded as:")
    print(f"       Columns: {list(cat_encoded_df.columns)}")
    print(f"       Values: {cat_encoded_df.values[0]}")
    

    # STEP 4: COMBINE FEATURES

    # Concatenate numerical features + categorical features horizontally
    # axis=1 means "add columns side by side"
    
    num_df = df[["engine_size(l)", "cylinders"]]
    combined = pd.concat([num_df, cat_encoded_df], axis=1)
    
    print(f"   🔗 Combined features: {list(combined.columns)}")
    print(f"       Shape: {combined.shape} (1 row, {combined.shape[1]} columns)")
    

    # STEP 5: STANDARDIZATION

    # Check if scaler is loaded (fixes Pylance warning)
    if scaler is None:
        raise ValueError("Scaler not loaded. Cannot perform feature scaling.")
    
    # Apply the same StandardScaler used during training
    # This transforms each feature to have mean=0, std=1
    scaled_input = scaler.transform(combined)
    
    print(f"   ⚖️  Scaled features: {scaled_input[0]}\n")
    
    # Return the final preprocessed array ready for model prediction
    return scaled_input


# SECTION 10: INTERPRETATION FUNCTION

def interpret_emissions(co2_value: float) -> tuple:
    """
    Converts a numerical CO2 value into human-readable categories.
    
    COMPLETE BEGINNER EXPLANATION:
    ------------------------------
    The model gives us a number like 145.7, but users want to know:
    "Is this good or bad?"
    
    This function assigns categories based on EU emission standards.
    
    CATEGORIES EXPLAINED:

    - Excellent (< 120 g/km):
      * Hybrid cars, electric vehicles with small gas engines
      * Examples: Toyota Prius, Honda Insight
      * Very fuel efficient, low environmental impact
    
    - Good (120-160 g/km):
      * Modern efficient cars
      * Examples: Honda Civic, Toyota Corolla, VW Golf
      * Reasonable fuel economy, moderate environmental impact
    
    - Average (160-200 g/km):
      * Standard sedans and small SUVs
      * Examples: Ford Fusion, Nissan Altima
      * Typical fuel consumption
    
    - High (200-250 g/km):
      * SUVs, older vehicles, some trucks
      * Examples: Ford Explorer, Jeep Grand Cherokee
      * Higher fuel costs, significant environmental impact
    
    - Very High (> 250 g/km):
      * Large SUVs, sports cars, pickup trucks
      * Examples: Ford F-150, Dodge Ram, Porsche 911
      * Very high fuel costs, major environmental impact
    
    RETURNS:

    tuple of (interpretation_text, category_label, hex_color)
    
    EXAMPLE:

    Input:  co2_value = 145
    Output: (
        "Good! This vehicle has moderate emissions...",
        "Good",
        "#22c55e"
    )
    """
    
    if co2_value < 120:
        return (
            "Excellent! This vehicle has very low emissions and is highly "
            "environmentally friendly. You'll save money on fuel and "
            "contribute less to climate change.",
            "Excellent",
            "#09422f"  # Emerald green
        )
    elif co2_value < 160:
        return (
            "Good! This vehicle has moderate emissions and is reasonably "
            "eco-friendly. A solid choice for balancing performance and "
            "environmental impact.",
            "Good",
            "#22c55e"  # Light green
        )
    elif co2_value < 200:
        return (
            "Average. This vehicle has typical emissions for its class. "
            "Consider more fuel-efficient options if environmental impact "
            "is a priority.",
            "Average",
            "#f59e0b"  # Amber/Orange
        )
    elif co2_value < 250:
        return (
            "High. This vehicle produces above-average emissions. "
            "Expect higher fuel costs and greater environmental impact.",
            "High",
            "#f74f4f"  # Red
        )
    else:
        return (
            "Very High. This vehicle produces significant emissions. "
            "Fuel costs will be substantial and environmental impact is "
            "considerable.",
            "Very High",
            "#dc2626"  # Dark red
        )


# SECTION 11: MAIN PREDICTION ENDPOINT

@predict_router.post("/predict", response_model=PredictionOutput)
async def predict_emissions(input_data: PredictionInput):
    """
    MAIN API ENDPOINT - This is where predictions happen!
    

    COMPLETE BEGINNER EXPLANATION
    
    This is the main function that handles prediction requests. When a user
    clicks "Predict" on the website, their data comes here.
    
    COMPLETE FLOW:
   
    1. Frontend sends: {"fuel_type": "X", "engine_size": 2.0, "cylinders": 4}
    2. FastAPI receives the request
    3. Pydantic validates input (checks types and ranges)
    4. We check if model/encoder/scaler are loaded
    5. preprocess_input() transforms the data
    6. Model predicts log(CO2)
    7. We reverse log: exp(log(CO2)) → actual CO2
    8. interpret_emissions() assigns category and color
    9. Return JSON response to frontend
    

    REAL EXAMPLE

    
    REQUEST:

    POST http://localhost:8000/api/predict
    Content-Type: application/json
    
    {
      "fuel_type": "X",
      "engine_size": 2.0,
      "cylinders": 4
    }
    
    RESPONSE:

    {
      "predicted_co2_emissions": 139.86,
      "unit": "g/km",
      "interpretation": "Good! This vehicle has moderate emissions...",
      "category": "Good",
      "color": "#22c55e"
    }
    

    """
    

    # STEP 1: CHECK IF ALL COMPONENTS LOADED
    # If any component failed to load, we can't make predictions
    # Return HTTP 503 (Service Unavailable) error
    
    if model is None or encoder is None or scaler is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction service not fully initialized. Missing model, encoder, or scaler."
        )
    
    try:
        # Print a nice header in the console for debugging
        print(f"\n{'='*60}")
        print(f" NEW PREDICTION REQUEST")
        print(f"{'='*60}")
        print(f"      Input:")
        print(f"      Fuel type: {input_data.fuel_type}")
        print(f"      Engine size: {input_data.engine_size} L")
        print(f"      Cylinders: {input_data.cylinders}")
        
        # STEP 2: PREPROCESS INPUT
        # Transform raw input into model-ready features
        # This does: log transform → one-hot encode → scale
        
        scaled_features = preprocess_input(
            input_data.fuel_type,
            input_data.engine_size,
            input_data.cylinders
        )
        

        # STEP 3: MAKE PREDICTION
        # The model was trained to predict log(CO2), not actual CO2
        # So the output here is in log scale
        
        log_prediction = model.predict(scaled_features)[0]
        # [0] gets the first (and only) prediction from the array
        
        print(f"     Model prediction (log scale): {log_prediction:.4f}")
        

        # STEP 4: REVERSE LOG TRANSFORMATION

        # Convert log(CO2) back to actual CO2 emissions
        # exp() is the inverse function of log()
        # If y = log(x), then x = exp(y)
        
        actual_co2 = np.exp(log_prediction)
        
        # Round to 2 decimal places and convert to Python float
        co2_value = round(float(actual_co2), 2)
        
        print(f"    Reversed to actual CO2: {co2_value} g/km")
        

        # STEP 5: INTERPRET RESULTS
        # Convert numerical CO2 into category, description, and color
        
        interpretation, category, color = interpret_emissions(co2_value)
        
        # Print final results to console
        print(f"\n   Final Result:")
        print(f"      CO2 Emissions: {co2_value} g/km")
        print(f"      Category: {category}")
        print(f"      Color: {color}")
        print(f"{'='*60}\n")
        

        # STEP 6: RETURN JSON RESPONSE
        # Create and return PredictionOutput object
        # FastAPI automatically converts this to JSON
        
        return PredictionOutput(
            predicted_co2_emissions=co2_value,
            interpretation=interpretation,
            category=category,
            color=color
        )
    
    except ValueError as e:
        # Handle validation errors (from preprocessing)
        # Return HTTP 422 (Unprocessable Entity)
        raise HTTPException(status_code=422, detail=str(e))
    
    except Exception as e:
        # Handle any unexpected errors
        # Print full error traceback to console for debugging
        print(f" Prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return HTTP 400 (Bad Request) to user
        raise HTTPException(
            status_code=400,
            detail=f"Prediction error: {str(e)}"
        )


# SECTION 12: UTILITY ENDPOINTS


@predict_router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    
    WHAT THIS DOES:

    Returns the status of all model components. Useful for:
    - Checking if the API is ready to handle requests
    - Monitoring in production
    - Debugging startup issues
    
    RESPONSE EXAMPLE:

    {
      "status": "healthy",
      "model_loaded": true,
      "encoder_loaded": true,
      "scaler_loaded": true
    }
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
    Get available fuel types with descriptions.
    
    WHAT THIS DOES:

    Returns all valid fuel types and their meanings.
    The frontend can use this to populate dropdown menus.
    
    RESPONSE EXAMPLE:

    {
      "fuel_types": ["X", "Z", "E", "D", "N"],
      "descriptions": {
        "X": "Regular gasoline",
        "Z": "Premium gasoline",
        ...
      }
    }
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
    Get detailed model pipeline information.
    
    WHAT THIS DOES:

    Returns documentation about how the model works.
    Useful for:
    - API documentation
    - Debugging
    - Understanding the system
    
    COMPLETE BEGINNER EXPLANATION:

    This endpoint provides a "user manual" for the prediction system.
    It tells developers and users:
    - What inputs the model accepts
    - How the data is transformed
    - What the model outputs
    - Valid ranges for inputs
    
    WHY IS THIS USEFUL?

    1. Documentation: Developers can understand the system without
       reading the code
    2. Debugging: If predictions seem wrong, this helps identify
       which step might be the problem
    3. Transparency: Users can see exactly how their data is processed
    4. Integration: Other teams can use this info to build
       compatible systems
    
    RESPONSE EXAMPLE:

    {
      "input_features": ["fuel_type", "engine_size", "cylinders"],
      "preprocessing_pipeline": [
        "1. Log transform: engine_size → log(engine_size)",
        "2. Log transform: cylinders → log(cylinders)",
        ...
      ],
      "model_type": "XGBoost Regressor",
      "valid_ranges": {
        "engine_size": "0.9 to 8.4 liters",
        "cylinders": "3 to 16"
      }
    }
    
    WHAT EACH FIELD MEANS:

    - input_features: The 3 pieces of info users must provide
    - preprocessing_pipeline: Step-by-step transformation process
    - model_behavior: What the model does with the data
    - encoded_features: The actual feature names after preprocessing
    - output: What you get back from the prediction
    - model_type: The machine learning algorithm used
    - valid_ranges: Safe input ranges to avoid extrapolation
    - drop_parameter: How one-hot encoding was configured
    """
    

    # SAFELY EXTRACT ENCODER INFORMATION
    # Initialize default values in case encoder is None or missing attributes
    feature_names = []
    drop_param = "unknown"
    
    # Check if encoder exists and has the get_feature_names_out method
    if encoder is not None and hasattr(encoder, 'get_feature_names_out'):
        try:
            # Get the column names created by one-hot encoding
            # Example: ['fuel_type_X', 'fuel_type_Z', 'fuel_type_E', 'fuel_type_D', 'fuel_type_N']
            feature_names = encoder.get_feature_names_out(["fuel_type"]).tolist()
        except Exception as e:
            # If anything goes wrong, use empty list
            print(f"Warning: Could not get feature names from encoder: {e}")
            feature_names = []
    
    # Check if encoder has the drop parameter (used in one-hot encoding)
    # drop='first' means the first category is dropped to avoid multicollinearity
    # drop=None means all categories are kept
    if encoder is not None and hasattr(encoder, 'drop'):
        drop_param = str(encoder.drop)
    

    # BUILD AND RETURN COMPREHENSIVE MODEL INFORMATION
    return {
        # The 3 input features users must provide
        "input_features": ["fuel_type", "engine_size", "cylinders"],
        
        # Detailed explanation of preprocessing steps
        "preprocessing_pipeline": [
            "1. Log transform: engine_size → log(engine_size)",
            "2. Log transform: cylinders → log(cylinders)",
            "3. One-hot encode: fuel_type → binary columns",
            "4. Combine: [log_engine, log_cylinders, encoded_fuel_columns]",
            "5. Scale: StandardScaler (mean=0, std=1)"
        ],
        
        # What happens after preprocessing
        "model_behavior": [
            "6. Model predicts: log(CO2) emissions",
            "7. Reverse transform: exp(log(CO2)) → actual CO2 in g/km"
        ],
        
        # The actual feature names after all transformations
        # Example: ['engine_size(l) (log)', 'cylinders (log)', 'fuel_type_X', 'fuel_type_Z', ...]
        "encoded_features": ["engine_size(l) (log)", "cylinders (log)"] + feature_names,
        
        # What the API returns
        "output": "CO2 emissions in g/km",
        
        # The machine learning algorithm used
        "model_type": "XGBoost Regressor",
        
        # Safe input ranges based on training data
        "valid_ranges": {
            "engine_size": "0.9 to 8.4 liters",
            "cylinders": "3 to 16",
            "fuel_type": "Must be one of: X, Z, E, D, N"
        },
        
        # Technical details about encoding
        "encoding_details": {
            "method": "One-Hot Encoding",
            "drop_parameter": drop_param,
            "explanation": "Converts categorical fuel_type into binary columns. "
                          "If drop='first', one category is dropped to avoid multicollinearity. "
                          "If drop=None, all categories are kept."
        },
        
        # Additional metadata
        "metadata": {
            "target_variable": "CO2 emissions (g/km)",
            "target_transformation": "Natural logarithm (log)",
            "scaling_method": "StandardScaler (z-score normalization)",
            "components_loaded": {
                "model": model is not None,
                "encoder": encoder is not None,
                "scaler": scaler is not None
            }
        },
        
        # Example workflow for users
        "example_workflow": {
            "step_1": "User inputs: fuel_type='X', engine_size=2.0, cylinders=4",
            "step_2": "Log transform: log(2.0)=0.693, log(4)=1.386",
            "step_3": "One-hot encode: 'X' → [1,0,0,0,0]",
            "step_4": "Combine: [0.693, 1.386, 1, 0, 0, 0, 0]",
            "step_5": "Scale: Apply StandardScaler",
            "step_6": "Predict: Model outputs log(CO2) ≈ 4.94",
            "step_7": "Reverse: exp(4.94) ≈ 139.86 g/km",
            "step_8": "Interpret: Category='Good', Color='#22c55e'"
        },
        
        # Helpful tips for API users
        "usage_tips": [
            "Always validate inputs before sending requests",
            "Stay within valid ranges to ensure reliable predictions",
            "Use the /fuel-types endpoint to get valid fuel type options",
            "Use the /health endpoint to check if the service is ready",
            "CO2 values < 120 g/km are excellent (hybrids, efficient cars)",
            "CO2 values > 250 g/km are very high (SUVs, trucks, sports cars)"
        ]
    }