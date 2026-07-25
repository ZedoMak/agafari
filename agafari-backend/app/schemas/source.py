from pydantic import BaseModel
from typing import Optional

class SourceCreatePayload(BaseModel):
    agency_id: str
    service_id: Optional[str] = None
    source_type: str
    title: str
    source_url: Optional[str] = None
    raw_text_content: str