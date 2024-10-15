from pydantic import BaseModel, RootModel
from typing import Dict, List, Optional
from datetime import datetime

class Feedback(BaseModel):
    id: int
    name: str
    description: str
    importance: str
    type: str
    customer: str
    date: datetime

class Tag(BaseModel):
    ids: List[str]
    tags: List[str]
    importance_score: float
    customer_impact: int

class TaggedClusters(RootModel):
    root: Dict[str, Tag]

class FeedbackResponse(BaseModel):
    feedback: List[Feedback]
    tagged_clusters: TaggedClusters

class FilterParams(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    importance: Optional[List[str]] = None
    type: Optional[List[str]] = None
    customer: Optional[List[str]] = None
    date: Optional[str] = None
    tags: Optional[List[str]] = None
    importance_score: Optional[List[float]] = None
    customer_impact: Optional[List[int]] = None
