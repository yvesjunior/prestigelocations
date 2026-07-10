import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/equipements")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/equipements", statusCode: 301 });
  },
});
