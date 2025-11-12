from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.predict_router import router as predict_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title="CO2 Emission Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for production restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)

@app.get("/")
def root():
    return {"message": "Welcome to the CO2 Emission Prediction API!"}

# Serve the frontend
app.mount("/", StaticFiles(directory="frontend_dist", html=True), name="frontend")

# Optional: fallback route for React Router
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_path = os.path.join("frontend_dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "File not found"}

