import os

from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatPerplexity
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic

from constants import ModelName
from dotenv import load_dotenv
load_dotenv()


def create_openai_model(model_name, **model_params):
    return ChatOpenAI(
        model_name=model_name,
        **model_params
    )

def create_anthropic_model(model_name, **model_params):
    return ChatAnthropic(
        model=model_name,
        **model_params
    )

def create_google_model(model_name, **model_params):
    return ChatGoogleGenerativeAI(
        model=model_name,
        **model_params
    )

def create_perplexity_model(model_name, **model_params):
    return ChatPerplexity(
        model=model_name,
        pplx_api_key=os.getenv("PERPLEXITY_API_KEY"),
        **model_params
    )


MODEL_CREATORS = {
    ModelName.GPT4O: lambda **params: create_openai_model("gpt-4o", **params),

    ModelName.GEMINI_2: lambda **params: create_google_model("gemini-2.0-flash", **params),

    ModelName.SONAR_REASONING: lambda **params: create_perplexity_model("sonar-reasoning", **params),
    ModelName.SONAR_PRO: lambda **params: create_perplexity_model("sonar-pro", **params),
    ModelName.SONAR: lambda **params: create_perplexity_model("sonar", **params),
}

def select_model(model_name: ModelName, **model_params):
    try:
        model_enum = ModelName(model_name)
    except ValueError:
        raise ValueError(f"Invalid model name: '{model_name}'")

    if model_enum in MODEL_CREATORS:
        return MODEL_CREATORS[model_enum](**model_params)
    else:
        raise ValueError(f"Model '{model_enum}' not found in the list of available models.")
