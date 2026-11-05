import { unstable_rethrow } from "next/navigation";

export function caughtMessage(error: unknown) {
  unstable_rethrow(error);
  return error instanceof Error ? error.message : "Could not load tests.";
}
