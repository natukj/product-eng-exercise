from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from db import PseudoDB
from llm import openai_client_tool_completion_request
from utils import filter_data_tool
from schemas import Feedback, TaggedClusters, FilterParams
db = PseudoDB()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GroupsRequest(BaseModel):
    filters: Optional[FilterParams] = None

class FeedbackGroup(BaseModel):
    feedback: List[Feedback]

class GroupsResponse(BaseModel):
    data: List[FeedbackGroup]
    tagged_clusters: TaggedClusters

class TagsResponse(BaseModel):
    tags: List[str]
    importance_score_range: Dict[str, float]
    customer_impact_range: Dict[str, int]

class AIQueryRequest(BaseModel):
    query: str

class AIQueryResponse(BaseModel):
    filters: FilterParams

@app.post("/groups", response_model=GroupsResponse)
async def group_feedback(request: GroupsRequest):
    print("Received request:", request)
    if request.filters:
        filtered_feedback = db.filter_feedback(request.filters.model_dump(exclude_unset=True))
    else:
        filtered_feedback = db.get_all_feedback()
    
    groups = [FeedbackGroup(feedback=filtered_feedback)]

    return GroupsResponse(data=groups, tagged_clusters=db.get_tagged_clusters())


@app.get("/tags", response_model=TagsResponse)
async def get_tags_and_ranges():
    all_tags = set()
    importance_scores = []
    customer_impacts = []
    
    for cluster in db.tagged_clusters.root.values():
        all_tags.update(cluster.tags)
        importance_scores.append(cluster.importance_score)
        customer_impacts.append(cluster.customer_impact)

    return TagsResponse(
        tags=sorted(list(all_tags)),
        importance_score_range={
            "min": min(importance_scores),
            "max": max(importance_scores)
        },
        customer_impact_range={
            "min": min(customer_impacts),
            "max": max(customer_impacts)
        }
    )

@app.post("/aifilter", response_model=AIQueryResponse)
async def process_ai_query(request: AIQueryRequest):
    query = request.query
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert at filtering search parameters from user queries. "
                "Given a user query, use the provided tool to filter the data."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Given the user's query: '{query}', filter the data using the provided tool."
            ),
        },
    ]

    try:
        response = await openai_client_tool_completion_request(
        messages, 
        filter_data_tool,
        tool_choice={"type": "function", "function": {"name": "filter_data"}}
        )
        response_message = response.choices[0].message
        
        if response_message.tool_calls and response_message.tool_calls[0].function.name == 'filter_data':
            filter_params = json.loads(response_message.tool_calls[0].function.arguments)

            formatted_filters = FilterParams(**filter_params)
            
            return AIQueryResponse(filters=formatted_filters)
        else:
            raise HTTPException(status_code=400, detail="Unexpected response format from AI")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)