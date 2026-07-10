import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/a-propos")({
  beforeLoad: () => {
    throw redirect({ to: "/fr/a-propos", statusCode: 301 });
  },
});
