import { useState, useCallback } from "react";
import { NavTabs, TabConfig } from "./components/NavTabs";
import { Feedback } from "./Feedback";
import { Groups } from "./Groups";
import { Filters } from "./types";

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

  const [filters, setFilters] = useState<Filters>({
    name: "",
    importance: [],
    type: [],
    customer: [],
    date: null,
  });

  const handleTabClick = useCallback((tabId: string) => {
    setSelectedTab(tabId as TabId);
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-5/6 h-4/5 flex flex-col gap-y-4">
        <NavTabs
          config={TabsConfig}
          tabOrder={tabOrder}
          onTabClicked={handleTabClick}
          selectedTab={selectedTab}
        />
        <main role="main" aria-label={`${selectedTab} content`}>
          {selectedTab === "feedback" ? (
            <Feedback filters={filters} setFilters={setFilters} />
          ) : (
            <Groups filters={filters} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
