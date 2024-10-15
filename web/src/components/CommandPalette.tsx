import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import {
  FiSearch,
  FiTag,
  FiBarChart2,
  FiUsers,
  FiXCircle,
  FiCpu,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { Filters } from "../types";
import { Range } from "react-range";
import { useAIQuery } from "../hooks";

type CommandPaletteProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  tagsData: {
    tags: string[];
    importance_score_range: { min: number; max: number };
    customer_impact_range: { min: number; max: number };
  };
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  initialFiltersState: Filters;
};

type QuickAction = {
  name: string;
  icon: IconType;
  shortcut: string;
  action: string;
};

const quickActions: QuickAction[] = [
  {
    name: "Set importance score...",
    icon: FiBarChart2,
    shortcut: "I",
    action: "importance",
  },
  {
    name: "Set customer impact...",
    icon: FiUsers,
    shortcut: "C",
    action: "impact",
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  setIsOpen,
  tagsData,
  setFilters,
  initialFiltersState,
}) => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"default" | "importance" | "impact">(
    "default"
  );
  const [importanceScore, setImportanceScore] = useState<number[]>([
    tagsData.importance_score_range.min,
    tagsData.importance_score_range.max,
  ]);
  const [customerImpact, setCustomerImpact] = useState<number[]>([
    tagsData.customer_impact_range.min,
    tagsData.customer_impact_range.max,
  ]);

  const aiQueryMutation = useAIQuery();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      } else if (isOpen && e.metaKey) {
        const action = quickActions.find(
          (a) => a.shortcut.toLowerCase() === e.key.toLowerCase()
        );
        if (action) {
          e.preventDefault();
          handleQuickAction(action.action);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const filteredTags =
    query === ""
      ? []
      : query.toLowerCase() === "clear"
      ? ["Clear all filters"]
      : tagsData.tags.filter((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        );

  const handleQuickAction = (action: string) => {
    if (action === "importance") {
      setMode("importance");
    } else if (action === "impact") {
      setMode("impact");
    }
    setQuery("");
  };

  const handleSelect = (item: string | QuickAction) => {
    if (typeof item === "string") {
      if (item === "Clear all filters") {
        setFilters(initialFiltersState);
        setImportanceScore([
          tagsData.importance_score_range.min,
          tagsData.importance_score_range.max,
        ]);
        setCustomerImpact([
          tagsData.customer_impact_range.min,
          tagsData.customer_impact_range.max,
        ]);
      } else {
        setFilters((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), item],
        }));
      }
      setIsOpen(false);
      setQuery("");
    } else {
      handleQuickAction(item.action);
    }
  };

  const handleImportanceScoreChange = (values: number[]) => {
    setImportanceScore(values);
    setFilters((prev) => ({ ...prev, importance_score: values }));
  };

  const handleCustomerImpactChange = (values: number[]) => {
    setCustomerImpact(values);
    setFilters((prev) => ({ ...prev, customer_impact: values }));
  };

  return (
    <>
      <Transition show={isOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20"
          static
          onClose={() => {
            setIsOpen(false);
            setMode("default");
            setQuery("");
          }}
        >
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
          </TransitionChild>

          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="mx-auto max-w-xl transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              {mode === "default" && (
                <Combobox
                  onChange={(item: string | QuickAction) => handleSelect(item)}
                >
                  <div className="relative">
                    <FiSearch
                      className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <ComboboxInput
                      autoFocus
                      className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                      placeholder="Search tags or select an action..."
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && query.startsWith("?")) {
                          event.preventDefault();
                          const aiQueryText = query.slice(1).trim();
                          if (aiQueryText) {
                            aiQueryMutation.mutate(aiQueryText, {
                              onSuccess: (data) => {
                                setFilters(data.filters);
                                setIsOpen(false);
                                setQuery("");
                              },
                              onError: (error) => {
                                console.error("AI Query Error:", error);
                                // TODO: Show error message to user
                              },
                            });
                          }
                        }
                      }}
                    />
                  </div>
                  {query.startsWith("?") ? (
                    aiQueryMutation.isPending ? (
                      <div className="px-6 py-14 text-center sm:px-14">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-500 mx-auto"></div>
                        <p className="mt-4 text-sm text-gray-900">
                          AI is processing your query...
                        </p>
                      </div>
                    ) : aiQueryMutation.isError ? (
                      <div className="px-6 py-14 text-center sm:px-14">
                        <FiCpu
                          className="mx-auto h-6 w-6 text-gray-400"
                          aria-hidden="true"
                        />
                        <p className="mt-4 text-sm text-gray-900">
                          An error occurred: {aiQueryMutation.error.message}
                        </p>
                      </div>
                    ) : (
                      <div className="px-6 py-14 text-center sm:px-14">
                        <FiCpu
                          className="mx-auto h-6 w-6 text-gray-400"
                          aria-hidden="true"
                        />
                        <p className="mt-4 text-sm text-gray-900">
                          Press Enter to send your query to AI.
                        </p>
                      </div>
                    )
                  ) : (
                    <>
                      {(query === "" ||
                        filteredTags.length > 0 ||
                        quickActions.length > 0) && (
                        <ComboboxOptions
                          static
                          className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto"
                        >
                          {query === "" && (
                            <li className="p-2">
                              <h2 className="mt-4 mb-2 px-3 text-xs font-semibold text-gray-500">
                                Quick actions
                              </h2>
                              <ul className="text-sm text-gray-700">
                                {quickActions.map((action) => (
                                  <ComboboxOption
                                    key={action.shortcut}
                                    value={action}
                                    className={({ active }) =>
                                      `flex cursor-default select-none items-center rounded-md px-3 py-2 ${
                                        active
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-900"
                                      }`
                                    }
                                  >
                                    {({ active }) => (
                                      <>
                                        <action.icon
                                          className={`flex-none ${
                                            active
                                              ? "text-white"
                                              : "text-gray-400"
                                          }`}
                                          aria-hidden="true"
                                          size={24}
                                        />
                                        <span className="ml-3 flex-auto truncate">
                                          {action.name}
                                        </span>
                                        <span
                                          className={`ml-3 flex-none text-xs font-semibold ${
                                            active
                                              ? "text-indigo-100"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          <kbd className="font-sans">⌘</kbd>
                                          <kbd className="font-sans">
                                            {action.shortcut}
                                          </kbd>
                                        </span>
                                      </>
                                    )}
                                  </ComboboxOption>
                                ))}
                              </ul>
                            </li>
                          )}
                          {filteredTags.length > 0 && (
                            <li className="p-2">
                              <h2 className="sr-only">Tags</h2>
                              <ul className="text-sm text-gray-700">
                                {filteredTags.map((tag) => (
                                  <ComboboxOption
                                    key={tag}
                                    value={tag}
                                    className={({ active }) =>
                                      `flex cursor-default select-none items-center rounded-md px-3 py-2 ${
                                        active
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-900"
                                      }`
                                    }
                                  >
                                    {({ active }) => (
                                      <>
                                        {tag === "Clear all filters" ? (
                                          <FiXCircle
                                            className={`flex-none ${
                                              active
                                                ? "text-white"
                                                : "text-gray-400"
                                            }`}
                                            aria-hidden="true"
                                            size={24}
                                          />
                                        ) : (
                                          <FiTag
                                            className={`flex-none ${
                                              active
                                                ? "text-white"
                                                : "text-gray-400"
                                            }`}
                                            aria-hidden="true"
                                            size={24}
                                          />
                                        )}
                                        <span className="ml-3 flex-auto truncate">
                                          {tag}
                                        </span>
                                      </>
                                    )}
                                  </ComboboxOption>
                                ))}
                              </ul>
                            </li>
                          )}
                        </ComboboxOptions>
                      )}

                      {query !== "" && filteredTags.length === 0 && (
                        <div className="px-6 py-14 text-center sm:px-14">
                          <FiTag
                            className="mx-auto h-6 w-6 text-gray-400"
                            aria-hidden="true"
                          />
                          <p className="mt-4 text-sm text-gray-900">
                            We couldn't find any tags with that term. Please try
                            again.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </Combobox>
              )}

              {mode === "importance" && (
                <div className="p-6">
                  <button
                    className="text-gray-500 hover:text-gray-700 mb-4 flex items-center"
                    onClick={() => setMode("default")}
                  >
                    &larr; Back
                  </button>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
                    Set Importance Score Range
                  </h3>
                  <p className="text-sm text-gray-500 mb-10">
                    The importance score represents the average importance of
                    all feedback items in a group. Adjust the range to filter
                    groups based on how important their feedback is.
                  </p>
                  <div className="space-y-8">
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      <Range
                        step={0.1}
                        min={tagsData.importance_score_range.min}
                        max={tagsData.importance_score_range.max}
                        values={importanceScore}
                        onChange={(values) =>
                          handleImportanceScoreChange(values)
                        }
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: "6px",
                              width: "100%",
                              background:
                                "linear-gradient(to right, green, red)",
                              borderRadius: "3px",
                            }}
                          >
                            {children}
                          </div>
                        )}
                        renderThumb={({ index, props }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: "20px",
                              width: "20px",
                              backgroundColor: "#fff",
                              border: "2px solid #548BF4",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: "-28px",
                                color: "#000",
                                fontWeight: "bold",
                                fontSize: "12px",
                                fontFamily:
                                  "Arial,Helvetica Neue,Helvetica,sans-serif",
                                padding: "4px",
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                              }}
                            >
                              {importanceScore[index].toFixed(1)}
                            </div>
                          </div>
                        )}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Selected Range: {importanceScore[0].toFixed(1)} -{" "}
                      {importanceScore[1].toFixed(1)}
                    </p>
                  </div>
                </div>
              )}

              {mode === "impact" && (
                <div className="p-6">
                  <button
                    className="text-gray-500 hover:text-gray-700 mb-4 flex items-center"
                    onClick={() => setMode("default")}
                  >
                    &larr; Back
                  </button>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
                    Set Customer Impact Range
                  </h3>
                  <p className="text-sm text-gray-500 mb-10">
                    The customer impact represents the number of distinct
                    customers affected by the feedback in a group. Adjust the
                    range to filter groups based on how many customers are
                    impacted.
                  </p>
                  <div className="space-y-8">
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      <Range
                        step={1}
                        min={tagsData.customer_impact_range.min}
                        max={tagsData.customer_impact_range.max}
                        values={customerImpact}
                        onChange={(values) =>
                          handleCustomerImpactChange(values)
                        }
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: "6px",
                              width: "100%",
                              background:
                                "linear-gradient(to right, green, red)",
                              borderRadius: "3px",
                            }}
                          >
                            {children}
                          </div>
                        )}
                        renderThumb={({ index, props }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: "20px",
                              width: "20px",
                              backgroundColor: "#fff",
                              border: "2px solid #548BF4",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: "-28px",
                                color: "#000",
                                fontWeight: "bold",
                                fontSize: "12px",
                                fontFamily:
                                  "Arial,Helvetica Neue,Helvetica,sans-serif",
                                padding: "4px",
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                              }}
                            >
                              {customerImpact[index]}
                            </div>
                          </div>
                        )}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Selected Range: {customerImpact[0]} - {customerImpact[1]}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
                Type
                <kbd
                  className={`mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2 ${
                    query === "?"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-gray-400 text-gray-900"
                  }`}
                >
                  ?
                </kbd>
                to ask AI to filter
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
};
