from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.files import router as files_router

app = FastAPI(
    title="Archiva API",
    description="Semantic resource manager for teachers",
    version="0.1.0"
)

# Allow frontend (React) to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this in production
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(files_router, tags=["files"])

@app.get("/")
def root():
    return {"status": "Archiva is running"}