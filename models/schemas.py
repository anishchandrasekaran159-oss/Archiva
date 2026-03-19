from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FileUploadResponse(BaseModel):
    id: str
    filename: str
    note: str
    subject: Optional[str]
    created_at: datetime

class FileSearchResult(BaseModel):
    id: str
    filename: str
    note: str
    subject: Optional[str]
    storage_path: str
    created_at: datetime
    similarity: float  # how close the result is to the query (0-1)