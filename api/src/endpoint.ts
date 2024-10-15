import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import json from "./data.json";

type Filters = {
  name?: string;
  description?: string;
  importance?: Array<"High" | "Medium" | "Low">;
  type?: Array<"Sales" | "Customer" | "Research">;
  customer?: Array<
    "Loom" | "Ramp" | "Brex" | "Vanta" | "Notion" | "Linear" | "OpenAI"
  >;
  date?: string | null;
  tags?: string[];
  importance_score?: number[];
  customer_impact?: number[];
};

type Feedback = {
  id: number;
  name: string;
  description: string;
  importance: "High" | "Medium" | "Low";
  type: "Sales" | "Customer" | "Research";
  customer: "Loom" | "Ramp" | "Brex" | "Vanta" | "Notion" | "Linear" | "OpenAI";
  date: string;
};

type FeedbackData = Feedback[];

type FeedbackGroup = {
  feedback: Feedback[];
};

type Tag = {
  ids: string[];
  tags: string[];
  importance_score: number;
  customer_impact: number;
};

type TaggedClusters = {
  [key: string]: Tag;
};

export const router = express.Router();
router.use(bodyParser.json());

router.post("/query", queryHandler);
router.post("/groups", groupHandler);
router.get("/tags", tagsHandler);
router.post("/aifilter", aiFilterHandler);

const feedback: FeedbackData = json as any;


function queryHandler(req: Request, res: Response<{ data: FeedbackData }>) {
  const { filters } = req.body as { filters: Filters };

  let filteredData = feedback;

  // TODO filter by name (search)

  if (filters.importance && filters.importance.length > 0) {
    filteredData = filteredData.filter((item) =>
      filters.importance!.includes(item.importance)
    );
  }

  if (filters.type && filters.type.length > 0) {
    filteredData = filteredData.filter((item) =>
      filters.type!.includes(item.type)
    );
  }

  if (filters.customer && filters.customer.length > 0) {
    filteredData = filteredData.filter((item) =>
      filters.customer!.includes(item.customer)
    );
  }

  // TODO filter by date

  res.status(200).json({ data: filteredData });
}

async function groupHandler(
  req: Request,
  res: Response<{ data: FeedbackGroup[]; tagged_clusters: TaggedClusters } | { error: string }>
) {
  const { filters } = req.body as { filters: Filters };

  let filteredFeedback = feedback;

  if (filters) {
    if (filters.importance && filters.importance.length > 0) {
      filteredFeedback = filteredFeedback.filter((item) =>
        filters.importance!.includes(item.importance)
      );
    }

    if (filters.type && filters.type.length > 0) {
      filteredFeedback = filteredFeedback.filter((item) =>
        filters.type!.includes(item.type)
      );
    }

    if (filters.customer && filters.customer.length > 0) {
      filteredFeedback = filteredFeedback.filter((item) =>
        filters.customer!.includes(item.customer)
      );
    }

    if (filters.date) {
      filteredFeedback = filteredFeedback.filter(
        (item) => item.date === filters.date
      );
    }
  }

  const pythonRes = await fetch("http://127.0.0.1:8000/groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ feedback: filteredFeedback }),
  });

  if (!pythonRes.ok) {
    return res.status(500).json({ error: "Python backend error" });
  }

  const pythonData = await pythonRes.json();

  res.status(200).json(pythonData as { data: FeedbackGroup[]; tagged_clusters: TaggedClusters });
}


async function tagsHandler(req: Request, res: Response) {
  const pythonRes = await fetch("http://127.0.0.1:8000/tags", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!pythonRes.ok) {
    return res.status(500).json({ error: "Python backend error" });
  }

  const pythonData = await pythonRes.json();

  res.status(200).json(pythonData);
}

async function aiFilterHandler(req: Request, res: Response) {
  const { query } = req.body as { query: string };

  const pythonRes = await fetch("http://127.0.0.1:8000/aifilter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!pythonRes.ok) {
    return res.status(500).json({ error: "Python backend error" });
  }

  const pythonData = await pythonRes.json();

  res.status(200).json(pythonData);
}

