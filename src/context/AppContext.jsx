import { createContext, useContext, useState } from 'react'

// ─── Dados Mock Iniciais ────────────────────────────────────────────────────

const pacientesMock = [
  {
    id: 'p1',
    nome: 'Ana Clara Souza',
    idade: 34,
    data_nascimento: '1990-03-15',
    telefone: '(11) 98765-4321',
    cpf: '123.456.789-00',
  },
  {
    id: 'p2',
    nome: 'Roberto Ferreira Lima',
    idade: 52,
    data_nascimento: '1972-07-22',
    telefone: '(11) 91234-5678',
    cpf: '987.654.321-00',
  },
  {
    id: 'p3',
    nome: 'Juliana Martins Costa',
    idade: 28,
    data_nascimento: '1996-11-08',
    telefone: '(11) 99876-5432',
    cpf: '111.222.333-44',
  },
  {
    id: 'p4',
    nome: 'Carlos Eduardo Pereira',
    idade: 45,
    data_nascimento: '1979-01-30',
    telefone: '(11) 97654-3210',
    cpf: '555.666.777-88',
  },
]

const fichasMock = [
  {
    id: 'f1',
    paciente_id: 'p1',
    data_atendimento: '2026-10-03',
    tipo_atendimento: 'Primeira Consulta',
    observacao_recepcao: 'Paciente relatou dor de cabeça constante ao ler.',
    precisa_colicario: true,
    status: 'aguardando',
  },
  {
    id: 'f2',
    paciente_id: 'p2',
    data_atendimento: '2026-10-03',
    tipo_atendimento: 'Retorno',
    observacao_recepcao: 'Trouxe óculos antigo para avaliação. Reclama que está errando leituras.',
    precisa_colicario: false,
    status: 'aguardando',
  },
  {
    id: 'f3',
    paciente_id: 'p3',
    data_atendimento: '2026-10-03',
    tipo_atendimento: 'Garantia/Ajuste',
    observacao_recepcao: 'Armação torta, incomoda atrás da orelha esquerda.',
    precisa_colicario: false,
    status: 'em_atendimento',
  },
  {
    id: 'f4',
    paciente_id: 'p4',
    data_atendimento: '2026-10-02',
    tipo_atendimento: 'Acompanhamento',
    observacao_recepcao: 'Consulta de rotina anual.',
    precisa_colicario: true,
    status: 'finalizado',
  },
  // Fichas históricas para p1
  {
    id: 'f5',
    paciente_id: 'p1',
    data_atendimento: '2025-09-10',
    tipo_atendimento: 'Primeira Consulta',
    observacao_recepcao: 'Veio por indicação. Nunca usou óculos.',
    precisa_colicario: true,
    status: 'finalizado',
  },
  {
    id: 'f6',
    paciente_id: 'p2',
    data_atendimento: '2025-11-20',
    tipo_atendimento: 'Primeira Consulta',
    observacao_recepcao: 'Paciente com dificuldade de enxergar de longe.',
    precisa_colicario: false,
    status: 'finalizado',
  },
]

const laudosMock = [
  {
    id: 'l1',
    ficha_id: 'f4',
    od_esferico: '-2.00',
    od_cilindrico: '-0.50',
    od_eixo: '180',
    oe_esferico: '-1.75',
    oe_cilindrico: '-0.75',
    oe_eixo: '175',
    observacao_medica: 'Miopia leve. Recomendo uso contínuo dos óculos e retorno em 12 meses.',
    proxima_consulta: '2027-10-02',
    data_criacao: '2026-10-02',
  },
  {
    id: 'l2',
    ficha_id: 'f5',
    od_esferico: '-1.50',
    od_cilindrico: '0.00',
    od_eixo: '0',
    oe_esferico: '-1.25',
    oe_cilindrico: '-0.25',
    oe_eixo: '90',
    observacao_medica: 'Miopia leve bilateral. Primeira prescrição. Orientada sobre o uso e adaptação dos óculos.',
    proxima_consulta: '2026-09-10',
    data_criacao: '2025-09-10',
  },
  {
    id: 'l3',
    ficha_id: 'f6',
    od_esferico: '-3.00',
    od_cilindrico: '-1.00',
    od_eixo: '170',
    oe_esferico: '-2.75',
    oe_cilindrico: '-0.50',
    oe_eixo: '165',
    observacao_medica: 'Miopia moderada. Prescrição de óculos para uso permanente.',
    proxima_consulta: '2026-11-20',
    data_criacao: '2025-11-20',
  },
]

