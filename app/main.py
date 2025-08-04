from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

from loguru import logger

from schemas.schema import SummaryResponse, AgendaSummary
from db_service import db_service

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        view_id: str
):
    """
    Get meeting summary and agenda summary for a given clip_id and view_id
    """
    try:
        # Construct meeting_id in the format expected by the database
        meeting_id = f"{view_id}_{clip_id}"
        
        # Get meeting summary from database
        result = await db_service.get_meeting_summary(meeting_id)
        
        if result is None:
            raise HTTPException(
                status_code=404,
                detail=f"Meeting summary with clip_id='{clip_id}' and view_id='{view_id}' not found"
            )
        
        meeting_summary, agenda_summaries, tags = result
        
        # Convert agenda summaries to the expected format
        agenda_summary_list = [
            AgendaSummary(
                agenda_name=item['agenda_name'],
                agenda_summary=item['agenda_summary']
            )
            for item in agenda_summaries
        ]
        
        return SummaryResponse(
            meeting_summary=meeting_summary,
            agenda_summary=agenda_summary_list,
            tags=tags if tags else []
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving meeting summary for clip_id={clip_id}, view_id={view_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving meeting summary from database"
        )


@app.get("/timestamps")
async def get_timestamps(clip_id: str, view_id: str) -> List[Dict]:
    """
    Get timestamps/agenda items for a given clip_id and view_id.
    
    Args:
        clip_id: The clip identifier (e.g., "50523")
        view_id: The view identifier (e.g., "10")
    
    Returns:
        List containing timestamps with agenda items
    """
    
    try:
        timestamps = await db_service.get_timestamps(clip_id, view_id)
        
        if timestamps is None:
            raise HTTPException(
                status_code=404,
                detail=f"Meeting with clip_id='{clip_id}' and view_id='{view_id}' not found"
            )
        
        return timestamps
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving timestamps for clip_id={clip_id}, view_id={view_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving timestamps from database"
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