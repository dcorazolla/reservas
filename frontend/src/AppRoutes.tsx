import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PageShell from './components/PageShell'

const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/Login'))

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PageShell>
              <Suspense fallback={<div />}> 
                <Home />
              </Suspense>
            </PageShell>
          }
        />
        <Route
          path="/login"
          element={
            <PageShell>
              <Suspense fallback={<div />}> 
                <Login />
              </Suspense>
            </PageShell>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
