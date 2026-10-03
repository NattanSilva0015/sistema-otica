import {
  Eye,
  ClipboardList,
  Users,
  CalendarDays,
  Stethoscope,
  Clock,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const navRecepcao = [
  {
    id: 'recepcao_fichas',
    label: 'Fichas do Dia',
    icon: CalendarDays,
    desc: 'Painel de atendimentos',
  },
  {
    id: 'recepcao_novo',
    label: 'Novo Atendimento',
    icon: ClipboardList,
    desc: 'Abrir ficha de paciente',
  },
  {
    id: 'recepcao_pacientes',
    label: 'Pacientes',
    icon: Users,
    desc: 'Busca e cadastro',
  },
]

const navDoutor = [
  {
    id: 'doutor_fila',
    label: 'Fila de Atendimento',
    icon: Clock,
    desc: 'Pacientes aguardando',
  },
  {
    id: 'doutor_pacientes',
    label: 'Pacientes',
    icon: Users,
    desc: 'Histórico e laudos',
  },
]

export function Sidebar() {
  const { usuario, telaAtual, setTelaAtual, logout, fichasAguardando } = useApp()

  const navItems = usuario === 'recepcao' ? navRecepcao : navDoutor
  const fila = fichasAguardando()

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <Eye size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">ÓticaSystem</p>
            <p className="text-xs text-gray-400">Atendimento & Laudos</p>
          </div>
        </div>
      </div>

      {/* Perfil logado */}
      <div className="px-5 py-4 border-b border-gray-700/60">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              usuario === 'recepcao'
                ? 'bg-indigo-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {usuario === 'recepcao' ? 'AT' : 'DR'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {usuario === 'recepcao' ? 'Atendente' : 'Dr. Especialista'}
            </p>
            <p className="text-xs text-gray-400">
              {usuario === 'recepcao' ? 'Recepção' : 'Optometria'}
            </p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4" aria-label="Navegação principal">
        <ul className="space-y-1" role="list">
          {navItems.map(({ id, label, icon: Icon, desc }) => {
            const isActive = telaAtual === id
            const showBadge = id === 'doutor_fila' && fila.length > 0

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setTelaAtual(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-colors duration-150 group
                    ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                    }
                  `}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{label}</p>
                    <p
                      className={`text-xs leading-tight truncate ${
                        isActive ? 'text-indigo-200' : 'text-gray-500'
                      }`}
                    >
                      {desc}
                    </p>
                  </div>
                  {showBadge && (
                    <span className="shrink-0 min-w-5 h-5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {fila.length}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight size={14} className="shrink-0 text-indigo-300" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Rodapé — Sair */}
      <div className="px-3 py-4 border-t border-gray-700/60">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400
            hover:bg-gray-700/60 hover:text-white transition-colors duration-150"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  )
}
