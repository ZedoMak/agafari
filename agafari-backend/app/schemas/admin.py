from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional
from datetime import datetime

class ChangeLogSchema(BaseModel):
    id: str
    service_id: Optional[str] = None
    service_title: Optional[str] = None
    source_title: str
    title: str
    old_data_snapshot: Dict[str, Any]
    new_data_snapshot: Dict[str, Any]
    ai_change_summary: str
    public_notice: Optional[str] = None
    status: str
    origin: str
    detected_at: datetime
    published_at: Optional[datetime] = None
    effective_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
