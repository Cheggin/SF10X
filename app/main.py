from fastapi import FastAPI, Depends, HTTPException
from typing import List, Dict
import json
from pathlib import Path

from constants import ModelName
from llm_generator import LLMGenerator
from loguru import logger

from schemas.schema import NewsRagRequest, SummaryRequest, SummaryResponse, AgendaSummary
from summary_service import SummaryService

app = FastAPI()

# Global variable to store the LLMGenerator instance
llm_generator = None

#
# @app.on_event("startup")
# async def initialize_llm_generator():
#     global llm_generator
#
#     llm_generator = LLMGenerator(
#         [ModelName.GEMINI_2],
#         task_name="Multi turn chatbot for new articles",
#         system_prompt_path="prompts/rag_chatbot_system_prompt.txt",
#         user_prompt_path="prompts/rag_chatbot_user_prompt.txt",
#         llm_metadata={'article':"Actual transcript content"}, # this is the place to put prompt variables like article
#         structured_output_model=NewsRagRequest
#     ).__call__()
#     # Log that initialization is complete
#     logger.info(f"LLM Generator initialized during startup \n {llm_generator}")
#
#
# # Dependency to get the LLMGenerator instance
# def get_llm_generator():
#     return llm_generator

def get_summary_service():
    return SummaryService()
# @app.post("/generate")
# async def generate_response(
#         request: NewsRagRequest,
#         generator: LLMGenerator =Depends(get_llm_generator)
# ):
#     generator.llm_metadata = {"input": request.user_query}
#     generator.config = {"configurable": {"session_id": request.session_id}}
#
#     logger.info(f"LLM instance has below configuration \n {generator.__str__()}")
#
#     llm_response = generator.__call__()
#     return llm_response
#

@app.get("/summary", response_model=SummaryResponse)
async def get_summary(
        clip_id: str,
        view_id: str,
        summary_service: SummaryService = Depends(get_summary_service)
):
    """
    Get meeting summary and agenda summary for a given clip_id and view_id
    """
    request = SummaryRequest(clip_id=clip_id, view_id=view_id)
    return SummaryResponse(
        meeting_summary="Dummy Summary",
        agenda_summary=[
            AgendaSummary(agenda_name="Dummy Agenda 1", agenda_summary="Dummy agenda Summary 1"),
            AgendaSummary(agenda_name="Dummy Agenda 2", agenda_summary="Dummy agenda Summary 2"),
            AgendaSummary(agenda_name="Dummy Agenda 3", agenda_summary="Dummy agenda Summary 3"),
        ],
    )
    # return await summary_service.get_summary(request)


@app.get("/timestamps")
async def get_timestamps(clip_id: str, view_id: str) -> List[Dict]:
    """
    Get timestamps/agenda items for a given clip_id and view_id.
    
    Args:
        clip_id: The clip identifier (e.g., "50523")
        view_id: The view identifier (e.g., "10")
    
    Returns:
        Dict containing timestamps array with agenda items
    """
    
    # Load parsed meetings data
    parsed_meetings_path = Path(__file__).parent.parent / "scripts" / "parsed_meetings.json"
    
    if not parsed_meetings_path.exists():
        raise HTTPException(
            status_code=500,
            detail="Parsed meetings data not found"
        )
    
    try:
        with open(parsed_meetings_path, 'r') as f:
            meetings = json.load(f)
    except Exception as e:
        logger.error(f"Error loading parsed meetings: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error loading meeting data"
        )
    
    # Find the meeting with matching clip_id and view_id
    for meeting in meetings:
        if meeting.get('clip_id') == clip_id and meeting.get('view_id') == view_id:
            # Return just the timestamps array
            return meeting.get('timestamps', [])
    
    # Meeting not found
    raise HTTPException(
        status_code=404,
        detail=f"Meeting with clip_id='{clip_id}' and view_id='{view_id}' not found"
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=4,
    )