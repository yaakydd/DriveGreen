from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import requests
import os
from dotenv import load_dotenv

load_dotenv()

chatbot_router = APIRouter()

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# ===================== MODELS =====================

class ChatRequest(BaseModel):
    message: str
    prediction_data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str

# ===================== PROMPT TUNING =====================

def build_context_prompt(
    user_message: str,
    prediction_data: Optional[Dict[str, Any]] = None
) -> str:
    system_prompt = """
You are Eco-Copilot, an expert assistant for the DriveGreen platform.

GUIDELINES:
- Focus ONLY on vehicle emissions, fuel efficiency, eco-driving, and climate impact.
- Be concise, practical, and factual.
- Prefer bullet points.
- Use metric units (g CO₂/km).
- Do NOT invent statistics.
- Do NOT mention being an AI or model.
"""

    reference_data = """
REFERENCE BENCHMARKS:
- Average gasoline car: ~180 g CO₂/km
- Efficient hybrid: ~110–120 g CO₂/km
- Diesel average: ~160–170 g CO₂/km
- EV tailpipe emissions: 0 g CO₂/km (excluding grid)
- Categories:
  • Excellent: <120
  • Good: 120–160
  • Average: 160–200
  • High: 200–250
  • Very High: >250
"""

    vehicle_context = ""
    if prediction_data:
        vehicle_context = f"""
USER VEHICLE DATA:
- CO₂ emissions: {prediction_data.get("predicted_co2_emissions")} g/km
- Category: {prediction_data.get("category")}
- Fuel type: {prediction_data.get("vehicleData", {}).get("fuel_type")}
- Engine size: {prediction_data.get("vehicleData", {}).get("engine_size")} L
- Cylinders: {prediction_data.get("vehicleData", {}).get("cylinders")}

IMPORTANT:
When the user says "my car", "my vehicle", or "my result",
use the data above.
"""

    return f"""
{system_prompt}
{reference_data}
{vehicle_context}

USER QUESTION:
{user_message}

ANSWER:
"""

# ===================== CHAT ENDPOINT =====================

@chatbot_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not HUGGINGFACE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="HUGGINGFACE_API_KEY not configured"
        )

    prompt = build_context_prompt(
        request.message,
        request.prediction_data
    )

    # 🔥 Fast, small, instruction-tuned model
    API_URL = "https://api-inference.huggingface.co/models/google/gemma-2b-it"

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 300,
            "temperature": 0.6,
            "top_p": 0.9,
            "return_full_text": False
        },
        "options": {
            "wait_for_model": True
        }
    }

    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json=payload,
            timeout=25
        )

        # -------- Status handling (MATCHES FRONTEND) --------
        if response.status_code == 429:
            raise HTTPException(429, "Rate limit exceeded.")

        if response.status_code == 503:
            raise HTTPException(503, "AI service unavailable.")

        if response.status_code == 401:
            raise HTTPException(500, "Invalid Hugging Face API key.")

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="AI inference error."
            )

        result = response.json()

        if not isinstance(result, list) or not result:
            raise HTTPException(500, "Invalid AI response format.")

        generated_text = result[0].get("generated_text", "").strip()

        if not generated_text:
            generated_text = (
                "I couldn’t generate a helpful response. "
                "Please rephrase your question."
            )

        return ChatResponse(response=generated_text)

    # -------- Network & timeout handling --------
    except requests.exceptions.Timeout:
        raise HTTPException(504, "AI request timed out.")

    except requests.exceptions.ConnectionError:
        raise HTTPException(503, "Cannot reach AI service.")

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected server error: {str(e)}"
        )
