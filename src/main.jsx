import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ContextProvider } from '@/contexts/MessageContext'
import { SocketContextProvider } from './contexts/SocketContext'
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react'

const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#715ee2',
      darker: '#715ee2',
    },
    neutral: {
      main: '#64748B',
      light: '#64748B',
      dark: '#7f8da2',
      contrastText: '#fff',
    },
  },
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
