
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import auth, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Chatbot API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://bot-wheat-gamma.vercel.app",
    "https://bot-8qomm2g5y-bhargavi-308s-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
     allow_origins=[
         "http://localhost:5173",
         "http://localhost:5174",
         "http://127.0.0.1:5173",
         "http://127.0.0.1:5174",
         "http://localhost:3000",
         "http://127.0.0.1:3000",
     ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend is running"}


app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(chat.router, tags=["Chat"])
