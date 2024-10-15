from typing import Dict, Any, List, Set
from schemas import TaggedClusters
from db import PseudoDB

pseudo_db = PseudoDB()

def get_all_tags(tagged_clusters: TaggedClusters) -> List[str]:
    all_tags: Set[str] = set()
    for cluster in tagged_clusters.root.values():
        all_tags.update(cluster.tags)
    return list(all_tags)

def create_filter_data_tool(pseudo_db: PseudoDB) -> Dict[str, Any]:
    tagged_clusters: TaggedClusters = pseudo_db.get_tagged_clusters()
    all_tags: List[str] = get_all_tags(tagged_clusters)
    
    return [
        {
        "type": "function",
        "function": {
            "name": "filter_data",
            "description": "Filter feedback data based on various criteria.",
            "parameters": {
                "type": "object",
                "properties": {
                    "importance": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": ["High", "Medium", "Low"]
                        },
                        "description": "Filter by importance level."
                    },
                    "type": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": ["Sales", "Customer", "Research"]
                        },
                        "description": "Filter by feedback type."
                    },
                    "customer": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": ["Loom", "Ramp", "Brex", "Vanta", "Notion", "Linear", "OpenAI"]
                        },
                        "description": "Filter by customer name."
                    },
                    "date": {
                        "type": "string",
                        "format": "date",
                        "description": "Filter by specific date (ISO format: YYYY-MM-DD)."
                    },
                    "importance_score": {
                        "type": "array",
                        "items": {
                            "type": "number",
                            "minimum": 0,
                            "maximum": 3
                        },
                        "minItems": 2,
                        "maxItems": 2,
                        "description": "Filter by importance score range [min, max]."
                    },
                    "customer_impact": {
                        "type": "array",
                        "items": {
                            "type": "integer",
                            "minimum": 0,
                            "maximum": 3
                        },
                        "minItems": 2,
                        "maxItems": 2,
                        "description": "Filter by customer impact range [min, max]."
                    },
                    "tags": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": all_tags
                        },
                        "description": "Filter by tags associated with the feedback."
                    }
                },
                "additionalProperties": False
            }
        }
    }
    ]

filter_data_tool = create_filter_data_tool(pseudo_db)