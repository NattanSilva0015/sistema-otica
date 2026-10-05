import { useState } from 'react'
import { Search, User, Phone, CalendarDays, History, UserPlus, CreditCard } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'

export function Pacientes() {
  const { pacientes, buscarFichasPorPaciente, setTelaAtual, setPacienteHistoricoId } = useApp()
  const [busca, setBusca] = useState('')

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

  function novoAtendimento() {
    setTelaAtual('recepcao_novo')
  }

  return (
    <div>
      <PageHeader
        title="Pacientes Cadastrados"
        description={`${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''} no sistema`}
        action={
          <Button onClick={novoAtendimento}>
            <UserPlus size={16} />
            Novo Atendimento
          </Button>
        }
      />

      {/* Busca */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          placeholder="Buscar paciente por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar paciente"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white
            shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      {pacientesFiltrados.length === 0 ? (
        <EmptyState
          icon={User}
          title="Nenhum paciente encontrado"
          description="Tente outro nome ou cadastre um novo paciente."
          action={
            <Button onClick={novoAtendimento}>
              <UserPlus size={16} />
              Cadastrar Paciente
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pacientesFiltrados.map((p) => {
            const fichas = buscarFichasPorPaciente(p.id)
            const totalFichas = fichas.length
            const ultimaFicha = fichas[0]

            return (
              <Card key={p.id} className="flex flex-col">
                <CardBody className="flex flex-col gap-3">
                  {/* Cabeçalho do card */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full
                      flex items-center justify-center font-bold text-sm shrink-0">
                      {p.nome.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
                      <p className="text-xs text-gray-500">{p.idade} anos</p>
                    </div>
                  </div>

                  {/* Detalhes */}
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
                      Nascimento:{' '}
                      {new Date(p.data_nascimento + 'T00:00').toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <History size={12} className="text-gray-400 shrink-0" />
                      {totalFichas} consulta{totalFichas !== 1 ? 's' : ''} registrada
                      {totalFichas !== 1 ? 's' : ''}
                      {ultimaFicha && (
                        <span className="text-gray-400">
                          · última em{' '}
                          {new Date(ultimaFicha.data_atendimento + 'T00:00').toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ação */}
                  <div className="pt-1 border-t border-gray-100 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => verHistorico(p.id)}
                    >
                      <History size={14} />
                      Ver Histórico
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setTelaAtual('recepcao_novo')
                      }}
                    >
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
