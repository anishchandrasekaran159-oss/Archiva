# routes/files.py
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from services.embedder import embed
from services.storage import (
    upload_file, save_file_record,
    search_files, get_download_url,
    get_file_by_id, get_recommendations,
    delete_file_record, delete_file_from_storage,
    supabase
)
from auth import get_current_user  # 🔐

router = APIRouter()


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    note: str = Form(...),
    subject: str = Form(None),
    user_id: str = Depends(get_current_user),  # 🔐
):
    if len(note.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Note must be at least 20 characters. Be descriptive!"
        )

    file_bytes = await file.read()
    file_size = len(file_bytes)
    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    # Store under user's folder so files are isolated in Storage too
    storage_path = upload_file(file_bytes, unique_filename, user_id=user_id)
    embedding = embed(note, input_type="search_document")

    record = save_file_record(
        filename=file.filename,
        storage_path=storage_path,
        note=note,
        embedding=embedding,
        subject=subject,
        file_size=file_size,
        user_id=user_id,           # 🔐 stored in DB
    )

    return {
        "status": "uploaded",
        "file_id": record["id"],
        "filename": file.filename,
        "indexed": True,
        "message": "File uploaded and indexed. It's now searchable."
    }


@router.get("/search")
async def search(
    q: str,
    limit: int = 5,
    user_id: str = Depends(get_current_user),  # 🔐
):
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    query_embedding = embed(q, input_type="search_query")
    results = search_files(query_embedding, limit=limit, user_id=user_id)  # 🔐

    for result in results:
        result["download_url"] = get_download_url(result["storage_path"])

    return {"query": q, "results": results}


@router.get("/files")
async def list_files(
    subject: str = None,
    user_id: str = Depends(get_current_user),  # 🔐
):
    query = supabase.table("files").select(
        "id, filename, note, subject, file_size_bytes, storage_path, created_at"
    ).eq("user_id", user_id)\
     .order("created_at", desc=True)  # 🔐 only this user's files

    if subject:
        query = query.eq("subject", subject)

    response = query.execute()
    files = response.data

    for file in files:
        file["download_url"] = get_download_url(file["storage_path"])

    return {"files": files}


@router.get("/files/{file_id}")
async def get_file(
    file_id: str,
    user_id: str = Depends(get_current_user),  # 🔐
):
    file = get_file_by_id(file_id, user_id=user_id)  # 🔐 ownership check inside

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    note_embedding = embed(file["note"], input_type="search_document")
    recommendations = get_recommendations(
        file_id, note_embedding, limit=3, user_id=user_id  # 🔐
    )

    file["download_url"] = get_download_url(file["storage_path"])
    for rec in recommendations:
        rec["download_url"] = get_download_url(rec["storage_path"])

    return {"file": file, "recommendations": recommendations}


@router.delete("/files/{file_id}")
async def delete_file(
    file_id: str,
    user_id: str = Depends(get_current_user),  # 🔐
):
    file = get_file_by_id(file_id, user_id=user_id)  # 🔐 ownership check inside

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    delete_file_from_storage(file["storage_path"])
    delete_file_record(file_id)

    return {"status": "deleted", "file_id": file_id, "filename": file["filename"]}