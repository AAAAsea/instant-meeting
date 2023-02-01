import React from "react";
import Message from "./components/Message/Message";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ThemeProvider } from "@emotion/react";
import "./App.css";
import { useContext } from "react";
import { SettingsContext } from "./contexts/SettingsContext";
import { createTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

const themes = {
  light: createTheme({
    status: {
      danger: "#e53e3e",
    },
    palette: {
      primary: {
        main: "#6e6ce9",
        darker: "#6e6ce9",
        light: "#6e6ce9",
        contrastText: "#ffffff",
      },
      neutral: {
        main: "#2F2F2F",
        light: "#2F2F2F",
        dark: "#1e1e1e",
        contrastText: "#AAB8E4",
      },
      mode: "light",
    },
  }),
  dark: createTheme({
    status: {
      danger: "#e53e3e",
    },
    palette: {
      primary: {
        main: "#6e6ce9",
        darker: "#6e6ce9",
        light: "#6e6ce9",
        contrastText: "#ffffff",
      },
      neutral: {
        main: "#2F2F2F",
        light: "#2F2F2F",
        dark: "#1e1e1e",
        contrastText: "#AAB8E4",
      },
      mode: "dark",
    },
  }),
};
const App = () => {
  let { theme } = useContext(SettingsContext);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  if (theme === "system") {
    theme = prefersDarkMode ? "dark" : "light";
  }
  return (
    <>
      <ThemeProvider theme={themes[theme]}>
        <RouterProvider router={router} />
        <Message></Message>
      </ThemeProvider>
    </>
  );
};

export default App;
