import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ContextProvider } from '@/contexts/MessageContext'
import { SocketContextProvider } from './contexts/SocketContext'


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <ContextProvider>
    <SocketContextProvider>
      <App />
    </SocketContextProvider>
  </ContextProvider>
  // </React.StrictMode>
)
