import { Redirect } from "expo-router";

// The lock screen lives at /auth only, so the auto-lock listener can tell
// when the user is already on it.
export default function Index() {
  return <Redirect href="/auth" />;
}
