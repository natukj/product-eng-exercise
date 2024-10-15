# Clarity product-eng-exercise (backend)

## Installation

1. Install Poetry (if not already installed):

```
brew install poetry
```

2. Install dependencies:

```
poetry install
```

## Configuration

Set your OpenAI API key as an environment variable. You can do this in two ways:

1. Set it for your current shell session:

```
export OPENAI_API_KEY='<OPENAI_API_KEY>'
```

2. Or, create a `.env` file in the project root with the following content:

```
OPENAI_API_KEY=<OPENAI_API_KEY>
```

Poetry will automatically load environment variables from the `.env` file when running scripts.

## Usage

### Running the Clustering Script

To run the clustering process on the feedback data and generate tagged clusters:

1. Run the `run_cluster.py` script (requires `db/data.json`):

```
poetry run python run_cluster.py
```

This will process the feedback data from `db/data.json`, perform clustering, and save the output to `db/updated_tagged_clusters.json`.

### Running the FastAPI Backend

To start the backend API run the FastAPI app with:

```
poetry run python app.py
```

## API Endpoints

### POST /groups

Retrieve feedback data grouped by clusters based on filtering criteria.

### GET /tags

Retrieve all cluster tags and the range of importance scores and customer impacts.

### POST /aifilter

Use an AI-powered assistant to generate filter parameters from a natural language query.

---

That's it!
