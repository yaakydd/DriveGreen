from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.prediction_router import predict_router

app = FastAPI(
    title="CO2 Emissions Prediction API",
    description="API for predicting vehicle CO2 emissions",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router
app.include_router(predict_router, prefix="/api", tags=["predictions"])

@app.get("/")
async def root():
    return {
        "message": "CO2 Emissions Prediction API is running",
        "docs": "/docs",
        "health": "/api/health"
    }
