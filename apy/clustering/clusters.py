from typing import Tuple
import numpy as np
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.metrics import silhouette_score
from sklearn.metrics.pairwise import pairwise_distances
from joblib import Parallel, delayed
from tqdm import tqdm

def calculate_score(n: int, vectors: np.ndarray, method: str) -> Tuple[int, float, np.ndarray]:
    if method == 'kmeans':
        clusterer = KMeans(n_clusters=n, random_state=12)
    else:  # agglomerative
        clusterer = AgglomerativeClustering(n_clusters=n)
    
    labels = clusterer.fit_predict(vectors)
    
    if len(np.unique(labels)) > 1:
        score = silhouette_score(vectors, labels, metric='cosine')
        return n, score, labels
    else:
        return n, -1, labels

def cluster_vectors(vectors: np.ndarray, method: str = 'kmeans', n_clusters: int = None) -> Tuple[np.ndarray, int, np.ndarray]:
    best_score = -1
    best_labels = None

    if n_clusters is None:
        min_clusters = 2
        max_clusters = len(vectors) - 1
        
        results = Parallel(n_jobs=-1)(delayed(calculate_score)(n, vectors, method) 
                                      for n in tqdm(range(min_clusters, max_clusters), desc=f"Calculating silhouette scores for {method}"))
        best_n, best_score, best_labels = max(results, key=lambda x: x[1])
        
        if best_score > -1:
            print(f"Optimal number of clusters for {method}: {best_n}")
            print(f"Best Silhouette Score: {best_score}")
        else:
            print(f"No valid clustering found for {method}")
            return None, 0, None
        
        optimal_clusters = best_n
    else:
        if method == 'kmeans':
            clusterer = KMeans(n_clusters=n_clusters, random_state=12)
        else:  # agglomerative
            clusterer = AgglomerativeClustering(n_clusters=n_clusters)
        
        best_labels = clusterer.fit_predict(vectors)
        optimal_clusters = n_clusters

    if optimal_clusters > 1:
        cluster_centers = np.array([vectors[best_labels == i].mean(axis=0) for i in range(optimal_clusters)])
        cluster_proximities = pairwise_distances(cluster_centers, metric='cosine')
    else:
        cluster_proximities = np.array([[0]])

    return best_labels, optimal_clusters, cluster_proximities

def perform_clustering(name_embeddings: np.ndarray, desc_embeddings: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    methods = ['kmeans', 'agglomerative']
    
    name_results = [cluster_vectors(name_embeddings, method) for method in methods]
    desc_results = [cluster_vectors(desc_embeddings, method) for method in methods]
    
    def get_best_result(embeddings, results):
        best_score = -1
        best_result = None
        best_method = None
        for i, result in enumerate(results):
            if result[0] is not None:
                score = silhouette_score(embeddings, result[0], metric='cosine')
                if score > best_score:
                    best_score = score
                    best_result = result
                    best_method = methods[i]
        return best_result, best_method
    
    name_best, name_best_method = get_best_result(name_embeddings, name_results)
    desc_best, desc_best_method = get_best_result(desc_embeddings, desc_results)
    
    print(f"Best method for names: {name_best_method}")
    print(f"Best method for descriptions: {desc_best_method}")
    
    return name_best[0], desc_best[0]
