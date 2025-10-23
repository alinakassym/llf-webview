import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import ThemeWrapper from './components/ThemeWrapper'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeWrapper>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeWrapper>
    </Provider>
  </StrictMode>
)
