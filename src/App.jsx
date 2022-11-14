import { Button } from '@mui/material';
import React from 'react'
import Message from './components/Message';
import { useContext } from 'react';
import { MessageContext } from '@/contexts/MessageContext';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { NavLink } from 'react-router-dom';
import { ButtonGroup } from '@mui/material';
import './App.css'
const App = () => {
  const { message } = useContext(MessageContext);
  return (
    <>
      <RouterProvider router={router} />
      <Message></Message>
    </>
  )
}

export default App