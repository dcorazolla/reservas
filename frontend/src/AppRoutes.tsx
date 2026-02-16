import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PageShell from '@components/PageShell/PageShell'
import { LoginPage } from '@pages/LoginPage'
import { AuthProvider, useAuth } from '@contexts/AuthContext'

const Home = React.lazy(() => import('./pages/Home'))
const Properties = React.lazy(() => import('./pages/Properties'))
const RoomCategories = React.lazy(() => import('./pages/RoomCategories/RoomCategoriesPage'))

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <PageShell>
                  <Suspense fallback={<div />}> 
                    <Home />
                  </Suspense>
                </PageShell>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/properties"
            element={
              <RequireAuth>
                <PageShell>
                  <Suspense fallback={<div />}>
                    <Properties />
                  </Suspense>
                </PageShell>
              </RequireAuth>
            }
          />
          <Route
            path="/settings/properties"
            element={
              <RequireAuth>
                <PageShell>
                  <Suspense fallback={<div />}>
                    <Properties />
                  </Suspense>
                </PageShell>
              </RequireAuth>
            }
          />
          <Route
            path="/settings/room-categories"
            element={
              <RequireAuth>
                <PageShell>
                  <Suspense fallback={<div />}>
                    <RoomCategories />
                  </Suspense>
                </PageShell>
              </RequireAuth>
            }
          />
          <Route path="/logout" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function RequireAuth({ children }: { children: JSX.Element }) {
  try {
    const { token } = useAuth()
    if (!token) return <Navigate to="/login" replace />
    return children
  } catch (e) {
    // if AuthProvider not available, redirect to login
    return <Navigate to="/login" replace />
  }
}
