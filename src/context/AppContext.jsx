import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── Context ────────────────────────────────────────────────────────────────

const AppContext = createContext(null)

// ─── Helpers ────────────────────────────────────────────────────────────────

// Calcula idade a partir de data_nascimento (ISO string)
function calcularIdade(data_nascimento) {
  if (!data_nascimento) return null
  const hoje = new Date()
  const nasc = new Date(data_nascimento)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

// Formata CPF para o padrão do banco: 000.000.000-00
// Aceita tanto "16474217642" quanto "164.742.176-42"
function formatarCPF(cpf) {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf // devolve como veio se inválido
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9,11)}`
}

// Mapeia a row do banco (snake_case) para o shape esperado pelo front.
// O banco não armazena "idade" — calculamos aqui para manter compatibilidade.
function mapPaciente(row) {
  return {
    ...row,
    idade: calcularIdade(row.data_nascimento),
  }
}

// Mapeia ficha com paciente aninhado (quando vem do JOIN)
function mapFicha(row) {
  if (row.pacientes) {
    const { pacientes, ...ficha } = row
    return { ...ficha, _paciente: mapPaciente(pacientes) }
  }
  return row
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  // ── Autenticação (perfil simples, sem Supabase Auth) ────────────────────
  const [usuario, setUsuario] = useState(null)
  const [telaAtual, setTelaAtual] = useState('login')
  const [fichaAtivaId, setFichaAtivaId] = useState(null)
  const [pacienteHistoricoId, setPacienteHistoricoId] = useState(null)

  // ── Dados ────────────────────────────────────────────────────────────────
  const [pacientes, setPacientes] = useState([])
  const [fichas, setFichas] = useState([])     // fichas do dia corrente
  const [laudos, setLaudos] = useState([])

  // ── Estado de UI ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [loadingInicial, setLoadingInicial] = useState(false)

  // Toast — injetado pelo ToastProvider; acessível via useToast() nos componentes.
  // O AppContext expõe apenas os dados e actions; o Toast é disparado diretamente
  // nos componentes para manter o contexto desacoplado.

  // ════════════════════════════════════════════════════════════════════════
  // CARREGAMENTO INICIAL — ao fazer login
  // ════════════════════════════════════════════════════════════════════════

  const carregarDadosIniciais = useCallback(async () => {
    setLoadingInicial(true)
    try {
      await Promise.all([carregarPacientes(), carregarFichasDeHoje()])
    } finally {
      setLoadingInicial(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ════════════════════════════════════════════════════════════════════════
  // PACIENTES
  // ════════════════════════════════════════════════════════════════════════

  async function carregarPacientes() {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    setPacientes((data ?? []).map(mapPaciente))
  }

  async function adicionarPaciente(dados) {
    // Remove "idade" calculada — não existe no banco
    // Garante que o CPF vai formatado como 000.000.000-00
    const { idade, cpf, ...rest } = dados

    const { data, error } = await supabase
      .from('pacientes')
      .insert({ ...rest, cpf: formatarCPF(cpf) })
      .select()
      .single()

    if (error) throw error

    const novo = mapPaciente(data)
    setPacientes((prev) => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)))
    return novo
  }

  function buscarPacientePorId(id) {
    return pacientes.find((p) => p.id === id) || null
  }

  // ════════════════════════════════════════════════════════════════════════
  // FICHAS
  // ════════════════════════════════════════════════════════════════════════

  async function carregarFichasDeHoje() {
    const hoje = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('fichas')
      .select(`
        *,
        pacientes (
          id, nome, cpf, telefone, data_nascimento
        )
      `)
      .eq('data_atendimento', hoje)
      .order('criado_em', { ascending: true })

    if (error) throw error
    setFichas((data ?? []).map(mapFicha))
  }

  async function abrirFicha(dados) {
    const { data, error } = await supabase
      .from('fichas')
      .insert({
        ...dados,
        data_atendimento: new Date().toISOString().split('T')[0],
        status: 'aguardando',
      })
      .select(`
        *,
        pacientes (
          id, nome, cpf, telefone, data_nascimento
        )
      `)
      .single()

    if (error) throw error

    const nova = mapFicha(data)
    setFichas((prev) => [...prev, nova])
    return nova
  }

  async function atualizarStatusFicha(fichaId, novoStatus) {
    const { data, error } = await supabase
      .from('fichas')
      .update({ status: novoStatus })
      .eq('id', fichaId)
      .select()
      .single()

    if (error) throw error

    setFichas((prev) =>
      prev.map((f) => (f.id === fichaId ? { ...f, status: data.status } : f))
    )
  }

  async function buscarFichasPorPaciente(pacienteId) {
    const { data, error } = await supabase
      .from('fichas')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('data_atendimento', { ascending: false })

    if (error) throw error
    return data ?? []
  }

  // Retorna fichas do dia a partir do estado local (já carregado)
  function fichasDeHoje() {
    const hoje = new Date().toISOString().split('T')[0]
    return fichas.filter((f) => f.data_atendimento === hoje)
  }

  function fichasAguardando() {
    return fichas.filter((f) => f.status === 'aguardando')
  }

  // ════════════════════════════════════════════════════════════════════════
  // LAUDOS
  // ════════════════════════════════════════════════════════════════════════

  async function salvarLaudo(fichaId, dados) {
    // 1. Insere o laudo
    const { data, error } = await supabase
      .from('laudos')
      .insert({ ...dados, ficha_id: fichaId })
      .select()
      .single()

    if (error) throw error

    // 2. Finaliza a ficha (UPDATE em paralelo é seguro aqui)
    await atualizarStatusFicha(fichaId, 'finalizado')

    setLaudos((prev) => [...prev, data])
    return data
  }

  async function buscarLaudoPorFicha(fichaId) {
    // Tenta no cache local primeiro
    const cache = laudos.find((l) => l.ficha_id === fichaId)
    if (cache) return cache

    const { data, error } = await supabase
      .from('laudos')
      .select('*')
      .eq('ficha_id', fichaId)
      .maybeSingle()

    if (error) throw error
    if (data) setLaudos((prev) => [...prev, data])
    return data
  }

  async function buscarLaudosPorPaciente(pacienteId) {
    const { data, error } = await supabase
      .from('laudos')
      .select(`
        *,
        fichas!inner (
          paciente_id
        )
      `)
      .eq('fichas.paciente_id', pacienteId)
      .order('criado_em', { ascending: false })

    if (error) throw error
    return data ?? []
  }

  // ════════════════════════════════════════════════════════════════════════
  // HISTÓRICO COMPLETO DO PACIENTE (fichas + laudos em uma só query)
  // ════════════════════════════════════════════════════════════════════════

  async function buscarHistoricoPaciente(pacienteId) {
    const { data, error } = await supabase
      .from('fichas')
      .select(`
        *,
        laudos (*)
      `)
      .eq('paciente_id', pacienteId)
      .order('data_atendimento', { ascending: false })

    if (error) throw error

    // Popula o cache de laudos com os que vieram embedded
    const laudosEmbedded = (data ?? [])
      .flatMap((f) => f.laudos ?? [])
    if (laudosEmbedded.length > 0) {
      setLaudos((prev) => {
        const ids = new Set(prev.map((l) => l.id))
        const novos = laudosEmbedded.filter((l) => !ids.has(l.id))
        return novos.length > 0 ? [...prev, ...novos] : prev
      })
    }

    // Retorna fichas com laudo aninhado em formato flat para o front
    return (data ?? []).map((f) => ({
      ...f,
      laudo: f.laudos?.[0] ?? null,
    }))
  }

  // ════════════════════════════════════════════════════════════════════════
  // AUTENTICAÇÃO (perfil local — sem Supabase Auth neste protótipo)
  // ════════════════════════════════════════════════════════════════════════

  async function login(perfil) {
    setUsuario(perfil)
    setTelaAtual(perfil === 'recepcao' ? 'recepcao_fichas' : 'doutor_fila')
    await carregarDadosIniciais()
  }

  function logout() {
    setUsuario(null)
    setTelaAtual('login')
    setFichaAtivaId(null)
    setPacienteHistoricoId(null)
    setPacientes([])
    setFichas([])
    setLaudos([])
  }

  // ════════════════════════════════════════════════════════════════════════
  // REALTIME — atualiza fila automaticamente quando outra sessão altera fichas
  // ════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!usuario) return

    const hoje = new Date().toISOString().split('T')[0]

    const channel = supabase
      .channel('fichas-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fichas',
          filter: `data_atendimento=eq.${hoje}`,
        },
        () => {
          // Recarrega fichas do dia silenciosamente ao detectar qualquer alteração
          carregarFichasDeHoje().catch(console.error)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [usuario]) // eslint-disable-line react-hooks/exhaustive-deps

  // ════════════════════════════════════════════════════════════════════════
  // VALUE
  // ════════════════════════════════════════════════════════════════════════

  const value = {
    // estado
    usuario,
    pacientes,
    fichas,
    laudos,
    telaAtual,
    fichaAtivaId,
    pacienteHistoricoId,
    loading,
    loadingInicial,
    // navegação
    setTelaAtual,
    setFichaAtivaId,
    setPacienteHistoricoId,
    setLoading,
    // ações — pacientes
    login,
    logout,
    adicionarPaciente,
    buscarPacientePorId,
    carregarPacientes,
    // ações — fichas
    abrirFicha,
    atualizarStatusFicha,
    buscarFichasPorPaciente,
    carregarFichasDeHoje,
    fichasDeHoje,
    fichasAguardando,
    // ações — laudos
    salvarLaudo,
    buscarLaudoPorFicha,
    buscarLaudosPorPaciente,
    // ações — histórico
    buscarHistoricoPaciente,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}
