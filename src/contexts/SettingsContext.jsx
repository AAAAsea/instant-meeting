import React, { useState } from "react";
import { createContext } from "react";

const SettingsContext = createContext();

const SettingsContextProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  React.useEffect(() => {
    let initialTheme = "system";
    try {
      initialTheme = localStorage.getItem("theme") || initialTheme;
    } catch (error) {
      // do nothing
    }
    setTheme(initialTheme);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContextProvider, SettingsContext };
