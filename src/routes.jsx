/* eslint-disable react/react-in-jsx-scope */
import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Error from "./pages/Error";

const RoomDetail = lazy(() => import("./pages/RoomDetail"));
const Room = lazy(() => import("./pages/Room"));
const Home = lazy(() => import("./pages/Home"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense>
        <Home />
      </Suspense>
    ),
    errorElement: (
      <Suspense>
        <Error />
      </Suspense>
    ),
  },
  {
    path: "/room/:id",
    element: (
      <Suspense>
        <RoomDetail />
      </Suspense>
    ),
  },
  {
    path: "/room",
    element: (
      <Suspense>
        <Room />
      </Suspense>
    ),
  },
]);
