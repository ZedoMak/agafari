from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class RequirementSchema(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    is_mandatory: bool
    photo_specifications: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SourceSchema(BaseModel):
    id: str
    title: str
    source_type: str
    source_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ServiceFeedSchema(BaseModel):
    id: str
    title: str
    slug: str
    category: str
    agency_code: str
    fee_etb: float
    processing_time: str
    verification_status: str
    last_verified_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ServiceDetailSchema(ServiceFeedSchema):
    ai_summary: str
    payment_channels: Dict[str, Any]
    anti_broker_notice: str
    requirements: List[RequirementSchema]
    sources: List[SourceSchema]

    model_config = ConfigDict(from_attributes=True)