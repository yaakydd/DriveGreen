from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.prediction_router import predict_router
from routers.chatbot_router import chatbot_router


app = FastAPI(
    title="DriveGreen API",
    description="API for predicting vehicle CO2 emissions",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://drive-green-seven.vercel.app",  # Add your Vercel URL
        "http://localhost:3000",  # For local testing
        "http://localhost:5173",
    ],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router
app.include_router(predict_router, prefix="/api", tags=["predictions"])
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["chatbot"])

@app.get("/")
async def root():
    return {
        "message": "DriveGreen API is running",
        "docs": "/docs",
        "health": "/api/health"
    }
