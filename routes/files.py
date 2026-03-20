import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.embedder import embed
from services.storage import (
    upload_file, save_file_record,
    search_files, get_download_url,
    get_file_by_id, get_recommendations,
    delete_file_record, delete_file_from_storage,
    supabase
)

router = APIRouter()


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    note: str = Form(...),
    subject: str = Form(None)
):
    """
    Upload a file + note.
    Flow: receive file → store in Supabase → embed the note → save everything
    """
    if len(note.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Note must be at least 20 characters. Be descriptive!"
        )

    file_bytes = await file.read()
    file_size = len(file_bytes)
    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    storage_path = upload_file(file_bytes, unique_filename)
    embedding = embed(note, input_type="search_document")

    record = save_file_record(
        filename=file.filename,
        storage_path=storage_path,
        note=note,
        embedding=embedding,
        subject=subject,
        file_size=file_size
    )

    return {
        "status": "uploaded",
        "file_id": record["id"],
        "filename": file.filename,
        "indexed": True,
        "message": "File uploaded and indexed. It's now searchable."
    }


@router.get("/search")
async def search(q: str, limit: int = 5):
    """
    Semantic search — find files by meaning, not keywords.
    Flow: embed query → cosine similarity against stored note vectors → return top N
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    query_embedding = embed(q, input_type="search_query")
    results = search_files(query_embedding, limit=limit)

    for result in results:
        result["download_url"] = get_download_url(result["storage_path"])

    return {"query": q, "results": results}


@router.get("/files")
async def list_files(subject: str = None):
    """List all uploaded files, optionally filtered by subject."""
    query = supabase.table("files").select(
        "id, filename, note, subject, file_size_bytes, storage_path, created_at"
    ).order("created_at", desc=True)

    if subject:
        query = query.eq("subject", subject)

    response = query.execute()
    files = response.data

    # Generate signed download URL for each file — same as search endpoint
    for file in files:
        file["download_url"] = get_download_url(file["storage_path"])

    return {"files": files}


@router.get("/files/{file_id}")
async def get_file(file_id: str):
    """
    Get a single file's details + recommendations.
    The recommendations are the core discovery feature —
    'you might also need' based on vector similarity of notes.
    """
    file = get_file_by_id(file_id)

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Re-embed the note to find similar files
    # We embed fresh instead of storing/fetching the vector because
    # Supabase doesn't return vector columns in standard selects
    note_embedding = embed(file["note"], input_type="search_document")
    recommendations = get_recommendations(file_id, note_embedding, limit=3)

    # Add download URLs
    file["download_url"] = get_download_url(file["storage_path"])
    for rec in recommendations:
        rec["download_url"] = get_download_url(rec["storage_path"])

    return {
        "file": file,
        "recommendations": recommendations
    }


@router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    """
    Delete a file — removes from both Storage and DB.
    Order matters: delete from storage first, then DB.
    If DB delete fails, the file is orphaned in storage (not ideal but recoverable).
    If storage delete fails, the DB record still exists (also recoverable).
    """
    # Get the file first so we have the storage path
    file = get_file_by_id(file_id)

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Delete from Supabase Storage
    delete_file_from_storage(file["storage_path"])

    # Delete from DB
    delete_file_record(file_id)

    return {"status": "deleted", "file_id": file_id, "filename": file["filename"]}