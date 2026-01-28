from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import requests
import os
from dotenv import load_dotenv

load_dotenv()

chatbot_router = APIRouter()

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# -------------------- MODELS --------------------

class ChatRequest(BaseModel):
    message: str
    prediction_data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str

# -------------------- PROMPT TUNING --------------------

def build_context_prompt(user_message: str, prediction_data=None) -> str:
    system_rules = """
You are Eco-Copilot, a domain expert in vehicle emissions and fuel efficiency.

RULES:
- Only answer questions related to vehicle emissions, fuel use, climate impact, or eco-driving.
- Be concise, factual, and practical.
- Prefer bullet points.
- Use metric units (g/km).
- Do not invent numbers.
- Do not mention being an AI.
"""

    reference = """
REFERENCE DATA:
- Avg gasoline car: ~180 gCO2/km
- Efficient hybrid: ~110–120 gCO2/km
- EV tailpipe: 0 gCO2/km (grid dependent)
- Categories:
  Excellent <120 | Good 120–160 | Average 160–200 | High 200–250 | Very High >250
"""

    vehicle_context = ""
    if prediction_data:
        vehicle_context = f"""
USER VEHICLE DATA:
- CO2: {prediction_data.get("predicted_co2_emissions")} g/km
- Category: {prediction_data.get("category")}
- Fuel: {prediction_data.get("vehicleData", {}).get("fuel_type")}
- Engine: {prediction_data.get("vehicleData", {}).get("engine_size")} L
- Cylinders: {prediction_data.get("vehicleData", {}).get("cylinders")}

IMPORTANT:
When user refers to "my car" or "my result", use this data.
"""

    return f"""
{system_rules}
{reference}
{vehicle_context}

USER QUESTION:
{user_message}

ANSWER:
"""

# -------------------- CHAT ENDPOINT --------------------

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

    API_URL = "https://api-inference.huggingface.co/models/google/gemma-2b-it"

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 250,
            "temperature": 0.6,
            "top_p": 0.9,
            "return_full_text": False
        },
        "options": {
            "wait_for_model": True
        }
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=25)

        if response.status_code == 503:
            raise HTTPException(503, "Model is loading. Try again in a moment.")

        if response.status_code == 401:
            raise HTTPException(500, "Invalid Hugging Face API key.")

        if response.status_code == 429:
            raise HTTPException(429, "Rate limit exceeded.")

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Hugging Face inference error."
            )

        result = response.json()

        if not isinstance(result, list) or not result:
            raise HTTPException(500, "Unexpected AI response format.")

        text = result[0].get("generated_text", "").strip()

        if not text:
            text = "I couldn't generate a response. Please rephrase your question."

        return ChatResponse(response=text)

    except requests.exceptions.Timeout:
        raise HTTPException(504, "AI request timed out.")

    except requests.exceptions.ConnectionError:
        raise HTTPException(503, "Cannot reach AI service.")

    except Exception as e:
        raise HTTPException(500, f"Server error: {str(e)}")
    API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 400,
            "temperature": 0.7,
            "top_p": 0.95,
            "return_full_text": False
        }
    }

    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )

        # ---- Handle Hugging Face errors explicitly ----
        if response.status_code == 503:
            raise HTTPException(
                status_code=503,
                detail="AI model is loading. Please try again in 30–60 seconds."
            )

        if response.status_code == 401:
            raise HTTPException(
                status_code=500,
                detail="Invalid Hugging Face API key."
            )

        if response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Hugging Face inference API error."
            )

        # ---- Parse HF Inference response ----
        result = response.json()

        if not isinstance(result, list) or not result:
            raise HTTPException(
                status_code=500,
                detail="Unexpected response format from AI service."
            )

        generated_text = result[0].get("generated_text", "").strip()

        if not generated_text:
            generated_text = (
                "I couldn't generate a response. "
                "Please rephrase your question."
            )

        return ChatResponse(response=generated_text)

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="The AI request timed out. Please try again."
        )

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to Hugging Face servers."
        )

    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Network error: {str(e)}"
        )

    except HTTPException:
        # Pass FastAPI errors through untouched
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected server error: {str(e)}"
        )
