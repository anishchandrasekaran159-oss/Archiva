import os
import cohere
from dotenv import load_dotenv

load_dotenv()

client = cohere.Client(os.getenv("COHERE_API_KEY"))

def embed(text: str, input_type: str = "search_document") -> list[float]:
    response = client.embed(
        texts=[text],
        model="embed-english-v3.0",
        input_type=input_type
    )
    return response.embeddings[0]