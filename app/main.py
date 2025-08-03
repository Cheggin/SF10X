from fastapi import FastAPI, Depends
from schemas.schema import SummaryRequest, SummaryResponse, AgendaSummary
from summary_service import SummaryService

app = FastAPI()

def get_summary_service():
    return SummaryService()

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=4,
    )