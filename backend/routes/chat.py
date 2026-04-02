
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import create_access_token
from ..config import settings
from ..database import get_db
from ..deps import get_current_user
from ..groq_client import generate_reply
from ..models import Conversation, Message, User
from ..schemas import (
    ChatRequest,
    ChatResponse,
    ConversationDetail,
    ConversationResponse,
)

router = APIRouter()


def build_title(text: str) -> str:
    text = text.strip()
    return (text[:40] + "...") if len(text) > 40 else text or "New Chat"


@router.get("/conversations", response_model=list[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return conversations


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Missing GROQ_API_KEY in backend .env",
        )

    conversation = None

    if payload.conversation_id is not None:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == payload.conversation_id,
                Conversation.user_id == current_user.id,
            )
            .first()
        )

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(
            title=build_title(payload.message),
            user_id=current_user.id,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    if not conversation.title or conversation.title == "New Chat":
        conversation.title = build_title(payload.message)

    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=payload.message,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    history_rows = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .all()
    )

    history = [{"role": row.role, "content": row.content} for row in history_rows]

    reply_text = generate_reply(history)

    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=reply_text,
    )
    db.add(assistant_message)

    conversation.updated_at = datetime.utcnow()
    db.add(conversation)

    db.commit()
    db.refresh(assistant_message)
    db.refresh(conversation)

    return ChatResponse(
        conversation_id=conversation.id,
        title=conversation.title,
        user_message=user_message,
        assistant_message=assistant_message,
    )


@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conversation)
    db.commit()
    return None
    