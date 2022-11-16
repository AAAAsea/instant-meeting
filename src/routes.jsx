/* eslint-disable react/react-in-jsx-scope */
import React, { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Join from './pages/Join'
import Create from './pages/Create'
import Room from './pages/Room'
import Home from './pages/Home'
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/join',
    element: <Join />
  },
  {
    path: '/create',
    element: <Create />
  },
  {
    path: '/room/:id',
    element: <Room />
  }
])
