import { ArrowLeft, Phone, CalendarDays, Eye, FileText, MessageSquare, Clock, User, CreditCard, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { BadgeTipo, BadgeStatus } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'

function LaudoCard({ laudo }) {
  return (
    <div className="mt-3 bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        <FileText size={12} className="text-indigo-400" />
        Laudo de Refração
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* OD */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
            <Eye size={12} /> OD — Olho Direito
          </p>
          <div className="grid grid-cols-3 gap-1 text-center">
            {[
              { label: 'Esf.', value: laudo.od_esferico },
              { label: 'Cil.', value: laudo.od_cilindrico },
              { label: 'Eixo', value: `${laudo.od_eixo}°` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-md py-1.5 px-1 border border-blue-100">
                <p className="text-xs text-blue-500 font-medium leading-tight">{label}</p>
                <p className="text-sm font-bold text-gray-800 font-mono">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* OE */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
          <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
            <Eye size={12} /> OE — Olho Esquerdo
          </p>
          <div className="grid grid-cols-3 gap-1 text-center">
            {[
              { label: 'Esf.', value: laudo.oe_esferico },
              { label: 'Cil.', value: laudo.oe_cilindrico },
              { label: 'Eixo', value: `${laudo.oe_eixo}°` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-md py-1.5 px-1 border border-emerald-100">
                <p className="text-xs text-emerald-500 font-medium leading-tight">{label}</p>
                <p className="text-sm font-bold text-gray-800 font-mono">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {laudo.observacao_medica && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
          <p className="text-xs font-semibold text-gray-500 mb-1">Observações Médicas</p>
          <p className="text-sm text-gray-700 leading-relaxed">{laudo.observacao_medica}</p>
        </div>
      )}

      {laudo.proxima_consulta && (() => {
        const hoje = new Date()
        const proxima = new Date(laudo.proxima_consulta + 'T00:00')
        const diffDias = Math.ceil((proxima - hoje) / (1000 * 60 * 60 * 24))
        const vencida = diffDias < 0
        const proximaSemana = diffDias >= 0 && diffDias <= 30

        return (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 border ${
            vencida
              ? 'bg-red-50 border-red-200'
              : proximaSemana
              ? 'bg-amber-50 border-amber-200'
              : 'bg-indigo-50 border-indigo-100'
          }`}>
            {vencida
              ? <AlertTriangle size={14} className="text-red-500 shrink-0" />
              : <CalendarDays size={14} className={proximaSemana ? 'text-amber-500 shrink-0' : 'text-indigo-500 shrink-0'} />
            }
            <div>
              <p className={`text-xs font-semibold ${vencida ? 'text-red-700' : proximaSemana ? 'text-amber-700' : 'text-indigo-700'}`}>
                {vencida ? 'Retorno vencido' : 'Próxima Consulta'}
              </p>
              <p className={`text-xs ${vencida ? 'text-red-600' : proximaSemana ? 'text-amber-600' : 'text-indigo-600'}`}>
                {proxima.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                {vencida && ` · há ${Math.abs(diffDias)} dias`}
                {proximaSemana && !vencida && ` · em ${diffDias} dias`}
              </p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export function HistoricoPaciente() {
  const {
    pacienteHistoricoId,
    buscarPacientePorId,
    buscarFichasPorPaciente,
    buscarLaudoPorFicha,
    setTelaAtual,
    usuario,
  } = useApp()

  const paciente = buscarPacientePorId(pacienteHistoricoId)
  const fichas = paciente ? buscarFichasPorPaciente(paciente.id) : []

  function voltar() {
    setTelaAtual(usuario === 'recepcao' ? 'recepcao_pacientes' : 'doutor_pacientes')
  }

  if (!paciente) {
    return (
      <EmptyState
        icon={User}
        title="Paciente não encontrado"
        description="Selecione um paciente para ver seu histórico."
        action={
          <Button variant="secondary" onClick={voltar}>
            <ArrowLeft size={16} />
            Voltar
          </Button>
        }
      />
    )
  }

  const totalLaudos = fichas.filter((f) => buscarLaudoPorFicha(f.id) !== null).length

  return (
    <div>
      {/* Voltar */}
      <Button variant="ghost" size="sm" onClick={voltar} className="mb-5 -ml-1">
        <ArrowLeft size={16} />
        Voltar
      </Button>

      {/* Cabeçalho do paciente */}
      <Card className="mb-7">
        <CardBody>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">
              {paciente.nome.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 mb-1">{paciente.nome}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-gray-400" />
                  {paciente.idade} anos ·{' '}
                  {new Date(paciente.data_nascimento + 'T00:00').toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-400" />
                  {paciente.telefone}
                </span>
                {paciente.cpf && (
                  <span className="flex items-center gap-1.5">
                    <CreditCard size={14} className="text-gray-400" />
                    {paciente.cpf}
                  </span>
                )}
              </div>
            </div>
            {/* Resumo numérico */}
            <div className="shrink-0 text-right hidden sm:block">
              <p className="text-2xl font-bold text-gray-900">{fichas.length}</p>
              <p className="text-xs text-gray-500">consulta{fichas.length !== 1 ? 's' : ''}</p>
              <p className="text-xs text-indigo-600 mt-0.5">{totalLaudos} laudo{totalLaudos !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Linha do tempo */}
      {fichas.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Sem histórico de consultas"
          description="Este paciente ainda não possui fichas registradas."
        />
      ) : (
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 pointer-events-none" aria-hidden="true" />

          <ol className="space-y-6 pl-14" aria-label="Linha do tempo de consultas">
            {fichas.map((ficha, index) => {
              const laudo = buscarLaudoPorFicha(ficha.id)
              const isRecente = index === 0

              return (
                <li key={ficha.id} className="relative">
                  {/* Marcador da linha do tempo */}
                  <div
                    className={`
                      absolute -left-9 top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm
                      ${
                        ficha.status === 'finalizado'
                          ? isRecente
                            ? 'bg-indigo-600'
                            : 'bg-gray-400'
                          : ficha.status === 'em_atendimento'
                          ? 'bg-blue-500'
                          : 'bg-yellow-400'
                      }
                    `}
                    aria-hidden="true"
                  />

                  <Card className={isRecente ? 'border-indigo-200 shadow-md' : ''}>
                    <CardHeader className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {new Date(ficha.data_atendimento + 'T00:00').toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <BadgeTipo tipo={ficha.tipo_atendimento} />
                        <BadgeStatus status={ficha.status} />
                        {isRecente && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                            Mais recente
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardBody>
                      {ficha.observacao_recepcao && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                          <MessageSquare size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-amber-700 mb-0.5">Obs. da Recepção</p>
                            <p className="text-xs text-amber-800 leading-relaxed">
                              {ficha.observacao_recepcao}
                            </p>
                          </div>
                        </div>
                      )}

                      {laudo ? (
                        <LaudoCard laudo={laudo} />
                      ) : ficha.status !== 'finalizado' ? (
                        <p className="text-xs text-gray-400 italic">
                          Consulta ainda não finalizada — laudo pendente.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          Nenhum laudo registrado para esta consulta.
                        </p>
                      )}
                    </CardBody>
                  </Card>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
