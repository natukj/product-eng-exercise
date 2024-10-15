from tenacity import retry, retry_if_exception_type, wait_random_exponential, stop_after_attempt
import openai
from openai import AsyncOpenAI

client = AsyncOpenAI()

@retry(
    wait=wait_random_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type((Exception)),
    stop=stop_after_attempt(5),
    before_sleep=lambda retry_state: print(f"Retrying attempt {retry_state.attempt_number} for OAI embedding request...")
)
async def openai_client_embedding_request(text, model="text-embedding-3-small"):
    text = text.replace("\n", " ")
    try:
        response = await client.embeddings.create(input = [text], model=model)
        return response.data[0].embedding
    except openai.APIError as e:
        print(f"OpenAI Embedding API Error: {e}")
        raise

@retry(
    wait=wait_random_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type((Exception)),
    stop=stop_after_attempt(5),
    before_sleep=lambda retry_state: print(f"Retrying attempt {retry_state.attempt_number} for OAI completion request...")
)
async def openai_client_chat_completion_request(messages, model="gpt-4o", temperature=0.4, response_format="json_object"):
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            response_format={ "type": response_format },
            temperature=temperature
        )
        return response
    except openai.APIError as e:
        print(f"OpenAI API Error: {e}")
        raise

@retry(
    wait=wait_random_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type((Exception)),
    stop=stop_after_attempt(5),
    before_sleep=lambda retry_state: print(f"Retrying attempt {retry_state.attempt_number} for OAI tool completion request...")
)
async def openai_client_tool_completion_request(messages, tools, tool_choice="auto", model="gpt-4o-2024-08-06"):
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
            tool_choice=tool_choice,
        )
        return response
    except openai.APIError as e:
        print(f"OpenAI API Error: {e}")
        raise