import './App.css'
import AppRouter from './routes/AppRouter'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { startTabSession } from './utils/tabSessionManager'

function App() {
  // Initialize tab session management
  useEffect(() => {
    const session = startTabSession();
    return () => {
      if (session && session.cleanup) {
        session.cleanup();
      }
    };
  }, []);

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />
    </>
  )
}

export default App
