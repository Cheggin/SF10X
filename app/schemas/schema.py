from pydantic import BaseModel, Field, ConfigDict
from typing import List

class NewsRagRequest(BaseModel):
    user_query: str
    session_id: str

class SummaryRequest(BaseModel):
    clip_id: str = Field(..., description="Clip identifier")
    view_id: str = Field(..., description="View identifier")

class AgendaSummary(BaseModel):
    agenda_name: str = Field(..., description="Name of the agenda item")
    agenda_summary: str = Field(..., description="Summary of the agenda item")

class SummaryResponse(BaseModel):
    meeting_summary: str = Field(..., description="Full meeting summary text")
    agenda_summary: List[AgendaSummary] = Field(..., description="List of agenda summaries")

class SummarizationResponse(BaseModel):
    main_summary: str = Field(..., description="Full main summary text")
    agenda_summaries: List[AgendaSummary] = Field(..., description="List of agenda summaries")