import { useState, useCallback } from "react";
import { NavTabs, TabConfig } from "./components/NavTabs";
import { Feedback } from "./Feedback";
import { Groups } from "./Groups";
import { Filters } from "./types";
import { CommandPalette } from "./components/CommandPalette";
import { useTagsQuery } from "./hooks";

const TabsConfig: TabConfig = {
  feedback: {
    id: "feedback",
    name: "Feedback",
  },
  groups: {
    id: "groups",
    name: "Groups",
  },
};

const tabOrder = ["feedback", "groups"];

type TabId = (typeof tabOrder)[number];

function App() {
  const [selectedTab, setSelectedTab] = useState<TabId>("feedback");

  const initialFiltersState: Filters = {
    name: "",
    importance: [],
    type: [],
    customer: [],
    date: null,
    importance_score: [],
    customer_impact: [],
    tags: [],
  };

  const [filters, setFilters] = useState<Filters>(initialFiltersState);

  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleTabClick = useCallback((tabId: string) => {
    setSelectedTab(tabId as TabId);
  }, []);

  const toggleFilter = useCallback((columnName: string) => {
    setOpenFilters((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  }, []);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const {
    data: tagsData,
    isLoading: isTagsLoading,
    error: tagsError,
  } = useTagsQuery();

  if (isTagsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (tagsError) {
    return <div>Error: {(tagsError as Error).message}</div>;
  }

  if (!tagsData) {
    return <div>No data available</div>;
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-5/6 h-4/5 flex flex-col gap-y-4">
        <div className="flex justify-between items-center">
          <NavTabs
            config={TabsConfig}
            tabOrder={tabOrder}
            onTabClicked={handleTabClick}
            selectedTab={selectedTab}
          />
          {selectedTab === "groups" && (
            <button
              className="mb-4 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out flex items-center space-x-2 text-sm font-medium"
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Search Tags or Set Filters</span>
              <kbd className="ml-2 inline-flex items-center rounded border border-gray-200 px-2 font-sans text-xs text-gray-400">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {selectedTab === "groups" && (
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            setIsOpen={setIsCommandPaletteOpen}
            tagsData={tagsData}
            setFilters={setFilters}
            initialFiltersState={initialFiltersState}
          />
        )}

        <main role="main" aria-label={`${selectedTab} content`}>
          {selectedTab === "feedback" ? (
            <Feedback filters={filters} setFilters={setFilters} />
          ) : (
            <Groups
              filters={filters}
              setFilters={setFilters}
              openFilters={openFilters}
              toggleFilter={toggleFilter}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
