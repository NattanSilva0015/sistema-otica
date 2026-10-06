import { useEffect, useState } from 'react'
import { Search, User, Phone, CalendarDays, History, UserPlus, CreditCard, RefreshCw } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'

export function Pacientes() {
  const { pacientes, carregarPacientes, setTelaAtual, setPacienteHistoricoId } = useApp()
  const toast = useToast()
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(false)
  // Armazena o histórico de fichas buscado por paciente (cache local)
  const [fichasPorPaciente, setFichasPorPaciente] = useState({})

  const { buscarFichasPorPaciente } = useApp()

  // Carrega total de fichas para cada paciente visível (otimizado: só uma vez)
  useEffect(() => {
    let cancelado = false
    async function carregarFichas() {
      const promises = pacientes.map(async (p) => {
        if (fichasPorPaciente[p.id] !== undefined) return // já carregado
        try {
          const fichas = await buscarFichasPorPaciente(p.id)
          if (!cancelado) {
            setFichasPorPaciente((prev) => ({ ...prev, [p.id]: fichas }))
          }
        } catch {
          // silencioso — apenas não exibe o contador
        }
      })
      await Promise.allSettled(promises)
    }
    if (pacientes.length > 0) carregarFichas()
    return () => { cancelado = true }
  }, [pacientes]) // eslint-disable-line react-hooks/exhaustive-deps

  async function recarregar() {
    setCarregando(true)
    try {
      await carregarPacientes()
      toast.success('Pacientes atualizados')
    } catch (err) {
      toast.error('Erro ao carregar pacientes', err.message)
    } finally {
      setCarregando(false)
    }
  }

  const pacientesFiltrados = busca.trim()
    ? pacientes.filter((p) =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.cpf && p.cpf.replace(/\D/g, '').includes(busca.replace(/\D/g, '')))
      )
    : pacientes

  function verHistorico(pacienteId) {
    setPacienteHistoricoId(pacienteId)
    setTelaAtual('historico_paciente')
  }

  return (
    <div>
      <PageHeader
        title="Pacientes Cadastrados"
        description={`${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''} no sistema`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={recarregar} disabled={carregando}>
              {carregando ? <Spinner size="sm" /> : <RefreshCw size={15} />}
              Atualizar
            </Button>
            <Button onClick={() => setTelaAtual('recepcao_novo')}>
              <UserPlus size={16} />
              Novo Atendimento
            </Button>
          </div>
        }
      />

      {/* Busca */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input type="search" placeholder="Buscar paciente por nome ou CPF..."
          value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar paciente"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white
            shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
      </div>

      {pacientesFiltrados.length === 0 ? (
        <EmptyState icon={User} title="Nenhum paciente encontrado"
          description="Tente outro nome ou cadastre um novo paciente."
          action={
            <Button onClick={() => setTelaAtual('recepcao_novo')}>
              <UserPlus size={16} /> Cadastrar Paciente
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pacientesFiltrados.map((p) => {
            const fichas = fichasPorPaciente[p.id] ?? []
            const totalFichas = fichas.length
            const ultimaFicha = fichas[0]

            return (
              <Card key={p.id} className="flex flex-col">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {p.nome.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
                      <p className="text-xs text-gray-500">{p.idade} anos</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {p.cpf && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CreditCard size={12} className="text-gray-400 shrink-0" />
                        {p.cpf}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone size={12} className="text-gray-400 shrink-0" />
                      {p.telefone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CalendarDays size={12} className="text-gray-400 shrink-0" />
                      Nascimento: {new Date(p.data_nascimento + 'T00:00').toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <History size={12} className="text-gray-400 shrink-0" />
                      {fichasPorPaciente[p.id] === undefined
                        ? <Spinner size="sm" color="gray" />
                        : <>
                            {totalFichas} consulta{totalFichas !== 1 ? 's' : ''} registrada{totalFichas !== 1 ? 's' : ''}
                            {ultimaFicha && (
                              <span className="text-gray-400">
                                · última em {new Date(ultimaFicha.data_atendimento + 'T00:00').toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </>
                      }
                    </div>
                  </div>

                  <div className="pt-1 border-t border-gray-100 flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => verHistorico(p.id)}>
                      <History size={14} /> Ver Histórico
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1"
                      onClick={() => setTelaAtual('recepcao_novo')}>
                      Nova Ficha
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
