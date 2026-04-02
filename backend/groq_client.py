
from groq import Groq
from .config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = (
    "You are a helpful AI assistant. Keep answers clear, correct, and concise."
)


def generate_reply(history: list[dict[str, str]]) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history

    completion = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=0.7,
    )
    return completion.choices[0].message.content or "Sorry, I could not generate a response."
    