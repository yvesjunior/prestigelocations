import { createFileRoute } from "@tanstack/react-router";
import { UserSettings } from "@/components/admin/UserSettings";
import { listUsersFn } from "@/server/admin";

export const Route = createFileRoute("/admin/employes")({
  head: () => ({ meta: [{ title: "Employés & rôles | Administration" }] }),
  loader: async () => ({ users: await listUsersFn() }),
  component: UsersPage,
});

function UsersPage() {
  const { users } = Route.useLoaderData();
  const { session } = Route.useRouteContext();
  return (
    <div>
      <h1 className="text-xl font-bold">Employés & rôles</h1>
      <div className="mt-5">
        <UserSettings users={users} meId={session?.id ?? 0} />
      </div>
    </div>
  );
}
