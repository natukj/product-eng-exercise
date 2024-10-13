import { GroupsDataTable } from "./components/GroupsDataTable";
import { useGroupsQuery } from "./hooks";

type Props = {
  filters?: unknown;
};

export function Groups({ filters }: Props) {
  const dataReq = useGroupsQuery({
    _: "Update this object to pass data to the /groups endpoint.",
    filters,
  });

  if (dataReq.isLoading || !dataReq.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <GroupsDataTable data={dataReq.data.data} />;
}
