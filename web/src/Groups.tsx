import React from "react";
import { GroupsDataTable } from "./components/GroupsDataTable";
import { useGroupsQuery } from "./hooks";
import { Filters } from "./types";
import { FiX } from "react-icons/fi";

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  openFilters: { [key: string]: boolean };
  toggleFilter: (columnName: string) => void;
};

export function Groups({
  filters,
  setFilters,
  openFilters,
  toggleFilter,
}: Props) {
  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    error: groupsError,
  } = useGroupsQuery(filters);

  if (isGroupsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (groupsError) {
    return <div>Error: {(groupsError as Error).message}</div>;
  }

  if (!groupsData) {
    return <div>No data available</div>;
  }

  const removeTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }));
  };

  const resetImportanceScore = () => {
    setFilters((prev) => ({ ...prev, importance_score: undefined }));
  };

  const resetCustomerImpact = () => {
    setFilters((prev) => ({ ...prev, customer_impact: undefined }));
  };

  const activeFilters = [
    ...(filters.tags?.map((tag) => ({
      type: "Tag",
      value: tag,
      onRemove: () => removeTag(tag),
    })) || []),
    ...(filters.importance_score && filters.importance_score.length === 2
      ? [
          {
            type: "Importance Score",
            value: `${filters.importance_score[0].toFixed(
              1
            )} - ${filters.importance_score[1].toFixed(1)}`,
            onRemove: resetImportanceScore,
          },
        ]
      : []),
    ...(filters.customer_impact && filters.customer_impact.length === 2
      ? [
          {
            type: "Customer Impact",
            value: `${filters.customer_impact[0]} - ${filters.customer_impact[1]}`,
            onRemove: resetCustomerImpact,
          },
        ]
      : []),
  ];

  return (
    <div>
      {activeFilters.length > 0 && (
        <div className="bg-gray-100 p-4 mb-4 rounded-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Advanced Filters:
            </span>
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-white border border-gray-300 px-3 py-0.5 text-sm font-medium text-gray-700"
              >
                {filter.type}: {filter.value}
                <button
                  type="button"
                  className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                  onClick={filter.onRemove}
                  aria-label={`Remove filter for ${filter.value}`}
                >
                  <FiX className="h-2 w-2" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <GroupsDataTable
        data={groupsData.data}
        filters={filters}
        setFilters={setFilters}
        openFilters={openFilters}
        toggleFilter={toggleFilter}
      />
    </div>
  );
}