// ─── Context ────────────────────────────────────────────────────────────────

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(null) // null = não logado
  const [pacientes, setPacientes] = useState(pacientesMock)
  const [fichas, setFichas] = useState(fichasMock)
  const [laudos, setLaudos] = useState(laudosMock)
  const [telaAtual, setTelaAtual] = useState('login')
  const [fichaAtivaId, setFichaAtivaId] = useState(null) // ficha em atendimento pelo doutor
  const [pacienteHistoricoId, setPacienteHistoricoId] = useState(null)

  // ─── Pacientes ───────────────────────────────────────────────────────────

  function adicionarPaciente(dados) {
    const novo = {
      id: `p${Date.now()}`,
      ...dados,
    }
    setPacientes((prev) => [...prev, novo])
    return novo
  }

  function buscarPacientePorId(id) {
    return pacientes.find((p) => p.id === id) || null
  }

  // ─── Fichas ──────────────────────────────────────────────────────────────

  function abrirFicha(dados) {
    const nova = {
      id: `f${Date.now()}`,
      data_atendimento: new Date().toISOString().split('T')[0],
      status: 'aguardando',
      ...dados,
    }
    setFichas((prev) => [...prev, nova])
    return nova
  }

  function atualizarStatusFicha(fichaId, novoStatus) {
    setFichas((prev) =>
      prev.map((f) => (f.id === fichaId ? { ...f, status: novoStatus } : f))
    )
  }

  function buscarFichasPorPaciente(pacienteId) {
    return fichas
      .filter((f) => f.paciente_id === pacienteId)
      .sort((a, b) => new Date(b.data_atendimento) - new Date(a.data_atendimento))
  }

  function fichasDeHoje() {
    const hoje = new Date().toISOString().split('T')[0]
    return fichas.filter((f) => f.data_atendimento === hoje)
  }

  function fichasAguardando() {
    return fichas.filter((f) => f.status === 'aguardando')
  }

  // ─── Laudos ──────────────────────────────────────────────────────────────

  function salvarLaudo(fichaId, dados) {
    const novo = {
      id: `l${Date.now()}`,
      ficha_id: fichaId,
      data_criacao: new Date().toISOString().split('T')[0],
      ...dados,
    }
    setLaudos((prev) => [...prev, novo])
    atualizarStatusFicha(fichaId, 'finalizado')
    return novo
  }

  function buscarLaudoPorFicha(fichaId) {
    return laudos.find((l) => l.ficha_id === fichaId) || null
  }

  function buscarLaudosPorPaciente(pacienteId) {
    const fichasDoPaciente = fichas.filter((f) => f.paciente_id === pacienteId)
    return laudos
      .filter((l) => fichasDoPaciente.some((f) => f.id === l.ficha_id))
      .sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
  }

  // ─── Autenticação ────────────────────────────────────────────────────────

  function login(perfil) {
    setUsuario(perfil)
    setTelaAtual(perfil === 'recepcao' ? 'recepcao_fichas' : 'doutor_fila')
  }

  function logout() {
    setUsuario(null)
    setTelaAtual('login')
    setFichaAtivaId(null)
    setPacienteHistoricoId(null)
  }

  const value = {
    // estado
    usuario,
    pacientes,
    fichas,
    laudos,
    telaAtual,
    fichaAtivaId,
    pacienteHistoricoId,
    // navegação
    setTelaAtual,
    setFichaAtivaId,
    setPacienteHistoricoId,
    // ações
    login,
    logout,
    adicionarPaciente,
    buscarPacientePorId,
    abrirFicha,
    atualizarStatusFicha,
    buscarFichasPorPaciente,
    fichasDeHoje,
    fichasAguardando,
    salvarLaudo,
    buscarLaudoPorFicha,
    buscarLaudosPorPaciente,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}
