from fastapi import FastAPI
from app.routes.user_routes import router as user_router
from app.routes.agent_routes import router as agent_router

from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (배포 시 보안을 위해 특정 origin으로 제한 필요)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)
app.include_router(user_router)

app.include_router(agent_router)
