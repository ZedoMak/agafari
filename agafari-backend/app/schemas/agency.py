from pydantic import BaseModel, ConfigDict

class AgencySchema(BaseModel):
    id: str
    name: str
    short_code: str

    model_config = ConfigDict(from_attributes=True)