import isElectron from "is-electron";
import React, { useState } from "react";
import { createContext } from "react";

const SettingsContext = createContext();

const SettingsContextProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recorderMode, setRecorderMode] = useState(1); // 0 主视频   1 屏幕分享
  const [recorderQuality, setRecorderQuality] = useState(2); // 3 高 2 中 1 低
  const [ignoreRemoteControl, setIgnoreRemoteControl] = useState(false); // 3 高 2 中 1 低
  const [platform, setPlatform] = useState("win32"); // 3 高 2 中 1 低

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

    let initialRecorderQuality = 0;
    try {
      initialRecorderQuality =
        localStorage.getItem("recorderQuality") || initialRecorderQuality;
    } catch (error) {
      // do nothing
    }
    if (
      initialRecorderQuality != 1 &&
      initialRecorderQuality != 2 &&
      initialRecorderQuality != 3
    ) {
      initialRecorderQuality = 2;
    }
    setRecorderQuality(initialRecorderQuality);

    let initialIgnoreRemoteControl = false;
    try {
      initialIgnoreRemoteControl = Boolean(
        localStorage.getItem("ignoreRemoteControl")
      );
      if (initialIgnoreRemoteControl === null)
        initialIgnoreRemoteControl = false;
    } catch (error) {
      // do nothing
    }
    setIgnoreRemoteControl(initialIgnoreRemoteControl);

    if (isElectron()) {
      window.electron.ipcRenderer.invoke("getPlatform").then((platform) => {
        setPlatform(platform);
      });
    }
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
        recorderQuality,
        setRecorderQuality,
        ignoreRemoteControl,
        setIgnoreRemoteControl,
        platform,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContextProvider, SettingsContext };
