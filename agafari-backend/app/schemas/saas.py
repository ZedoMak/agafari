from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class OrganizationTheme(BaseModel):
    primary: str
    accent: str


class OrganizationFeatures(BaseModel):
    public_chat: bool = True
    complaints: bool = True
    employee_assistant: bool = True
    insights: bool = True


class OrganizationBootstrap(BaseModel):
    id: str
    slug: str
    name: str
    short_code: str
    sector: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    theme: OrganizationTheme
    terminology: Dict[str, str]
    features: OrganizationFeatures
    contact: Dict[str, Any]


class AccessSessionRequest(BaseModel):
    organization_slug: str
    access_code: str = Field(min_length=4, max_length=200)


class AccessSessionResponse(BaseModel):
    access_token: str
    expires_at: datetime
    organization_id: str


class SaaSChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: Optional[str] = None
    service_id: Optional[str] = None
    department: Optional[str] = Field(default=None, max_length=100)


class CitationSchema(BaseModel):
    source_id: Optional[str] = None
    title: str
    url: Optional[str] = None
    section: Optional[str] = None


class SaaSChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    reply: str
    answer_status: Literal["ANSWERED", "LOW_CONFIDENCE", "UNANSWERED", "ERROR"]
    citations: List[CitationSchema]


class MessageFeedback(BaseModel):
    feedback: Literal["HELPFUL", "NOT_HELPFUL"]


class ComplaintContact(BaseModel):
    email: Optional[str] = Field(default=None, max_length=320)
    phone: Optional[str] = Field(default=None, max_length=40)


class ComplaintCreate(BaseModel):
    organization_id: str
    service_id: Optional[str] = None
    category: str = Field(min_length=2, max_length=80)
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    description: str = Field(min_length=10, max_length=10_000)
    contact: Optional[ComplaintContact] = None
    consent_to_contact: bool = False


class ComplaintResponse(BaseModel):
    id: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintUpdate(BaseModel):
    status: Literal["NEW", "REVIEWING", "ACTIONED", "RESOLVED", "DISMISSED"]
    resolution_note: Optional[str] = Field(default=None, max_length=5000)


class InsightUpdate(BaseModel):
    status: Literal["NEW", "REVIEWING", "ACTIONED", "RESOLVED", "DISMISSED"]
    owner: Optional[str] = Field(default=None, max_length=120)
    resolution_note: Optional[str] = Field(default=None, max_length=5000)


class DocumentCreate(BaseModel):
    service_id: Optional[str] = None
    title: str = Field(min_length=2, max_length=255)
    source_type: str = Field(default="TEXT", max_length=50)
    source_url: Optional[str] = None
    raw_text_content: str = Field(min_length=1)
    visibility: Literal["PUBLIC", "INTERNAL"]
    department: Optional[str] = Field(default=None, max_length=100)


class DocumentStatusResponse(BaseModel):
    id: str
    title: str
    visibility: str
    approval_status: str
    processing_status: str
    department: Optional[str] = None
    version: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
