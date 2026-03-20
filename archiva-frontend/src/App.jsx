// App.jsx
import { Routes, Route } from 'react-router-dom'
import Navbar          from './components/Navbar.jsx'
import ProtectedRoute  from './components/ProtectedRoute.jsx'
import Library         from './pages/Library.jsx'
import Upload          from './pages/Upload.jsx'
import Search          from './pages/Search.jsx'
import FileDetail      from './pages/FileDetail.jsx'
import Login           from './pages/Login.jsx'
import Signup          from './pages/Signup.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public routes — no navbar, no auth check */}
      <Route path="/login"  element={<Login />}  />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes — must be logged in */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen overflow-hidden bg-[#FFFAF5]">
              <Navbar />
              <div className="flex-1 overflow-hidden">
                <Routes>
                  <Route path="/"          element={<Library />}    />
                  <Route path="/upload"    element={<Upload />}     />
                  <Route path="/search"    element={<Search />}     />
                  <Route path="/files/:id" element={<FileDetail />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}