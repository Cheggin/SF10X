import json
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

    def map_to_pydantic_model(self):
        structured_out = json.loads(self.llm_response)
        if 'properties' in structured_out:
            self.llm_response = self.schema.model_validate_json(json.dumps(structured_out['properties']))
        else:
            self.llm_response = self.schema.model_validate_json(json.dumps(structured_out))
        return self

    def remove_newline(self):
        self.llm_response = self.llm_response.strip(r"""!"#$%&'*+,-./:;<=>?@\^_|~""" + string.whitespace)
        return self

    def extract_json_content(self):
        # Modification logic here
        if '```' in self.llm_response:
            if '```json' in self.llm_response:
                start = self.llm_response.rfind('```json') + len('```json')
            else:
                start = self.llm_response.find('```') + len('```')
            end = self.llm_response.rfind('```')
            self.llm_response = self.llm_response[start:end].strip()
        return self

    def get_result(self):
        return self.llm_response


def clean_raw_llm_response(
        llm_response: Output,
        schema: Optional[Type[BaseModel]]
) -> Union[str, Type[BaseModel]]:
    try:
        if schema:
            return (
                LLMResponseFormatter(llm_response, schema)
                .remove_newline()
                .extract_json_content()
                .map_to_pydantic_model()
                .get_result()
            )
        else:
            return LLMResponseFormatter(llm_response, schema).remove_newline().get_result()

    except Exception as e:
        logger.error(f"LLM did not respond with structured response: {str(e)}")
        raise

