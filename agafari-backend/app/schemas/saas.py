from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

HEX_COLOR = r"^#[0-9a-fA-F]{6}$"
DEFAULT_ANTI_BROKER_NOTICE = (
    "This service is handled directly by our office. Do not pay an intermediary."
)


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


class RequirementInput(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    is_mandatory: bool = True


class AdminRequirementSchema(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    is_mandatory: bool
    order_index: float

    model_config = ConfigDict(from_attributes=True)


class AdminServiceSchema(BaseModel):
    id: str
    title: str
    slug: str
    category: str
    summary: str
    processing_time: str
    fee_etb: float
    is_published: bool
    verification_status: str
    last_verified_at: Optional[datetime] = None
    procedure_steps: Optional[List[str]] = None
    requirements: List[AdminRequirementSchema]
    document_count: int


class AdminServiceCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    category: str = Field(min_length=1, max_length=50)
    summary: str = Field(min_length=1)
    processing_time: str = Field(min_length=1, max_length=100)
    fee_etb: float = Field(default=0, ge=0)
    anti_broker_notice: str = DEFAULT_ANTI_BROKER_NOTICE
    is_published: bool = True
    procedure_steps: Optional[List[str]] = None
    requirements: Optional[List[RequirementInput]] = None


class AdminServiceUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    category: Optional[str] = Field(default=None, min_length=1, max_length=50)
    summary: Optional[str] = Field(default=None, min_length=1)
    processing_time: Optional[str] = Field(default=None, min_length=1, max_length=100)
    fee_etb: Optional[float] = Field(default=None, ge=0)
    anti_broker_notice: Optional[str] = None
    is_published: Optional[bool] = None
    procedure_steps: Optional[List[str]] = None
    requirements: Optional[List[RequirementInput]] = None


class ServiceSummaryResponse(BaseModel):
    summary: str
    procedure_steps: List[str]
    generated_by: Literal["llm", "extractive"]


class OrganizationTerminologyUpdate(BaseModel):
    service_singular: Optional[str] = Field(default=None, min_length=1, max_length=60)
    service_plural: Optional[str] = Field(default=None, min_length=1, max_length=60)


class OrganizationFeaturesUpdate(BaseModel):
    public_chat: Optional[bool] = None
    complaints: Optional[bool] = None
    employee_assistant: Optional[bool] = None
    insights: Optional[bool] = None


class OrganizationContactUpdate(BaseModel):
    email: Optional[str] = Field(default=None, max_length=320)
    phone: Optional[str] = Field(default=None, max_length=40)
    website: Optional[str] = Field(default=None, max_length=255)


class OrganizationSettingsUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = Field(default=None, pattern=HEX_COLOR)
    accent_color: Optional[str] = Field(default=None, pattern=HEX_COLOR)
    terminology: Optional[OrganizationTerminologyUpdate] = None
    features: Optional[OrganizationFeaturesUpdate] = None
    contact: Optional[OrganizationContactUpdate] = None


class ChangeLogPublishRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    public_notice: Optional[str] = None
    effective_date: Optional[datetime] = None


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    public_notice: str = Field(min_length=1)
    service_id: Optional[str] = None
    effective_date: Optional[datetime] = None
    publish: bool = True


class OrganizationUpdateItem(BaseModel):
    id: str
    title: str
    summary: str
    service_id: Optional[str] = None
    service_title: Optional[str] = None
    service_slug: Optional[str] = None
    published_at: datetime
    effective_date: Optional[datetime] = None
    origin: str
