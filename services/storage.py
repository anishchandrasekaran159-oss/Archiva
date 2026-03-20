# services/storage.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)


def upload_file(file_bytes: bytes, filename: str, user_id: str) -> str:
    """
    Upload file to Supabase Storage under the user's own folder.
    Path: uploads/{user_id}/{filename} — keeps each user's files isolated.
    """
    storage_path = f"uploads/{user_id}/{filename}"
    supabase.storage.from_("archiva-files").upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": "application/octet-stream"}
    )
    return storage_path


def get_download_url(storage_path: str) -> str:
    """Generate a temporary signed URL (valid 1 hour)."""
    response = supabase.storage.from_("archiva-files").create_signed_url(
        storage_path, 3600
    )
    return response["signedURL"]


def save_file_record(
    filename: str,
    storage_path: str,
    note: str,
    embedding: list[float],
    subject: str | None,
    file_size: int,
    user_id: str,              # 🔐 new param
) -> dict:
    """Save file metadata + embedding to the files table, scoped to user."""
    response = supabase.table("files").insert({
        "filename": filename,
        "storage_path": storage_path,
        "note": note,
        "note_embedding": embedding,
        "subject": subject,
        "file_size_bytes": file_size,
        "user_id": user_id,    # 🔐
    }).execute()
    return response.data[0]


def search_files(
    query_embedding: list[float],
    limit: int = 5,
    user_id: str = None,       # 🔐 new param
) -> list[dict]:
    """
    Semantic search scoped to this user's files.
    Calls the updated match_files RPC that accepts filter_user_id.
    """
    response = supabase.rpc(
        "match_files",
        {
            "query_embedding": query_embedding,
            "match_count": limit,
            "filter_user_id": user_id,   # 🔐
        }
    ).execute()
    return response.data


def get_file_by_id(file_id: str, user_id: str = None) -> dict | None:
    """
    Fetch a single file by ID.
    Scoped by user_id so teachers can't fish each other's files by guessing UUIDs.
    """
    query = supabase.table("files").select(
        "id, filename, note, subject, storage_path, file_size_bytes, created_at"
    ).eq("id", file_id)

    if user_id:
        query = query.eq("user_id", user_id)  # 🔐

    response = query.single().execute()
    return response.data


def get_recommendations(
    file_id: str,
    embedding: list[float],
    limit: int = 3,
    user_id: str = None,       # 🔐 new param
) -> list[dict]:
    """Find similar files — scoped to this user's library only."""
    response = supabase.rpc(
        "match_files",
        {
            "query_embedding": embedding,
            "match_count": limit + 1,
            "filter_user_id": user_id,   # 🔐
        }
    ).execute()

    return [r for r in response.data if r["id"] != file_id][:limit]


def delete_file_record(file_id: str) -> dict | None:
    """Delete a file record from DB."""
    response = supabase.table("files").delete().eq("id", file_id).execute()
    return response.data[0] if response.data else None


def delete_file_from_storage(storage_path: str):
    """Delete file from Supabase Storage bucket."""
    supabase.storage.from_("archiva-files").remove([storage_path])