export async function getClerkToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    const clerk = (window as unknown as Record<string, unknown>).Clerk as
      | { session?: { getToken: () => Promise<string> } }
      | undefined;
    return (await clerk?.session?.getToken()) ?? null;
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { getToken } = await auth();
  return await getToken();
}
