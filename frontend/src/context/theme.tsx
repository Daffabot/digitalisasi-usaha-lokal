import { useEffect, useState } from "react";
import { BaseProps } from "../types/types";
import { ThemeContext, type Theme } from "./theme-context";

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "dulo-ui-theme",
  ...props
}: BaseProps & { defaultTheme?: Theme; storageKey?: string }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (t: Theme) => {
      localStorage.setItem(storageKey, t);
      setTheme(t);
    },
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export { useTheme } from "./theme-context";