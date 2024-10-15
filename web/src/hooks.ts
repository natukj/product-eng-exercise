import { useQuery, useMutation } from "@tanstack/react-query";
import { Filters, GroupsResponse } from "./types";

export type FeedbackData = Filters[];

export function useFeedbackQuery(filters: Filters) {
  return useQuery<{ data: FeedbackData }>({
    queryFn: async () => {
      const res = await fetch("http://localhost:5001/query", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filters }),
        method: "POST",
      });

      return res.json();
    },
    // The query key is used to cache responses and should represent
    // the parameters of the query.
    queryKey: ["query-data", filters],
  });
}

export function useGroupsQuery(filters: Filters) {
  return useQuery<GroupsResponse>({
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/groups", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filters }),
        method: "POST",
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      return res.json();
    },
    queryKey: ["groups-data", filters],
  });
}

type TagsResponse = {
  tags: string[];
  importance_score_range: {
    min: number;
    max: number;
  };
  customer_impact_range: {
    min: number;
    max: number;
  };
};

export function useTagsQuery() {
  return useQuery<TagsResponse>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5001/tags");
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    },
  });
}

export function useAIQuery() {
  return useMutation<{ filters: Filters }, Error, string>({
    mutationFn: async (aiQuery: string) => {
      const res = await fetch("http://localhost:5001/aifilter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: aiQuery }),
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    },
  });
}