import type { ReactNode } from 'react'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'

const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Videos = lazy(() => import('./pages/Videos'))
const VideoCategory = lazy(() => import('./pages/VideoCategory'))
const Photography = lazy(() => import('./pages/Photography'))
const PhotoCategory = lazy(() => import('./pages/PhotoCategory'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

const page = (el: ReactNode) => <Suspense fallback={<div className="min-h-[80svh]" />}>{el}</Suspense>

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/sobre', element: page(<About />) },
      { path: '/servicos', element: page(<Services />) },
      { path: '/videos', element: page(<Videos />) },
      { path: '/videos/:slug', element: page(<VideoCategory />) },
      { path: '/fotografia', element: page(<Photography />) },
      { path: '/fotografia/:slug', element: page(<PhotoCategory />) },
      { path: '/contato', element: page(<Contact />) },
      { path: '*', element: page(<NotFound />) },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
