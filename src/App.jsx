import React from "react";
import Message from "./components/Message/Message";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import { useContext } from "react";
import { SettingsContext } from "./contexts/SettingsContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, useMediaQuery } from "@mui/material";
import { SettingsDrawer } from "./components/SettingsDrawer";

const themes = {
  light: createTheme({
    status: {
      danger: "#e53e3e",
    },
    palette: {
      background: {
        main: "#ffffff",
        paper: "#eeeeee",
        light: "#f5f5f5",
      },
      primary: {
        main: "#6e6ce9",
        darker: "#6e6ce9",
        light: "#6e6ce9",
        contrastText: "#ffffff",
      },
      neutral: {
        main: "#eeeeee",
        light: "#2F2F2F",
        dark: "#dddddd",
        contrastText: "#111111",
      },
      mode: "light",
    },
  }),
  dark: createTheme({
    status: {
      danger: "#e53e3e",
    },
    palette: {
      background: {
        main: "#1A1A1A",
        paper: "#000000",
        light: "#2e2e2e",
      },
      primary: {
        main: "#6e6ce9",
        darker: "#6e6ce9",
        light: "#6e6ce9",
        contrastText: "#ffffff",
      },
      neutral: {
        main: "#333",
        light: "#2F2F2F",
        dark: "#222",
        contrastText: "#ffffff",
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
  document.documentElement.setAttribute("theme", theme);
  console.log("app");
  return (
    <>
      <ThemeProvider theme={themes[theme]}>
        <Box
          sx={{
            color: "text.primary",
            bgcolor: "background.main",
            height: "100%",
          }}
        >
          <RouterProvider router={router} />
          <Message></Message>
          <SettingsDrawer />
        </Box>
      </ThemeProvider>
    </>
  );
};

export default App;
