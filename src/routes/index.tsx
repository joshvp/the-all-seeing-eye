import { createFileRoute } from "@tanstack/react-router";
import { Portal } from "@/components/portal";
import { getEyePrefs } from "@/lib/prefs.functions";

export const Route = createFileRoute("/")({
  loader: () => getEyePrefs(),
  component: Home,
});

function Home() {
  const prefs = Route.useLoaderData();
  return <Portal initialLocale={prefs.locale} initialTheme={prefs.theme} />;
}
