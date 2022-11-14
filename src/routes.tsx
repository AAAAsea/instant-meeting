/* eslint-disable react/react-in-jsx-scope */
import React, { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import Personal from './pages/Personal'
import Room from './pages/Room'
export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/user',
        element: <Personal />,
    },
    {
        path: '/room/:id',
        element: <Room />,
    },
])
