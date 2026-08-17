from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: EmailStr
    password: str
    preferences: dict = {}  # 유저의 취향 정보를 저장하는 필드
