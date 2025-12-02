import os
import uuid


def save_upload_to_tmp(upload, tmp_dir: str = ".tmp") -> str:
    os.makedirs(tmp_dir, exist_ok=True)
    ext = os.path.splitext(upload.filename)[1]
    path = os.path.join(tmp_dir, f"{uuid.uuid4().hex}{ext}")
    with open(path, "wb") as f:
        f.write(upload.file.read())
    return path