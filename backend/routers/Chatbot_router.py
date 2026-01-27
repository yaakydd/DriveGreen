from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os

Chatbot_router = APIRouter()

# Get from environment variable or replace with your key
#HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "your_hf_token_here")

# Your emissions knowledge base (extracted from your React component)
EMISSIONS_KNOWLEDGE = """
VEHICLE EMISSIONS KNOWLEDGE BASE:

FUEL TYPES & CARBON INTENSITY:
- Gasoline (X, Z): ~95 gCO2e/MJ
- Diesel (D): ~95 gCO2e/MJ (more energy-dense, higher NOx)
- CNG (N): ~70 gCO2e/MJ
- E85 (E): ~75 gCO2e/MJ
- Electric: 0 tailpipe emissions (grid-dependent: 5-130 gCO2/km)

EMISSION CATEGORIES:
- Excellent: < 120 g/km (Top 15% - like efficient hybrids)
- Good: 120-160 g/km (Better than 60% - modern compacts)
- Average: 160-200 g/km (Typical mid-size)
- High: 200-250 g/km (Large SUVs/trucks)
- Very High: > 250 g/km (Heavy trucks, poor efficiency)

HOW TO REDUCE EMISSIONS:
1. Tire Pressure: Keep at max (saves 3%)
2. Weight Reduction: Remove 100 lbs = 1% improvement
3. Eco-Driving: Smooth acceleration (saves 20%)
4. Route Planning: Avoid traffic
5. Regular Maintenance: Oil changes, air filters
6. Technology: Fuel-saving OBD-II devices
7. Alternatives: Public transit 1 day/week
8. Long-term: Consider EV/hybrid for next vehicle

GOVERNMENT POLICIES & INCENTIVES:
- Emission Standards: Euro 6, EPA Tier 3
- Zero-Emission Mandates: California 2035, UK 2030, Norway 2025
- EV Tax Credits: $7,500 US federal
- State Rebates: $2,000-$5,000
- HOV Lane Access for clean vehicles
- Congestion Charges: London £15/day for high emitters

REWARDS FOR LOW-EMISSION VEHICLES:
- Federal tax credits up to $7,500
- State rebates $2,000-$5,000
- Free/priority parking in cities
- HOV lane access (solo driving)
- Annual fuel savings: $1,000+
- Maintenance savings: $800/year

VEHICLE COMPARISONS:
- Electric Vehicles: ~70 g/km (grid-dependent)
- Hybrids: ~115 g/km (30-40% reduction vs gas)
- Plug-in Hybrids (PHEV): Even better when charged
- Average Gas Car: ~180 g/km
- Large SUV/Truck: 250-300+ g/km

HEALTH & CLIMATE IMPACT:
- PM2.5 particles enter bloodstream
- NOx creates smog, respiratory issues
- WHO: 4.2M deaths/year from air pollution
- Transportation = 29% of US emissions
- Every kg CO2 contributes to climate change

PREDICTION MODEL DETAILS:
- Uses XGBoost machine learning algorithm
- Trained on thousands of vehicle emissions data
- Process: Log-transform inputs → One-hot encode fuel type → Predict CO2 → Reverse transform
- Accuracy: ±8-12% margin (EPA/WLTP data)
- Inputs: Fuel type, engine size (0.9-8.4L), cylinders (3-16)
- Output: CO2 emissions in g/km

FUTURE OUTLOOK:
- Gas station decline accelerating
- Zero-emission mandates spreading globally
- Battery costs decreasing 89% since 2010
- EV range improving (300+ miles standard)

BUYING GUIDE:
- Drive <40 mi/day + home charging → EV
- Long commutes → Hybrid/PHEV
- Budget conscious → 3-year-old hybrid
- Remember: Small efficient gas > large inefficient EV
"""

class ChatRequest(BaseModel):
    message: str
    prediction_data: dict = None  # Optional: current prediction context

class ChatResponse(BaseModel):
    response: str

def build_context_prompt(user_message: str, prediction_data: dict = None) -> str:
    """Build a comprehensive prompt with knowledge base and user context."""
    
    context_parts = [EMISSIONS_KNOWLEDGE]
    
    # Add prediction context if available
    if prediction_data:
        vehicle_context = f"""
CURRENT USER'S VEHICLE DATA:
- Predicted CO2 Emissions: {prediction_data.get('predicted_co2_emissions')} g/km
- Category: {prediction_data.get('category')}
- Fuel Type: {prediction_data.get('vehicleData', {}).get('fuel_type')}
- Engine Size: {prediction_data.get('vehicleData', {}).get('engine_size')}L
- Cylinders: {prediction_data.get('vehicleData', {}).get('cylinders')}
- Interpretation: {prediction_data.get('interpretation')}

When the user asks about "my result", "my prediction", "my emissions", etc., use THIS data above.
"""
        context_parts.append(vehicle_context)
    
    # Build final prompt
    full_prompt = f"""{chr(10).join(context_parts)}

INSTRUCTIONS:
- You are Eco-Copilot, an AI assistant for vehicle emissions
- Be concise, friendly, and helpful
- Use the knowledge base above to answer questions accurately
- If user asks about their specific vehicle, use the "CURRENT USER'S VEHICLE DATA" section
- Format responses with markdown (bold, lists, etc.)
- Keep responses under 200 words unless detailed explanation needed
- If you don't know something, say so honestly

User Question: {user_message}

Your Response:"""
    
    return full_prompt


@chatbot_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chatbot endpoint - uses Hugging Face Inference API
    """
    
    if not HUGGINGFACE_API_KEY or HUGGINGFACE_API_KEY == "your_hf_token_here":
        raise HTTPException(
            status_code=500,
            detail="Hugging Face API key not configured"
        )
    
    try:
        # Build prompt with context
        prompt = build_context_prompt(
            request.message,
            request.prediction_data
        )
        
        # Call Hugging Face API
        response = requests.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            headers={
                "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 400,
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "return_full_text": False
                }
            },
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Hugging Face API error: {response.text}"
            )
        
        result = response.json()
        
        # Extract generated text
        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get('generated_text', '')
        else:
            generated_text = result.get('generated_text', '')
        
        # Clean up response (remove any prompt echoing)
        cleaned_response = generated_text.strip()
        
        return ChatResponse(response=cleaned_response)
    
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Request timed out. Please try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat error: {str(e)}"
        )


@chatbot_router.get("/chat/health")
async def chat_health():
    """Health check for chatbot service"""
    return {
        "status": "healthy",
        "api_configured": bool(HUGGINGFACE_API_KEY and HUGGINGFACE_API_KEY != "your_hf_token_here"),
        "model": "Mistral-7B-Instruct-v0.2"
    }
