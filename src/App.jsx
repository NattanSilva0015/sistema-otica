import { AppProvider, useApp } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { FichasDoDia } from './pages/recepcao/FichasDoDia'
import { NovoAtendimento } from './pages/recepcao/NovoAtendimento'
import { Pacientes } from './pages/recepcao/Pacientes'
import { FilaAtendimento } from './pages/doutor/FilaAtendimento'
import { Atendimento } from './pages/doutor/Atendimento'
import { HistoricoPaciente } from './pages/HistoricoPaciente'
import { LoadingScreen } from './components/ui/Spinner'

// ─── Roteador ────────────────────────────────────────────────────────────────

function Router() {
  const { usuario, telaAtual, loadingInicial } = useApp()

  if (!usuario) return <Login />

  if (loadingInicial) return <LoadingScreen message="Carregando dados..." />

  const telas = {
    recepcao_fichas:    <FichasDoDia />,
    recepcao_novo:      <NovoAtendimento />,
    recepcao_pacientes: <Pacientes />,
    doutor_fila:        <FilaAtendimento />,
    doutor_atendimento: <Atendimento />,
    doutor_pacientes:   <Pacientes />,
    historico_paciente: <HistoricoPaciente />,
  }

  const conteudo = telas[telaAtual] ?? (
    <div className="flex items-center justify-center h-full py-24 text-gray-400 text-sm">
      Tela não encontrada:{' '}
      <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{telaAtual}</code>
    </div>
  )

  return <Layout>{conteudo}</Layout>
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </ToastProvider>
  )
}
