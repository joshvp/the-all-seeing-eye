import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { prefsFromCookie } from "@/lib/prefs";

export const getEyePrefs = createServerFn({ method: "GET" }).handler(async () => {
  const cookie = getRequestHeader("cookie") ?? "";
  return prefsFromCookie(cookie);
});
