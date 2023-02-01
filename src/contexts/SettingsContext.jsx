import React, { useState } from "react";
import { createContext } from "react";

const SettingsContext = createContext();

const SettingsContextProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [drawerOpen, setDrawerOpen] = useState(false);

  React.useEffect(() => {
    let initialTheme = "system";
    try {
      initialTheme = localStorage.getItem("theme") || initialTheme;
    } catch (error) {
      // do nothing
    }
    if (!["system", "dark", "light"].includes(initialTheme))
      initialTheme = "system";
    setTheme(initialTheme);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContextProvider, SettingsContext };
