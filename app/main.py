from fastapi import FastAPI, Depends
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from constants import ModelName
from llm_generator import LLMGenerator
from loguru import logger

from schemas.schema import NewsRagRequest

app = FastAPI()

# Global variable to store the LLMGenerator instance
llm_generator = None


@app.on_event("startup")
async def initialize_llm_generator():
    global llm_generator

    llm_generator = LLMGenerator(
        [ModelName.GEMINI_2],
        task_name="Multi turn chatbot for new articles",
        system_prompt_path="prompts/rag_chatbot_system_prompt.txt",
        user_prompt_path="prompts/rag_chatbot_user_prompt.txt",
        llm_metadata={}, # this is the place to put prompt variables like article
        structured_output_model=NewsRagRequest
    ).__call__()x
    # Log that initialization is complete
    logger.info(f"LLM Generator initialized during startup \n {llm_generator}")


# Dependency to get the LLMGenerator instance
def get_llm_generator():
    return llm_generator


@app.post("/generate")
async def generate_response(
        request: NewsRagRequest,
        generator: LLMGenerator =Depends(get_llm_generator)
):
    generator.llm_metadata = {"input": request.user_query}
    generator.config = {"configurable": {"session_id": request.session_id}}

    logger.info(f"LLM instance has below configuration \n {generator.__str__()}")

    llm_response = generator.__call__()
    return llm_response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=4,
    )