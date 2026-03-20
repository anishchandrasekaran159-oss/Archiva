// App.jsx
import { Routes, Route } from 'react-router-dom'
import Sidebar  from './components/Sidebar.jsx'
import Library    from './pages/Library.jsx'
import Upload     from './pages/Upload.jsx'
import Search     from './pages/Search.jsx'
import FileDetail from './pages/FileDetail.jsx'

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFAF5]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Routes>
          <Route path="/"       element={<Library />} />
          <Route path="/upload" element={<Upload />}  />
          <Route path="/search"      element={<Search />}     />
          <Route path="/files/:id"   element={<FileDetail />} />
        </Routes>
      </div>
    </div>
  )
}