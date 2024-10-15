import asyncio
import utils
from schemas import Feedback

async def main():
    data = utils.load_json('db/data.json')

    feedback_data = [Feedback(**item) for item in data]

    _, _, name_labels, desc_labels = await utils.process_embeddings(feedback_data)

    cluster_data = {
        str(item['id']): {
            'name_cluster': str(name_labels[i]),
            'description_cluster': str(desc_labels[i])
        }
        for i, item in enumerate(data)
    }

    tagged_clusters = await utils.label_clusters(data, cluster_data)

    updated_tagged_clusters = utils.update_tagged_clusters(data, tagged_clusters)

    utils.save_json(updated_tagged_clusters, 'db/updated_tagged_clusters.json')

    print("Clustering and tagging complete! Results saved to db/updated_tagged_clusters.json")

if __name__ == "__main__":
    asyncio.run(main())
