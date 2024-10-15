# Clarity product-eng-exercise qxd

# Setup

## Node + Web app

Ensure that `node` is installed on your system (`node -v`) and that `npm` is up to date (`npm install -g npm@latest` on macOS)

- Fork this repository and clone it onto your machine
- Run `npm i` from the repository root to install dependencies
- Run `npm run dev` from the repository root to start up the client + server
- Save your changes to hot-reload the client or server

### Part 1: Filtering (Notes)

- The functionality in Part 1 is mirrored in Part 2.

## Python server (`apy`)

1. Navigate to the `apy` directory:

```
cd apy
```

2. Follow instructions found in `apy/README.md`.

### Part 2: Grouping (Notes)

- Feedback is grouped using agglomerative clustering, based on the feedback descriptions
- Each cluster is given to an LLM to apply **tags**
- Additional filter metrics are added
  - Importance score (avg importance over the cluster)
  - Customer impact (number of unique customers in a cluster)
- Bonus (relatively untested): ask AI to filter for you!
- Type `clear` in the command palette to clear all filters

---

That's it!
