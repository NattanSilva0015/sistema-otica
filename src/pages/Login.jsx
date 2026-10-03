import { Eye, Stethoscope, MonitorCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'

const perfis = [
  {
    id: 'recepcao',
    titulo: 'Recepção / Atendente',
    descricao: 'Cadastre pacientes, abra fichas de atendimento e acompanhe a fila do dia.',
    icon: MonitorCheck,
    cor: 'indigo',
  },
  {
    id: 'doutor',
    titulo: 'Doutor / Optometrista',
    descricao: 'Visualize a fila, realize atendimentos e emita laudos de refração.',
    icon: Stethoscope,
    cor: 'emerald',
  },
]

const corClasses = {
  indigo: {
    card: 'hover:border-indigo-400 hover:shadow-indigo-100',
    icon: 'bg-indigo-50 text-indigo-600',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    ring: 'focus-visible:ring-indigo-500',
  },
  emerald: {
    card: 'hover:border-emerald-400 hover:shadow-emerald-100',
    icon: 'bg-emerald-50 text-emerald-600',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    ring: 'focus-visible:ring-emerald-500',
  },
}

export function Login() {
  const { login } = useApp()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6">
      {/* Logo / Cabeçalho */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
          <Eye size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ÓticaSystem</h1>
        <p className="text-gray-500 mt-1 text-sm">Sistema de Atendimento e Laudos</p>
      </div>

      {/* Seleção de Perfil */}
      <div className="w-full max-w-2xl">
        <p className="text-center text-sm font-medium text-gray-600 mb-4 uppercase tracking-wider">
          Selecione seu perfil de acesso
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {perfis.map(({ id, titulo, descricao, icon: Icon, cor }) => {
            const c = corClasses[cor]
            return (
              <button
                key={id}
                type="button"
                onClick={() => login(id)}
                className={`
                  group relative flex flex-col items-start gap-4 p-6 text-left
                  bg-white rounded-2xl border-2 border-gray-200 shadow-sm
                  transition-all duration-200 hover:shadow-lg
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  ${c.card} ${c.ring}
                `}
                aria-label={`Entrar como ${titulo}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.icon}`}>
                  <Icon size={24} />
                </div>

                <div>
                  <p className="font-semibold text-gray-900 text-base mb-1">{titulo}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{descricao}</p>
                </div>

                <span
                  className={`
                    mt-auto self-stretch flex items-center justify-center py-2 rounded-xl text-sm font-medium
                    transition-colors duration-150 ${c.btn}
                  `}
                >
                  Entrar como {id === 'recepcao' ? 'Atendente' : 'Doutor'}
                </span>
              </button>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Protótipo — dados fictícios em memória · Versão 1.0
        </p>
      </div>
    </div>
  )
}
