import { useState } from "react";

interface User {
  id: string;
  email: string;
}

const save = (key: string, value: unknown) =>
  localStorage.setItem(key, JSON.stringify(value));

const load = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(() =>
    load<User | null>("travelin_user", null)
  );

  const login = (email: string, password: string) => {
    const fakeUser = { id: crypto.randomUUID(), email, password };
    setUser(fakeUser);
    save("travelin_user", fakeUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("travelin_user");
  };

  const register = (email: string, password: string) => login(email, password);

  return { user, login, logout, register };
}
