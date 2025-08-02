import string
from typing import Optional, Type, Union

from constants import ModelName
from langchain_core.runnables.utils import Output
from loguru import logger
from pydantic import BaseModel

class LLMResponseFormatter:
    def __init__(self, response: Output, schema: Optional[Type[BaseModel]]):
        self.llm_response = response
        self.schema = schema

    def remove_newline(self):
        self.llm_response = self.llm_response.strip(r"""!"#$%&'*+,-./:;<=>?@\^_|~""" + string.whitespace)
        return self

    def get_result(self):
        return self.llm_response

def clean_raw_llm_response(
        llm_response: Output,
        schema: Optional[Type[BaseModel]]
) -> Union[str, Type[BaseModel]]:
    try:
        return LLMResponseFormatter(llm_response, schema).remove_newline().get_result()

    except Exception as e:
        logger.error(f"LLM did not respond with structured response: {str(e)}")
        raise

