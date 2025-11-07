import pandas as pd
import numpy as np

def preprocess_input(df, encoder, scaler):
    """Apply OneHotEncoding + Scaling on input"""
    
    # One-hot encode categorical
    cat_encoded = encoder.transform(df[["fuel_type"]])
    cat_encoded_df = pd.DataFrame(
        cat_encoded,
        columns=encoder.get_feature_names_out(["fuel_type"])
    )

    # Combine numerical + encoded categorical
    num_df = df[["engine_size", "cylinders"]]
    combined = pd.concat([num_df, cat_encoded_df], axis=1)

    # Scale numeric + encoded features
    scaled_input = scaler.transform(combined)

    return scaled_input
