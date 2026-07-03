"""
ParkVision AI - FastAPI Prediction Service
Exposes /predict for the Node backend to call for AI-powered
parking availability forecasts.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import model as model_module

app = FastAPI(title="ParkVision AI - Prediction Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    current_occupancy: int = Field(..., ge=0)
    total_slots: int = Field(..., gt=0)
    historical_avg_occupancy: int = Field(..., ge=0)
    current_hour: int = Field(..., ge=0, le=23)
    current_day: int = Field(..., ge=0, le=6)
    eta_minutes: int = Field(10, ge=0, le=180)

class PredictionResponse(BaseModel):
    predicted_available_slots: int
    success_probability: float
    estimated_search_time_minutes: int
    confidence_score: float
    recommendation: str

@app.get("/health")
def health():
    return {"status": "ok", "service": "ParkVision AI Prediction Service"}

@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    try:
        result = model_module.predict(
            current_occupancy=req.current_occupancy,
            total_slots=req.total_slots,
            historical_avg_occupancy=req.historical_avg_occupancy,
            current_hour=req.current_hour,
            current_day=req.current_day,
            eta_minutes=req.eta_minutes,
        )
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")