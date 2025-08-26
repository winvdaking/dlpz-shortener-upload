import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Récupérer le thème depuis localStorage ou utiliser 'dark' par défaut
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;
    const body = document.body;

    if (newTheme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      body.classList.add("theme-light");
      body.classList.remove("theme-dark");
      body.style.background = "#ffffff";
      body.style.color = "#000000";
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      body.classList.add("theme-dark");
      body.classList.remove("theme-light");
      body.style.background = "#000000";
      body.style.color = "#ffffff";
    }
  }, []);

  const changeTheme = useCallback(
    (newTheme) => {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    changeTheme(newTheme);
  }, [theme, changeTheme]);

  const getBackgroundClass = useCallback(() => {
    return theme === "light" ? "light-background" : "dark-background";
  }, [theme]);

  const getThemeClass = useCallback(() => {
    return theme === "light" ? "theme-light" : "theme-dark";
  }, [theme]);

  // Optimisation: useMemo pour éviter la re-création de l'objet value
  const value = useMemo(
    () => ({
      theme,
      setTheme: changeTheme,
      toggleTheme,
      getBackgroundClass,
      getThemeClass,
    }),
    [theme, changeTheme, toggleTheme, getBackgroundClass, getThemeClass]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
