import React from "react";
import { DataTable } from "./DataTable";
import { FeedbackData } from "../hooks";
import { Filters } from "../types";
import { AccessorFn, Row } from "@tanstack/react-table";

type FeedbackDataTableProps = {
  data: FeedbackData;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  openFilters: { [key: string]: boolean };
  toggleFilter: (columnName: string) => void;
};

const IMPORTANCE_OPTIONS = ["High", "Medium", "Low"];
const TYPE_OPTIONS = ["Sales", "Customer", "Research"];
const CUSTOMER_OPTIONS = [
  "Loom",
  "Ramp",
  "Brex",
  "Vanta",
  "Notion",
  "Linear",
  "OpenAI",
];

export function FeedbackDataTable({
  data,
  filters,
  setFilters,
  openFilters,
  toggleFilter,
}: FeedbackDataTableProps) {
  const handleImportanceFilterChange = (values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      importance: values as Filters["importance"],
    }));
  };

  const handleTypeFilterChange = (values: string[]) => {
    setFilters((prev) => ({ ...prev, type: values as Filters["type"] }));
  };

  const handleCustomerFilterChange = (values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      customer: values as Filters["customer"],
    }));
  };
  // TODDO: Implement filter by name (search)
  const nameCellRenderer: AccessorFn<FeedbackData[number]> = (row) => (
    <div className="py-3">
      <div className="mb-2 font-semibold">{row.name}</div>
      <div className="text-sm">{row.description}</div>
    </div>
  );

  const importanceCellRenderer: AccessorFn<FeedbackData[number]> = (row) => (
    <div className="py-3">
      <div className="mb-2">{row.importance}</div>
    </div>
  );

  const typeCellRenderer: AccessorFn<FeedbackData[number]> = (row) => (
    <div className="py-3">
      <div className="mb-2">{row.type}</div>
    </div>
  );

  const customerCellRenderer: AccessorFn<FeedbackData[number]> = (row) => (
    <div className="py-3">
      <div className="mb-2">{row.customer}</div>
    </div>
  );
  // TODO: Add date filtering
  const dateCellRenderer: AccessorFn<FeedbackData[number]> = (row) => (
    <div className="py-3">
      <div className="mb-2">
        {row.date ? new Date(row.date).toLocaleDateString() : "N/A"}
      </div>
    </div>
  );

  const schema = [
    {
      cellRenderer: nameCellRenderer,
      headerName: "Name",
    },
    {
      cellRenderer: importanceCellRenderer,
      headerName: "Importance",
      filterType: "multi-select" as const,
      filterOptions: IMPORTANCE_OPTIONS,
      filterValue: filters.importance,
      onFilterChange: handleImportanceFilterChange,
    },
    {
      cellRenderer: typeCellRenderer,
      headerName: "Type",
      filterType: "multi-select" as const,
      filterOptions: TYPE_OPTIONS,
      filterValue: filters.type,
      onFilterChange: handleTypeFilterChange,
    },
    {
      cellRenderer: customerCellRenderer,
      headerName: "Customer",
      filterType: "multi-select" as const,
      filterOptions: CUSTOMER_OPTIONS,
      filterValue: filters.customer,
      onFilterChange: handleCustomerFilterChange,
    },
    {
      cellRenderer: dateCellRenderer,
      headerName: "Date",
      sortingFunction: (
        a: Row<FeedbackData[number]>,
        b: Row<FeedbackData[number]>
      ) =>
        new Date(a.original.date ?? 0).getTime() -
        new Date(b.original.date ?? 0).getTime(),
    },
  ];

  return (
    <DataTable
      fullWidth
      data={data}
      openFilters={openFilters}
      toggleFilter={toggleFilter}
      schema={schema}
    />
  );
}
