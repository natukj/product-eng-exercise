import React, { useEffect, useRef } from "react";
import {
  AccessorFn,
  Row,
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import cx from "classnames";
import {
  IoFilterOutline,
  IoCaretUpOutline,
  IoCaretDownOutline,
} from "react-icons/io5";

type Props<RowType> = {
  className?: string;
  data: RowType[];
  schema: {
    cellRenderer: AccessorFn<RowType>;
    headerName: string;
    sortingFunction?: (rowA: Row<RowType>, rowB: Row<RowType>) => number;
    filterType?: "multi-select";
    filterOptions?: string[];
    filterValue?: string[];
    onFilterChange?: (value: string[]) => void;
  }[];
  fullWidth?: boolean;
  onRowClick?: (row: RowType) => void;
  initialSortState?: SortingState;
  openFilters: { [key: string]: boolean };
  toggleFilter: (columnName: string) => void;
};

export function DataTable<RowType>({
  className,
  data,
  schema,
  fullWidth,
  onRowClick,
  initialSortState,
  openFilters,
  toggleFilter,
}: Props<RowType>) {
  const [sorting, setSorting] = React.useState<SortingState>(
    initialSortState || []
  );
  const filterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(openFilters).forEach(([columnName, isOpen]) => {
        if (
          isOpen &&
          !filterRefs.current[columnName]?.contains(event.target as Node)
        ) {
          toggleFilter(columnName);
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openFilters, toggleFilter]);

  const columnHelper = createColumnHelper<RowType>();

  const columns = schema.map((columnSchema) =>
    columnHelper.accessor((row: any) => row, {
      id: columnSchema.headerName,
      header: columnSchema.headerName,
      cell: (info) =>
        columnSchema.cellRenderer(info.row.original, info.row.index),
      sortingFn: columnSchema.sortingFunction,
      enableSorting: !!columnSchema.sortingFunction,
    })
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const activeFilters = schema
    .flatMap((s) =>
      (s.filterValue || []).map((value) => ({
        column: s.headerName,
        value,
        onRemove: () => {
          s.onFilterChange?.(s.filterValue?.filter((v) => v !== value) || []);
        },
      }))
    )
    .filter((f) => f.value);

  return (
    <div className="hide-scroll-bar h-full overflow-hidden overflow-y-auto rounded-lg border bg-white">
      <table className={cx({ "w-full": fullWidth }, className, "bg-white")}>
        <thead className="border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnSchema = schema.find(
                  (s) => s.headerName === header.id
                );
                return (
                  <th
                    key={header.id}
                    className="bg-white sticky border-b px-6 text-left font-semibold hover:cursor-pointer"
                    style={{ height: 64, top: 0 }}
                  >
                    <div className="flex items-center justify-between whitespace-nowrap">
                      <div
                        className="flex items-center"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="ml-2">
                          {header.column.getIsSorted() === "desc" && (
                            <IoCaretDownOutline />
                          )}
                          {header.column.getIsSorted() === "asc" && (
                            <IoCaretUpOutline />
                          )}
                        </span>
                      </div>
                      {columnSchema?.filterType === "multi-select" && (
                        <div
                          ref={(el) =>
                            (filterRefs.current[columnSchema.headerName] = el)
                          }
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFilter(columnSchema.headerName);
                            }}
                            className="ml-2 p-1 hover:bg-gray-100 rounded"
                          >
                            <IoFilterOutline className="h-5 w-5 text-gray-400" />
                          </button>
                          {openFilters[columnSchema.headerName] && (
                            <div className="absolute z-10 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                              <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="options-menu"
                              >
                                {columnSchema.filterOptions?.map((option) => (
                                  <label
                                    key={option}
                                    className="flex items-center px-4 py-2 text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      checked={columnSchema.filterValue?.includes(
                                        option
                                      )}
                                      onChange={(e) => {
                                        const newValues = e.target.checked
                                          ? [
                                              ...(columnSchema.filterValue ||
                                                []),
                                              option,
                                            ]
                                          : (
                                              columnSchema.filterValue || []
                                            ).filter((v) => v !== option);
                                        columnSchema.onFilterChange?.(
                                          newValues
                                        );
                                      }}
                                    />
                                    {option}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {activeFilters.length > 0 && (
            <tr className="bg-gray-50">
              <td colSpan={table.getAllColumns().length} className="px-6 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Filters:
                  </span>
                  {activeFilters.map((filter, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800"
                    >
                      {filter.column}: {filter.value}
                      <button
                        type="button"
                        className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                        onClick={filter.onRemove}
                        aria-label={`Remove filter for ${filter.value}`}
                      >
                        <svg
                          className="h-2 w-2"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 8 8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeWidth="1.5"
                            d="M1 1l6 6m0-6L1 7"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          )}
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:cursor-default hover:bg-gray-100"
              onClick={() => onRowClick?.(row.original)}
              style={{ height: 64 }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-b px-6"
                  style={{ height: 64 }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
