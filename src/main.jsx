import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { PregnancyProvider } from './contexts/PregnancyContext.jsx'
import { MembersProvider } from './contexts/MembersContext.jsx'
import { DataProvider } from './contexts/DataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PregnancyProvider>
        <MembersProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </MembersProvider>
      </PregnancyProvider>
    </AuthProvider>
  </StrictMode>,
)
