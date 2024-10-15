export type Filters = {
    name?: string;
    description?: string;
    importance?: Array<Feedback["importance"]>;
    type?: Array<Feedback["type"]>;
    customer?: Array<Feedback["customer"]>;
    date?: string | null;
    tags?: string[];
    importance_score?: number[];
    customer_impact?: number[];
  };

  export type Feedback = {
    id: number;
    name: string;
    description: string;
    importance: "High" | "Medium" | "Low";
    type: "Sales" | "Customer" | "Research";
    customer: "Loom" | "Ramp" | "Brex" | "Vanta" | "Notion" | "Linear" | "OpenAI";
    date: string;
  };
  
  
  export type Tag = {
    ids: string[];
    tags: string[];
    importance_score: number;
    customer_impact: number;
  };
  
  export type TaggedClusters = {
    [key: string]: Tag;
  };
  
  export type FeedbackGroup = {
    feedback: Filters[];
  };
  
  export type GroupsResponse = {
    data: FeedbackGroup[];
    tagged_clusters: TaggedClusters;
  };