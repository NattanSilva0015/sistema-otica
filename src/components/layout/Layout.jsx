import { Sidebar } from './Sidebar'

export function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Conteúdo principal */}
      <main
        id="main-content"
        className="flex-1 overflow-y-auto"
        aria-label="Conteúdo principal"
      >
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
