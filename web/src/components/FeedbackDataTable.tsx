import React from "react";
import { DataTable } from "./DataTable";
import { FeedbackData } from "../hooks";
import { Filters } from "../types";

type FeedbackDataTableProps = {
  data: FeedbackData;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  openFilters: { [key: string]: boolean };
  toggleFilter: (columnName: string) => void;
};

export function FeedbackDataTable({
  data,
  filters,
  setFilters,
  openFilters,
  toggleFilter,
}: FeedbackDataTableProps) {
  return (
    <DataTable
      fullWidth
      data={data}
      openFilters={openFilters}
      toggleFilter={toggleFilter}
      schema={[
        {
          cellRenderer: (row) => (
            <div className="py-3">
              <div className="mb-2 font-semibold">{row.name}</div>
              <div className="text-sm">{row.description}</div>
            </div>
          ),
          headerName: "Name",
        },
        {
          cellRenderer: (row) => (
            <div className="py-3">
              <div className="mb-2">{row.importance}</div>
            </div>
          ),
          headerName: "Importance",
          filterType: "multi-select",
          filterOptions: ["High", "Medium", "Low"],
          filterValue: filters.importance,
          onFilterChange: (values: string[]) => {
            setFilters((prev) => ({
              ...prev,
              importance: values as ("High" | "Medium" | "Low")[],
            }));
          },
        },
        {
          cellRenderer: (row) => (
            <div className="py-3">
              <div className="mb-2">{row.type}</div>
            </div>
          ),
          headerName: "Type",
          filterType: "multi-select",
          filterOptions: ["Sales", "Customer", "Research"],
          filterValue: filters.type,
          onFilterChange: (values: string[]) => {
            setFilters((prev) => ({
              ...prev,
              type: values as ("Sales" | "Customer" | "Research")[],
            }));
          },
        },
        {
          cellRenderer: (row) => (
            <div className="py-3">
              <div className="mb-2">{row.customer}</div>
            </div>
          ),
          headerName: "Customer",
          filterType: "multi-select",
          filterOptions: [
            "Loom",
            "Ramp",
            "Brex",
            "Vanta",
            "Notion",
            "Linear",
            "OpenAI",
          ],
          filterValue: filters.customer,
          onFilterChange: (values: string[]) => {
            setFilters((prev) => ({
              ...prev,
              customer: values as (
                | "Loom"
                | "Ramp"
                | "Brex"
                | "Vanta"
                | "Notion"
                | "Linear"
                | "OpenAI"
              )[],
            }));
          },
        },
        {
          cellRenderer: (row) => (
            <div className="py-3">
              <div className="mb-2">
                {new Date(row.date).toLocaleDateString()}
              </div>
            </div>
          ),
          headerName: "Date",
        },
      ]}
    />
  );
}
