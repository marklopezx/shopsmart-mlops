import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from typing import List, Optional

app = FastAPI(title="ShopSmart ML API")

# --- ROOT HEALTH CHECK ROUTE ---
@app.get("/")
def health_check():
    return {"status": "ShopSmart ML API is running!"}

# --- 1. SUPABASE CONNECTION ---
SUPABASE_URL = "https://nggbvafslqtnuamrkafi.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZ2J2YWZzbHF0bnVhbXJrYWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODk5NzUsImV4cCI6MjEwMjk2NTk3NX0.OZ6chZPV7ju4u7LPIgGW0yRCTF3T5kShWS61GDlwKAc"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 2. CORS (Allows your HTML files to talk to this API) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. LOAD THE ML MODEL ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'ecommerce_purchase_model.joblib')
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Successfully loaded model from {MODEL_PATH}")
except Exception as e:
    model = None
    print(f"⚠️ Warning: Could not load model. Error: {e}")

# --- 4. PYDANTIC MODEL (Matches the ML feature names exactly) ---
class SessionData(BaseModel):
    Administrative: int
    Administrative_Duration: float
    Informational: int
    Informational_Duration: float
    ProductRelated: int
    ProductRelated_Duration: float
    BounceRates: float
    ExitRates: float
    PageValues: float
    SpecialDay: float
    Month: str
    OperatingSystems: int
    Browser: int
    Region: int
    TrafficType: int
    VisitorType: str
    Weekend: bool
    actual_revenue: Optional[bool] = False

# --- 5. ENDPOINTS ---

@app.post("/predict")
async def predict_purchase(session: SessionData):
    """Predicts the likelihood of a purchase in real-time."""
    if model is None:
        return {"prediction": True, "purchase_probability": 0.85, "note": "MOCK DATA"}
    
    # Convert input to DataFrame for the model
    input_data = pd.DataFrame([session.dict(exclude={'actual_revenue'})])
    
    probability = model.predict_proba(input_data)[0][1]
    prediction = bool(model.predict(input_data)[0])
    
    return {
        "prediction": prediction,
        "purchase_probability": float(probability)
    }

@app.post("/log-session")
async def log_session(session: SessionData):
    """Translates the data to snake_case and saves it to Supabase."""
    try:
        # Map PascalCase to Supabase snake_case columns
        db_payload = {
            "administrative": session.Administrative,
            "administrative_duration": session.Administrative_Duration,
            "informational": session.Informational,
            "informational_duration": session.Informational_Duration,
            "product_related": session.ProductRelated,
            "product_related_duration": session.ProductRelated_Duration,
            "bounce_rates": session.BounceRates,
            "exit_rates": session.ExitRates,
            "page_values": session.PageValues,
            "special_day": session.SpecialDay,
            "month": session.Month,
            "operating_systems": session.OperatingSystems,
            "browser": session.Browser,
            "region": session.Region,
            "traffic_type": session.TrafficType,
            "visitor_type": session.VisitorType,
            "weekend": session.Weekend,
            "actual_revenue": session.actual_revenue
        }
        
        # Insert into Supabase
        response = supabase.table('user_behavior_logs').insert(db_payload).execute()
        return {"status": "success", "message": "Session logged to database."}
        
    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs")
async def get_logs():
    """Fetches all raw logs directly from Supabase for the Admin Dashboard."""
    try:
        response = supabase.table('user_behavior_logs').select('*').order('created_at', desc=True).execute()
        return {"logs": response.data}
    except Exception as e:
        print(f"Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))