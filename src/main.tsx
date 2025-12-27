import { StrictMode, type FC, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import ThemeWrapper from './components/ThemeWrapper'
import { ReauthProvider } from './contexts/ReauthContext'
import { useFirebaseTokenAuth } from './hooks/useFirebaseTokenAuth'
import App from './App'

// Обёрточный компонент для глобальных хуков
const RootWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  useFirebaseTokenAuth();
  return <>{children}</>;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeWrapper>
        <BrowserRouter>
          <ReauthProvider>
            <RootWrapper>
              <App />
            </RootWrapper>
          </ReauthProvider>
        </BrowserRouter>
      </ThemeWrapper>
    </Provider>
  </StrictMode>
)
