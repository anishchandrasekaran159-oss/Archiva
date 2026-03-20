// components/Sidebar.jsx
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutGrid, Upload, Search, BookOpen, FlaskConical, Atom, Plus } from 'lucide-react'

const SUBJECTS = [
  { name: 'Physics',     icon: Atom },
  { name: 'Mathematics', icon: BookOpen },
  { name: 'Chemistry',   icon: FlaskConical },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeSubject = searchParams.get('subject')

  const navClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ` +
    (isActive
      ? 'bg-warm-accent text-white'
      : 'text-ink-secondary hover:bg-warm-hover hover:text-ink-primary')

  function handleSubject(name) {
    if (activeSubject === name) {
      navigate('/')
    } else {
      navigate(`/?subject=${encodeURIComponent(name)}`)
    }
  }

  return (
    <aside className="w-[220px] min-w-[220px] flex flex-col bg-warm-bg border-r-[1.5px] border-warm-border h-screen sticky top-0">
      <div className="px-5 py-4 border-b-[1.5px] border-warm-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-warm-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="1.5" width="5.5" height="7.5" rx="1" fill="white" opacity="0.9"/>
              <rect x="9" y="1.5" width="5.5" height="4" rx="1" fill="white" opacity="0.75"/>
              <rect x="1.5" y="11" width="13" height="3.5" rx="1" fill="white" opacity="0.65"/>
              <rect x="9" y="7.5" width="5.5" height="3" rx="1" fill="white" opacity="0.85"/>
            </svg>
          </div>
          <div>
            <p className="text-[17px] font-medium text-ink-primary leading-tight tracking-tight font-serif">Archiva</p>
            <p className="text-[11px] font-medium text-ink-secondary leading-none mt-0.5">Resource Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3.5 flex flex-col gap-0.5 overflow-y-auto">
        <p className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.9px] px-2.5 pb-1">Workspace</p>
        <NavLink to="/"       end className={navClass}><LayoutGrid size={15} />Library</NavLink>
        <NavLink to="/upload"     className={navClass}><Upload      size={15} />Upload</NavLink>
        <NavLink to="/search"     className={navClass}><Search      size={15} />Search</NavLink>

        <p className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.9px] px-2.5 pb-1 mt-3">Subjects</p>

        {SUBJECTS.map(({ name, icon: Icon }) => {
          const isActive = activeSubject === name
          return (
            <button
              key={name}
              onClick={() => handleSubject(name)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 text-left w-full ${isActive ? 'bg-warm-accent text-white' : 'text-ink-secondary hover:bg-warm-hover hover:text-ink-primary'}`}
            >
              <Icon size={15} />
              {name}
            </button>
          )
        })}

        <button className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-warm-accent hover:bg-warm-pale transition-colors mt-1">
          <Plus size={13} />
          Add subject
        </button>
      </nav>

      <div className="px-5 py-3.5 border-t-[1.5px] border-warm-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-warm-accent flex items-center justify-center text-white text-[11px] font-medium flex-shrink-0">SR</div>
          <div>
            <p className="text-[13px] font-medium text-ink-primary leading-tight">Mrs. Rose</p>
            <p className="text-[11px] font-medium text-ink-secondary">Chemistry Dept.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}