
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_email: EmailStr


class UserResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    title: str | None = None


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationDetail(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse]

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    conversation_id: int
    title: str
    user_message: MessageResponse
    assistant_message: MessageResponse
    