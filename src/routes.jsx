/* eslint-disable react/react-in-jsx-scope */
import React, { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RoomDetail from './pages/RoomDetail'
import Room from './pages/Room'
import Home from './pages/Home'
import Error from './pages/Error'
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <Error />
  },
  {
    path: '/room/:id',
    element: <RoomDetail />
  },
  {
    path: '/room',
    element: <Room />
  }
])
