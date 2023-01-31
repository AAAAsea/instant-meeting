import React from "react";
import Message from "./components/Message/Message";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Message></Message>
    </>
  );
};

export default App;
