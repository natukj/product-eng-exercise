import json
import asyncio
from typing import List, Dict, Any, Tuple
from collections import defaultdict
import numpy as np
from clustering.clusters import perform_clustering
import llm
from schemas import Feedback
import prompts

importance_map = {"Low": 1, "Medium": 2, "High": 3}

def load_json(file_path: str) -> Any:
    with open(file_path, 'r') as f:
        return json.load(f)

def save_json(data: Any, file_path: str) -> None:
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

def calculate_importance_score(feedback_list: List[Dict[str, Any]]) -> float:
    """averaging the importance values of all feedback items in that cluster"""
    total_importance = sum(importance_map.get(feedback['importance'], 1) for feedback in feedback_list)
    return total_importance / len(feedback_list)

def calculate_customer_impact(feedback_list: List[Dict[str, Any]]) -> int:
    """how many distinct customers are affected by the feedback in that cluster"""
    unique_customers = {feedback['customer'] for feedback in feedback_list}
    return len(unique_customers)

def update_tagged_clusters(data: List[Dict[str, Any]], tagged_clusters: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    for cluster_data in tagged_clusters.values():
        feedback_items = [item for item in data if str(item['id']) in cluster_data['ids']]
        cluster_data['importance_score'] = calculate_importance_score(feedback_items)
        cluster_data['customer_impact'] = calculate_customer_impact(feedback_items)
    return tagged_clusters

async def get_embeddings(texts: List[str]) -> np.ndarray:
    tasks = [llm.openai_client_embedding_request(text) for text in texts]
    embeddings = await asyncio.gather(*tasks)
    return np.array(embeddings)

async def process_embeddings(feedback_data: List[Feedback]) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    names = [item.name for item in feedback_data]
    descriptions = [item.description for item in feedback_data]
    
    name_embeddings, desc_embeddings = await asyncio.gather(
        get_embeddings(names),
        get_embeddings(descriptions)
    )
    
    name_labels, desc_labels = perform_clustering(name_embeddings, desc_embeddings)
    
    return name_embeddings, desc_embeddings, name_labels, desc_labels

async def tag_cluster(description_cluster: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
    tickets = "\n".join([f"Name: {item['name']}\nDescription: {item['description']}" for item in items])
    messages = [
        {"role": "system", "content": prompts.tag_feedback_sys},
        {"role": "user", "content": prompts.tag_feedback_user.format(tickets=tickets)}
    ]
    
    response = await llm.openai_client_chat_completion_request(messages, model="gpt-4o-2024-08-06")
    tags = json.loads(response.choices[0].message.content)['tags']
    
    return {
        'description_cluster': description_cluster,
        'ids': [item['id'] for item in items],
        'tags': tags
    }

async def label_clusters(data: List[Dict[str, Any]], cluster_data: Dict[str, Dict[str, str]]) -> Dict[str, Dict[str, Any]]:
    clusters = defaultdict(list)
    for item in data:
        item_id = str(item['id'])
        if item_id in cluster_data:
            description_cluster = cluster_data[item_id]['description_cluster']
            clusters[description_cluster].append({
                'id': item_id,
                'name': item['name'],
                'description': item['description']
            })

    tasks = [tag_cluster(description_cluster, items) for description_cluster, items in clusters.items()]
    tagged_clusters_list = await asyncio.gather(*tasks)

    tagged_clusters = {item['description_cluster']: {'ids': item['ids'], 'tags': item['tags']} for item in tagged_clusters_list}
    return tagged_clusters