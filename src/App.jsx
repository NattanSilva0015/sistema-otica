import { AppProvider, useApp } from './context/AppContext'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { FichasDoDia } from './pages/recepcao/FichasDoDia'
import { NovoAtendimento } from './pages/recepcao/NovoAtendimento'
import { Pacientes } from './pages/recepcao/Pacientes'
import { FilaAtendimento } from './pages/doutor/FilaAtendimento'
import { Atendimento } from './pages/doutor/Atendimento'
import { HistoricoPaciente } from './pages/HistoricoPaciente'

// Roteador baseado em estado — sem react-router
function Router() {
  const { usuario, telaAtual } = useApp()

  // Sem usuário → tela de login
  if (!usuario) return <Login />

  // Mapeia tela → componente
  const telas = {
    // Recepção
    recepcao_fichas: <FichasDoDia />,
    recepcao_novo: <NovoAtendimento />,
    recepcao_pacientes: <Pacientes />,
    // Doutor
    doutor_fila: <FilaAtendimento />,
    doutor_atendimento: <Atendimento />,
    doutor_pacientes: <Pacientes />,
    // Compartilhado
    historico_paciente: <HistoricoPaciente />,
  }

  const conteudo = telas[telaAtual] ?? (
    <div className="flex items-center justify-center h-full py-24 text-gray-400 text-sm">
      Tela não encontrada: <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{telaAtual}</code>
    </div>
  )

  return <Layout>{conteudo}</Layout>
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
