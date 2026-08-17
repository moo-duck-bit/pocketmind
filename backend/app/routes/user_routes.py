from fastapi import APIRouter

import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import HTTPException, status
from passlib.context import CryptContext
from typing import Optional
from typing import List, Dict
import openai
from dotenv import load_dotenv
import os

# from models import User
from fastapi.middleware.cors import CORSMiddleware


from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: str
    password: str
    goal:str # 유저의 취향 정보를 저장하는 필드

class LoginRequest(BaseModel):
    email: EmailStr  # 이메일 형식 검증
    password: str    # 비밀번호

    # 요청 데이터 모델
class ConversationStartRequest(BaseModel):
    prompt: str

# 데이터 모델
class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ConversationRequest(BaseModel):
    conversation_id: str
    user_input: str

class JournalRequest(BaseModel):
    userId: str
    content: str
    rating: int  # 유저 평가 점수 (예: 1 ~ 5점)
    
class JournalResponse(BaseModel):
    userId: str
    content: str
    date: str
    rating: int
    created_at: str


# 대화 상태를 메모리에 저장
conversations = {}

load_dotenv()
# OpenAI API 키 설정
openai.api_key = os.getenv("OPENAI_API_KEY")
origins = ["*", "http://localhost:3000", "http://localhost:8000", "https://mindful-journal-frontend-s8zk.vercel.app/"] 
# Firebase 초기화
# 서비스 계정 키는 저장소에 포함하지 않습니다. .env.example 참고.
cred = credentials.Certificate(
    os.getenv("FIREBASE_CREDENTIALS", "app/firebase_key.json")
)
firebase_admin.initialize_app(cred)

# 비밀번호 해싱 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Firebase 컬렉션 이름 설정
USER_COLLECTION = "users"

# Firestore DB 연결
db = firestore.client()
router = APIRouter()

# Corc 처리

origins = ["*", "http://localhost:3000", "http://localhost:8000", "https://mindful-journal-frontend-s8zk.vercel.app/"]
router = APIRouter()


# 회원가입 API
@router.post("/signup")
async def signup(user: User):
    try:
        # Firestore에서 기존 이메일 확인
        user_ref = db.collection(USER_COLLECTION).where("email", "==", user.email).get()
        if user_ref:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

        # 비밀번호 해싱 후 Firestore에 데이터 추가
        # hashed_password = pwd_context.hash(user.password)
        db.collection(USER_COLLECTION).add({
            "email": user.email,
            "password": user.password,
            "goal": user.goal
        })

        return {"message": "User created successfully"}

    except Exception as e:
        # 에러 디버깅
        print(f"Error during signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during signup."
        )

@router.get("/test-firestore")
async def test_firestore():
    try:
        collections = db.collections()
        return {"collections": [col.id for col in collections]}
    except Exception as e:
        print(f"Firestore connection error: {e}")
        return {"error": str(e)}
    
@router.post("/login")
async def login(login_request: LoginRequest):
    try:
        # 요청 데이터에서 이메일과 비밀번호 추출
        email = login_request.email
        password = login_request.password

        # Firestore에서 해당 이메일을 가진 사용자 조회
        user_ref = db.collection(USER_COLLECTION).where("email", "==", email).get()
        if not user_ref:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Firestore에서 가져온 사용자 데이터
        user_data = user_ref[0].to_dict()
        user_id = user_ref[0].id  # Firestore 문서의 고유 ID

        # 비밀번호 검증
        if password != user_data["password"]:  # 비밀번호 직접 비교
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password"
            )

        # 성공적으로 인증된 사용자 데이터 반환
        return {
            "user_id": user_id,
            "email": user_data["email"],
            "preferences": user_data.get("preferences", {})
        }

    except Exception as e:
        # 디버깅용 에러 출력
        print(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login."
        )

@router.post("/journals", status_code=status.HTTP_201_CREATED)
async def save_journal(journal: JournalRequest):
    """
    새로운 일기를 저장합니다. 날짜는 서버 시간으로 자동 저장됩니다.
    """
    try:
        # Firestore에 저장 (서버 타임스탬프 사용)
        doc_ref = db.collection("journals").add({
            "userId": journal.userId,
            "content": journal.content,
            "rating": journal.rating,
            "created_at": firestore.SERVER_TIMESTAMP  # Firestore 서버 시간
        })
        return {"message": "Journal saved successfully", "doc_id": doc_ref[1].id}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save journal")



@router.get("/journals/{user_id}", response_model=List[JournalResponse])
async def get_user_journals(user_id: str):
    """
    특정 유저의 일기 목록을 반환합니다 (작성 순서대로).
    """
    try:
        # Firestore 쿼리: 특정 userId의 문서들을 created_at 기준으로 정렬
        journals_ref = db.collection("journals").where("userId", "==", user_id)
        docs = journals_ref.stream()

        # 결과를 리스트로 변환
        journals = []
        for doc in docs:
            data = doc.to_dict()
            journals.append({
                "userId": data["userId"],
                "content": data["content"],
                "rating": data["rating"],
                "date": data["created_at"].strftime("%Y-%m-%d %H:%M:%S") if data.get("created_at") else "N/A",
                "created_at": data["created_at"].strftime("%Y-%m-%d %H:%M:%S") if data.get("created_at") else "N/A"
            })
        return journals
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch journals")