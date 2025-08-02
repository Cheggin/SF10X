from pydantic import BaseModel, Field, ConfigDict

class NewsRagRequest(BaseModel):
    session_id: str = Field(default="test-123", description="User Session ID")
    user_query: str = Field(..., description="User Query String")
    model_config = ConfigDict(from_attributes=True)