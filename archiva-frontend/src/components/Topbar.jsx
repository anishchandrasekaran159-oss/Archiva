// components/Topbar.jsx
// Slimmed-down topbar — just a title. Search + upload live in Navbar now.
export default function Topbar({ title }) {
  return (
    <header className="flex items-center px-8 py-4 bg-[#FFFAF5] flex-shrink-0">
      <h1 className="text-[15px] font-medium text-ink-secondary font-serif">{title}</h1>
    </header>
  )
}