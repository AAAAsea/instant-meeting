import React, { useState } from "react";
import { createContext } from "react";

const SettingsContext = createContext();

const SettingsContextProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recorderMode, setRecorderMode] = useState(0); // 0 主视频   1 屏幕分享

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

    let initialRecorderMode = 0;
    try {
      initialRecorderMode =
        localStorage.getItem("recorderMode") || initialRecorderMode;
    } catch (error) {
      // do nothing
    }
    if (initialRecorderMode != 0 && initialRecorderMode != 1) {
      initialRecorderMode = 0;
    }
    setRecorderMode(initialRecorderMode);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        drawerOpen,
        setDrawerOpen,
        recorderMode,
        setRecorderMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContextProvider, SettingsContext };
