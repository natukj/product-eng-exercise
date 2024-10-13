import React, { useState } from "react";
import { FeedbackDataTable } from "./components/FeedbackDataTable";
import { useFeedbackQuery } from "./hooks";
import { Filters } from "./types";

type FeedbackProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export function Feedback({ filters, setFilters }: FeedbackProps) {
  const { data, isLoading, error } = useFeedbackQuery(filters);
  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>({
    Importance: false,
    Type: false,
    Customer: false,
  });

  const toggleFilter = (columnName: string) => {
    setOpenFilters((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  };

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <FeedbackDataTable
      data={data?.data || []}
      filters={filters}
      setFilters={setFilters}
      openFilters={openFilters}
      toggleFilter={toggleFilter}
    />
  );
}
