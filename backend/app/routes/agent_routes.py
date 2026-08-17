from fastapi import APIRouter, FastAPI, HTTPException, status, Request
from pydantic import BaseModel
from typing import List, Dict, Optional
from dotenv import load_dotenv
import openai
import os
import firebase_admin
from firebase_admin import credentials, firestore
import time

# Firebase & OpenAI API 설정
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
# cred = credentials.Certificate("app/firebase_key.json")   # Firebase 인증 파일 경로
# firebase_admin.initialize_app(cred)
db = firestore.client()

# FastAPI 설정
app = FastAPI()
router = APIRouter()

# 데이터 모델
class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class JournalRequest(BaseModel):
    summary: str  # 요약 내용
    date: str  # 저장할 날짜

class ConversationStartRequest(BaseModel):
    prompt: str

# Firestore 컬렉션 이름
USER_COLLECTION = "users"

# 대화 기록 저장소
conversations = {}

# Firestore 데이터 업로드 함수
def upload_to_firestore(conversation_id, user_input, assistant_reply):
    doc_ref = db.collection(USER_COLLECTION).document(conversation_id)
    doc_ref.set({
        u'conversation': firestore.ArrayUnion([
            {"role": "user", "content": user_input},
            {"role": "assistant", "content": assistant_reply}
        ])
    }, merge=True)

# standalone 기능

def standalone(text):
    messages = [
        {"role": "system", "content": "You are a helpful therapist providing empathetic and concise responses."}
    ] + text[-3:]  # 최근 3개의 메시지만 전달

    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=200,
        temperature=0.7
    )
    return completion.choices[0].message.content

# API 라우터 정의
@router.post("/start-conversation")
async def start_conversation(request: ConversationStartRequest):
    """
    새로운 대화를 시작합니다.
    """
    prompt = request.prompt
    messages = [
        {"role": "system", "content": "You are a warm, empathetic therapist."},
        {"role": "user", "content": prompt}
    ]
    response = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=messages)
    assistant_reply = response.choices[0].message.content

    conversation_id = str(len(conversations))
    conversations[conversation_id] = messages + [{"role": "assistant", "content": assistant_reply}]
    # upload_to_firestore(conversation_id, prompt, assistant_reply)

    return {"conversation_id": conversation_id, "assistant_reply": assistant_reply}

@router.post("/continue-conversation2")
async def continue_conversation(
    userId: str,  # 유저 ID
    user_input: Optional[str] = None  # 사용자의 입력 (첫 대화 시에는 없을 수 있음)
):
    """
    대화를 시작하거나 이어갑니다.
    """
    # # 유저 preferences 가져오기 (예: Firestore 또는 DB 조회)
    # user_preferences = get_user_preferences(userId)  # 예시 함수로 정의 필요
    greeting_message ="안녕하세요 오늘은 어떤 일이 있었나요?"

    # 새 대화인지 확인
    if not user_input:
        # 새로운 대화 시작
        messages = [
            {"role": "system", "content": "You are a warm, empathetic therapist."},
            {"role": "assistant", "content": greeting_message}
        ]
        conversation_id = str(len(conversations))
        conversations[conversation_id] = messages
        return {"conversation_id": conversation_id, "assistant_reply": greeting_message}
    
    # 기존 대화 이어가기
    conversation_id = str(len(conversations) - 1)  # 마지막 대화 ID 사용
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = conversations[conversation_id]
    messages.append({"role": "user", "content": user_input})

    # GPT 모델 호출
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", 
        messages=messages
    )
    assistant_reply = response.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_reply})

    # Firestore 저장 (옵션)
    # upload_to_firestore(conversation_id, user_input, assistant_reply)

    # 대화 길이에 따라 요약 추가
    if len(messages) >= 6:
        summary_prompt = [{"role": "system", "content": "Summarize the following conversation briefly."}] + messages
        summary_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=summary_prompt,
            max_tokens=100
        )
        summary = summary_response.choices[0].message.content
        return {"conversation_id": conversation_id, "assistant_reply": assistant_reply, "summary": summary}

    return {"conversation_id": conversation_id, "assistant_reply": assistant_reply}


@router.post("/continue-conversation")
async def continue_conversation(conversation_id: str, user_input: str):
    """
    대화를 이어갑니다.
    """
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # 기존 대화 불러오기
    messages = conversations[conversation_id]
    messages.append({"role": "user", "content": user_input})

    # standalone 호출
    assistant_reply = standalone(messages)
    messages.append({"role": "assistant", "content": assistant_reply})

    # Firestore 저장
    # upload_to_firestore(conversation_id, user_input, assistant_reply)

    # 3번 턴 이후 요약 추가
    if len(messages) >= 6:
        summary_prompt = [
            {"role": "system", "content": "Summarize the following conversation briefly."}
        ] + messages
        summary_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=summary_prompt,
            max_tokens=100
        )
        summary = summary_response.choices[0].message.content
        return {"assistant_reply": assistant_reply, "summary": summary}

    return {"assistant_reply": assistant_reply}



@router.post("/save-journal", status_code=status.HTTP_201_CREATED)
async def save_journal(request: JournalRequest):
    """
    요약된 대화를 저장합니다.
    """
    db.collection("journals").add({
        "summary": request.summary,
        "date": request.date
    })
    return {"message": "Journal saved successfully"}


@router.get("/journals")
async def get_journals():
    """
    저장된 일기 목록을 반환합니다.
    """
    docs = db.collection("journals").stream()
    journals = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return journals

# FastAPI 앱에 라우터 추가
# app.include_router(router)
