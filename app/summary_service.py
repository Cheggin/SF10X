from typing import Optional
from fastapi import HTTPException
from loguru import logger

from schemas.schema import SummaryRequest, SummaryResponse, AgendaSummary
from db_service import db_service


class SummaryService:
    
    async def get_summary(self, request: SummaryRequest) -> SummaryResponse:
        """
        Get meeting summary and agenda summary based on clip_id and view_id
        
        Args:
            request: SummaryRequest containing clip_id and view_id
            
        Returns:
            SummaryResponse with meeting summary and agenda summaries
            
        Raises:
            HTTPException: If summary not found or database error occurs
        """
        try:
            # Construct meeting_id from clip_id and view_id
            meeting_id = f"{request.clip_id}_{request.view_id}"
            
            logger.info(f"Fetching summary for meeting_id: {meeting_id}")
            
            # Get data from database
            result = await db_service.get_meeting_summary(meeting_id)
            
            if result is None:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Summary not found for meeting_id: {meeting_id}"
                )
            
            meeting_summary, agenda_summary_data = result
            
            # Convert agenda summary data to Pydantic models
            agenda_summaries = []
            if agenda_summary_data:
                for item in agenda_summary_data:
                    agenda_summaries.append(AgendaSummary(
                        agenda_name=item.get("agenda_name", ""),
                        agenda_summary=item.get("agenda_summary", "")
                    ))
            
            return SummaryResponse(
                meeting_summary=meeting_summary,
                agenda_summary=agenda_summaries
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_summary: {e}")
            raise HTTPException(
                status_code=500, 
                detail="Internal server error while fetching summary"
            )