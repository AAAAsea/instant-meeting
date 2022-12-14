import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ContextProvider } from '@/contexts/MessageContext'
import { SocketContextProvider } from './contexts/SocketContext'
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react'
import 'animate.css'

const theme = createTheme({
  status: {
    danger: '#e53e3e'
  },
  palette: {
    primary: {
      main: '#6e6ce9',
      darker: '#6e6ce9',
      light: '#6e6ce9',
      contrastText: '#ffffff'
    },
    neutral: {
      main: '#2F2F2F',
      light: '#2F2F2F',
      dark: '#1e1e1e',
      contrastText: '#AAB8E4'
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <ContextProvider>
    <SocketContextProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider >
    </SocketContextProvider>
  </ContextProvider>
  // </React.StrictMode>
)
