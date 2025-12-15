import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

async function fetchUser(): Promise<User> {
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    throw new Error("No auth token found");
  }

  const res = await fetch("/api/users/info/", {
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user data");
  }

  return res.json();
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/users/info/"],
    queryFn: fetchUser,
    retry: false,
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isScholar: user?.role === "scholar",
  };
}
