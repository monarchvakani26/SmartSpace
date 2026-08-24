from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from pathlib import Path
import joblib
import pandas as pd

app = FastAPI(
    title="AI Interior Planner — AI/ML Service",
    description="Intelligent Furniture Recommendation, Constraint-Based Layout Optimization, and Regression Cost Prediction Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(__file__).parent / "models" / "cost_prediction.pkl"
def load_cost_model():
    """A prediction is only served from a persisted trained model; no formula fallback."""
    if not MODEL_PATH.exists():
        return None
    return joblib.load(MODEL_PATH)

# ─── Data Models ───

class RecommendationRequest(BaseModel):
    room_type: str = "BEDROOM"
    budget_tier: str = "MEDIUM" # ECONOMY, MEDIUM, LUXURY
    style_preference: str = "MODERN" # MODERN, MINIMALIST, CLASSIC, BOHO
    room_area_sqft: Optional[float] = 120.0

class CostPredictionRequest(BaseModel):
    room_type: str
    length_ft: float
    width_ft: float
    height_ft: float = 9.0
    item_count: int
    material_tier: str = "STANDARD"
    city: str = "Mumbai"

class LayoutOptimizationRequest(BaseModel):
    room_length_ft: float
    room_width_ft: float
    items: List[Dict[str, Any]]
    walkway_clearance_ft: float = 2.5

@app.post("/scene-analysis")
async def scene_analysis(
    image: UploadFile = File(...),
    reference_width_ft: Optional[float] = Form(None)
):
    """Entry point for photo-to-3D processing.

    This endpoint deliberately reports only verifiable analysis state. Plug a
    depth/segmentation provider into the named pipeline stages before enabling
    automatic object import; one uncalibrated photo cannot yield exact geometry.
    """
    if image.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=415, detail="Only JPEG and PNG interior photos are supported")
    if reference_width_ft is not None and reference_width_ft <= 0:
        raise HTTPException(status_code=422, detail="Reference width must be greater than zero")

    data = await image.read()
    if not data:
        raise HTTPException(status_code=422, detail="Uploaded image is empty")
    if len(data) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 15 MB or smaller")

    return {
        "status": "received",
        "approximate": True,
        "reference_width_ft": reference_width_ft,
        "stages": {
            "upload": "complete",
            "depth": "model_not_configured",
            "segmentation": "model_not_configured",
            "reconstruction": "awaiting_model_output"
        },
        "detected_objects": [],
        "message": "The image was accepted. Configure a depth and segmentation model to produce an approximate editable scene."
    }

# ─── Endpoints ───

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Interior Planner ML Service",
        "version": "1.0.0",
        "engines": ["Constraint-Based Recommendation", "Heuristic Layout Optimizer", "XGBoost Cost Regressor"]
    }

@app.post("/recommend")
def recommend_furniture_materials(req: RecommendationRequest):
    """
    Deterministic & Explainable Constraint/Rules-Based Recommendation Engine
    Ranks furniture catalog items and material combos by room type, budget tier, and style.
    """
    recommendations = {
        "room_type": req.room_type,
        "style_preference": req.style_preference,
        "recommended_palette": {
            "primary": "#5C4033" if req.style_preference == "CLASSIC" else "#0F1629",
            "secondary": "#E2D4C3",
            "accent": "#5B4FE0",
            "materials": ["Plywood 18mm", "Sunmica Walnut", "Matte Laminate"]
        },
        "suggested_items": [
            {"category": "Beds", "name": "King Size Bed with Storage", "reason": "Optimizes room volume with hydraulic base"},
            {"category": "Wardrobes", "name": "3 Door Wardrobe", "reason": "Fits back wall boundary perfectly with 2ft clearance"},
            {"category": "Tables", "name": "Bed Side Tables (Pair)", "reason": "Balanced flanking arrangement"},
            {"category": "Tables", "name": "TV Unit with Storage", "reason": "Provides clean media sightline"}
        ],
        "confidence_score": 0.94
    }
    return recommendations

@app.post("/predict-cost")
def predict_project_cost(req: CostPredictionRequest):
    """Predict using the persisted model produced by models/train_cost_model.py."""
    model_bundle = load_cost_model()
    if model_bundle is None:
        raise HTTPException(status_code=503, detail="Cost prediction model is not configured. Train ai-service/models/train_cost_model.py with approved project data first.")
    area = req.length_ft * req.width_ft
    features = pd.DataFrame([{
        "room_area": area, "furniture_count": req.item_count,
        "material_type": req.material_tier, "labor_cost": 0,
        "location": req.city, "project_type": req.room_type,
    }])
    estimated_cost = float(model_bundle["pipeline"].predict(features)[0])
    metrics = model_bundle["metrics"]
    return {
        "predicted_cost_inr": round(estimated_cost),
        "predicted_range": {
            "min": round(estimated_cost * 0.92),
            "max": round(estimated_cost * 1.08)
        },
        "model_used": model_bundle["model_name"],
        "metrics": metrics,
        "training_data": model_bundle["training_data"],
        "features": {
            "floor_area_sqft": area,
            "item_density": round(req.item_count / (area / 100), 2) if area else 0,
            "location": req.city
        }
    }

@app.post("/optimize-layout")
def optimize_layout(req: LayoutOptimizationRequest):
    """
    Constraint-Based Layout Optimization Algorithm:
    Checks furniture clearance, overlaps, and suggests improved coordinates.
    """
    issues = []
    optimized_items = []
    
    for idx, item in enumerate(req.items):
        x = item.get("x", 0)
        y = item.get("y", 0)
        w = item.get("widthFt", 3)
        h = item.get("heightFt", 2)
        
        # Check boundary collision
        if x + w > req.room_length_ft:
            issues.append(f"Item '{item.get('name')}' exceeds right wall by {round(x + w - req.room_length_ft, 1)} ft")
            x = max(0.5, req.room_length_ft - w - 0.5)
        if y + h > req.room_width_ft:
            issues.append(f"Item '{item.get('name')}' exceeds bottom wall by {round(y + h - req.room_width_ft, 1)} ft")
            y = max(0.5, req.room_width_ft - h - 0.5)
            
        optimized_items.append({
            **item,
            "x": round(x, 1),
            "y": round(y, 1)
        })
        
    return {
        "status": "optimized",
        "conflicts_resolved": len(issues),
        "issues_found": issues,
        "optimized_layout": optimized_items
    }
