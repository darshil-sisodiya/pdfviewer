from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    name: str