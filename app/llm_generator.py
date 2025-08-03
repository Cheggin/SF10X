import concurrent.futures
import time
import traceback
from typing import Any, List, Optional, Type, Union

from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from pydantic import BaseModel

from constants import ModelName
from select_model import select_model
from file_utils import read_txt_file
from llm_response_formatter import clean_raw_llm_response


class LLMGenerator:
    def __init__(
            self,
            foundational_models: List[ModelName],
            task_name: str,
            system_prompt_path: str,
            user_prompt_path: str,
            llm_metadata: dict,
            structured_output_model: Optional[Type[BaseModel]] = None,
            tools: Optional[List[Any]] = None
    ):
        """Initialize the LLM Generator.

        Args:
            foundational_models: List of model names to use
            task_name: Name of the task being performed
            system_prompt_path: Path to system prompt file
            user_prompt_path: Path to user prompt file
            llm_metadata: Additional metadata to pass to the LLM
            structured_output_model: Optional Pydantic model for structured output
            tools: Optional list of LangChain tools to bind to the models
        """
        try:
            self.task_name = task_name
            self.system_prompt_path = system_prompt_path
            self.user_prompt_path = user_prompt_path
            self.generator_models = foundational_models
            self.structured_output_model = structured_output_model
            self.llm_metadata = llm_metadata
            self.tools = tools
            self.generator_prompt_template = self.init_chat_prompt()

        except Exception as vs_ex:
            logger.error(vs_ex.__str__())
            raise

    def init_chat_prompt(self):
        system_prompt = read_txt_file(self.system_prompt_path)
        user_prompt = read_txt_file(self.user_prompt_path)
        if self.tools:
            prompt = ChatPromptTemplate.from_messages(
                [("system", system_prompt),
                 ("human", user_prompt),
                 ("placeholder", "{agent_scratchpad}"),
                 ("placeholder", "{task_memory}")]
            )
        else:
            prompt = ChatPromptTemplate.from_messages(
                [("system", system_prompt), ("human", user_prompt)]
            )

        return prompt

    def get_llm_response(self, chat_model):
        if self.tools:
            agent = create_tool_calling_agent(chat_model, self.tools, self.generator_prompt_template)
            agent_executor = AgentExecutor(agent=agent, tools=self.tools, verbose=True)
            response = agent_executor.invoke({**self.llm_metadata}).get("output")
        else:
            generator_chain = self.generator_prompt_template | chat_model
            response = generator_chain.invoke({**self.llm_metadata}).content
        return response

    def generate(self, model_name: ModelName) -> tuple[Any, Union[str, Type[BaseModel]]]:
        if model_name:
            try:
                chat_model = select_model(model_name, temperature=0)
                logger.info(f"started LLM response generation -- {self.task_name} -- {model_name.value}")
                llm_response_unparsed = self.get_llm_response(chat_model)
                parser = StrOutputParser()
                llm_response = parser.parse(llm_response_unparsed)

                response = clean_raw_llm_response(llm_response, self.structured_output_model)
                logger.info(f"finished LLM response generation -- {self.task_name} -- {model_name.value}")
                if self.structured_output_model:
                    return model_name.value, self.structured_output_model.model_validate(response)
                else:
                    return model_name.value, response
            except Exception as e_x:
                logger.error(f"LLM Generation --- {self.task_name} --- error occurred: {str(e_x)}")
                logger.error("Stack trace:\n" + traceback.format_exc())
                raise

    def __call__(self) -> dict[str, BaseModel] | str:
        # Use ThreadPoolExecutor for parallel execution
        responses = {}
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_model = {executor.submit(self.generate, model): model for model in self.generator_models}
            for future in concurrent.futures.as_completed(future_to_model):
                model_name = future_to_model[future]
                try:
                    model_name, response = future.result()
                    responses[model_name] = response
                except Exception as exc:
                    logger.error(f"Error with LLM -- {model_name} -- response generation : {exc.__str__()}")
            logger.info(f"Finished generating responses from models, {responses.keys()}")

        return responses
