import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Service key bypasses row-level security — use only on backend, never expose
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def upload_file(file_bytes: bytes, filename: str) -> str:
    """
    Upload file to Supabase Storage bucket.
    Returns the storage path (used to generate download URLs later).
    """
    storage_path = f"uploads/{filename}"
    supabase.storage.from_("archiva-files").upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": "application/octet-stream"}
    )
    return storage_path

def get_download_url(storage_path: str) -> str:
    """Generate a temporary signed URL (valid 1 hour) for downloading a file."""
    response = supabase.storage.from_("archiva-files").create_signed_url(
        storage_path, 3600  # 3600 seconds = 1 hour
    )
    return response["signedURL"]

def save_file_record(
    filename: str,
    storage_path: str,
    note: str,
    embedding: list[float],
    subject: str | None,
    file_size: int
) -> dict:
    """Save file metadata + embedding to the files table."""
    response = supabase.table("files").insert({
        "filename": filename,
        "storage_path": storage_path,
        "note": note,
        "note_embedding": embedding,  # pgvector accepts a plain list
        "subject": subject,
        "file_size_bytes": file_size
    }).execute()
    return response.data[0]

def search_files(query_embedding: list[float], limit: int = 5) -> list[dict]:
    """
    Run cosine similarity search against stored note embeddings.
    Returns top N files ranked by how similar their note is to the query.
    
    The mental model: we're asking "which notes are closest in meaning
    to what the teacher typed?" — not keyword matching, meaning matching.
    """
    response = supabase.rpc(
        "match_files",  # we'll create this SQL function next
        {
            "query_embedding": query_embedding,
            "match_count": limit
        }
    ).execute()
    return response.data
def get_file_by_id(file_id: str) -> dict | None:
    """Fetch a single file record by ID."""
    response = supabase.table("files").select(
        "id, filename, note, subject, storage_path, file_size_bytes, created_at"
    ).eq("id", file_id).single().execute()
    return response.data

def get_recommendations(file_id: str, embedding: list[float], limit: int = 3) -> list[dict]:
    """
    Find files most similar to this one — based on note embedding similarity.
    Same vector search as regular search, but excludes the file itself.
    """
    response = supabase.rpc(
        "match_files",
        {
            "query_embedding": embedding,
            "match_count": limit + 1  # fetch one extra to account for self-match
        }
    ).execute()

    # Filter out the file itself from recommendations
    return [r for r in response.data if r["id"] != file_id][:limit]

def delete_file_record(file_id: str) -> dict | None:
    """Delete a file record from DB. Returns deleted record."""
    response = supabase.table("files").delete().eq("id", file_id).execute()
    return response.data[0] if response.data else None

def delete_file_from_storage(storage_path: str):
    """Delete file from Supabase Storage bucket."""
    supabase.storage.from_("archiva-files").remove([storage_path])