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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

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
