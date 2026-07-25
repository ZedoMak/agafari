from pydantic import BaseModel, ConfigDict
from typing import Optional

class OfficeSchema(BaseModel):
    id: str
    name: str
    region: str
    sub_city: str
    address_text: Optional[str] = None
    latitude: float
    longitude: float
    operating_hours: str
    phone_number: Optional[str] = None
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)