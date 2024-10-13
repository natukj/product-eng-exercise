export type Filters = {
    name: string;
    importance: ("High" | "Medium" | "Low")[];
    type: ("Sales" | "Customer" | "Research")[];
    customer: (
      | "Loom"
      | "Ramp"
      | "Brex"
      | "Vanta"
      | "Notion"
      | "Linear"
      | "OpenAI"
    )[];
    date: string | null;
  };