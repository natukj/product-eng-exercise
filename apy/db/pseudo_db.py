import json
from datetime import datetime
from typing import List, Dict, Any
from schemas import Feedback, TaggedClusters

class PseudoDB:
    def __init__(self):
        self.feedback_data: List[Feedback] = []
        self.tagged_clusters: TaggedClusters = TaggedClusters(root={})
        self._load_data()

    def _load_data(self):
        with open('db/data.json', 'r') as f:
            feedback_data = json.load(f)
            self.feedback_data = [Feedback(**item) for item in feedback_data]

        with open('db/updated_tagged_clusters.json', 'r') as f:
            self.tagged_clusters = TaggedClusters(root=json.load(f))

    def get_all_feedback(self) -> List[Feedback]:
        return self.feedback_data

    def get_tagged_clusters(self) -> TaggedClusters:
        return self.tagged_clusters

    def filter_feedback(self, filters: Dict[str, Any]) -> List[Feedback]:
        filtered_feedback = self.feedback_data

        if filters.get('name'):
            filtered_feedback = [f for f in filtered_feedback if filters['name'].lower() in f.name.lower()]

        if filters.get('description'):
            filtered_feedback = [f for f in filtered_feedback if filters['description'].lower() in f.description.lower()]

        if filters.get('importance'):
            filtered_feedback = [f for f in filtered_feedback if f.importance in filters['importance']]

        if filters.get('type'):
            filtered_feedback = [f for f in filtered_feedback if f.type in filters['type']]

        if filters.get('customer'):
            filtered_feedback = [f for f in filtered_feedback if f.customer in filters['customer']]

        if filters.get('date'):
            date = datetime.fromisoformat(filters['date'])
            filtered_feedback = [f for f in filtered_feedback if f.date.date() == date.date()]

        if filters.get('importance_score'):
            min_score, max_score = min(filters['importance_score']), max(filters['importance_score'])
            filtered_feedback = [f for f in filtered_feedback if min_score <= self.get_importance_score(f) <= max_score]

        if filters.get('customer_impact'):
            min_impact, max_impact = min(filters['customer_impact']), max(filters['customer_impact'])
            filtered_feedback = [f for f in filtered_feedback if min_impact <= self.get_customer_impact(f) <= max_impact]

        if filters.get('tags'):
            tag_ids = set()
            for cluster in self.tagged_clusters.root.values():
                if any(tag in cluster.tags for tag in filters['tags']):
                    tag_ids.update(cluster.ids)
            filtered_feedback = [f for f in filtered_feedback if str(f.id) in tag_ids]

        return filtered_feedback
    
    def get_importance_score(self, feedback: Feedback) -> float:
        for cluster in self.tagged_clusters.root.values():
            if str(feedback.id) in cluster.ids:
                return cluster.importance_score
        return 0.0

    def get_customer_impact(self, feedback: Feedback) -> int:
        for cluster in self.tagged_clusters.root.values():
            if str(feedback.id) in cluster.ids:
                return cluster.customer_impact
        return 0
