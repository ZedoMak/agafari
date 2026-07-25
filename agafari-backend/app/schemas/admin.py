from pydantic import BaseModel, ConfigDict
from typing import Dict, Any
from datetime import datetime

class ChangeLogSchema(BaseModel):
    id: str
    service_id: str
    service_title: str
    source_title: str
    old_data_snapshot: Dict[str, Any]
    new_data_snapshot: Dict[str, Any]
    ai_change_summary: str
    status: str
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)