from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class RSVPCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    guests: str
    message: Optional[str] = ""

class RSVPResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    email: str
    phone: str
    guests: str
    message: str
    timestamp: datetime

# Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to D. Gayathri & D. Mano Vikas Wedding Website API"}

@api_router.post("/rsvp", response_model=RSVPResponse)
async def create_rsvp(rsvp_data: RSVPCreate):
    """
    Create a new RSVP entry for the wedding
    """
    # Create RSVP document
    rsvp_dict = rsvp_data.model_dump()
    rsvp_dict['id'] = str(uuid.uuid4())
    rsvp_dict['timestamp'] = datetime.now(timezone.utc).isoformat()
    
    # Insert into database
    await db.rsvps.insert_one(rsvp_dict)
    
    # Return response
    return RSVPResponse(
        id=rsvp_dict['id'],
        name=rsvp_dict['name'],
        email=rsvp_dict['email'],
        phone=rsvp_dict['phone'],
        guests=rsvp_dict['guests'],
        message=rsvp_dict['message'],
        timestamp=datetime.fromisoformat(rsvp_dict['timestamp'])
    )

@api_router.get("/rsvps")
async def get_all_rsvps():
    """
    Get all RSVP entries (for admin purposes)
    """
    rsvps = await db.rsvps.find({}, {"_id": 0}).to_list(1000)
    return {"rsvps": rsvps, "total": len(rsvps)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()