import { CalendarDays, Clock, CheckCircle2, Loader2, MessageSquare, UserPlus, Droplets } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { BadgeTipo, BadgeStatus } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'

const statusIcon = {
  aguardando: Clock,
  em_atendimento: Loader2,
  finalizado: CheckCircle2,
}

const statusCor = {
  aguardando: 'text-yellow-500',
  em_atendimento: 'text-blue-500',
  finalizado: 'text-emerald-500',
}

function formatarHora(dataStr) {
  // Mock: usa hora atual para fichas de hoje, data de criação para históricas
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function FichasDoDia() {
  const { fichasDeHoje, buscarPacientePorId, setTelaAtual } = useApp()
  const fichas = fichasDeHoje()

  const contadores = {
    total: fichas.length,
    aguardando: fichas.filter((f) => f.status === 'aguardando').length,
    em_atendimento: fichas.filter((f) => f.status === 'em_atendimento').length,
    finalizado: fichas.filter((f) => f.status === 'finalizado').length,
  }

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <PageHeader
        title="Fichas do Dia"
        description={hoje.charAt(0).toUpperCase() + hoje.slice(1)}
        action={
          <Button onClick={() => setTelaAtual('recepcao_novo')}>
            <UserPlus size={16} />
            Novo Atendimento
          </Button>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          { label: 'Total', value: contadores.total, cor: 'bg-gray-50 border-gray-200 text-gray-700' },
          { label: 'Aguardando', value: contadores.aguardando, cor: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Em Atendimento', value: contadores.em_atendimento, cor: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Finalizados', value: contadores.finalizado, cor: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        ].map(({ label, value, cor }) => (
          <div
            key={label}
            className={`rounded-xl border px-4 py-3 flex flex-col gap-0.5 ${cor}`}
          >
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Lista de fichas */}
      {fichas.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum atendimento hoje"
          description="Abra uma nova ficha para iniciar os atendimentos do dia."
          action={
            <Button onClick={() => setTelaAtual('recepcao_novo')}>
              <UserPlus size={16} />
              Abrir Primeira Ficha
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {fichas.map((ficha) => {
            const paciente = buscarPacientePorId(ficha.paciente_id)
            const StatusIcon = statusIcon[ficha.status] ?? Clock

            return (
              <Card key={ficha.id}>
                <CardBody>
                  <div className="flex items-start gap-4">
                    {/* Ícone de status */}
                    <div className="shrink-0 mt-0.5">
                      <StatusIcon
                        size={20}
                        className={`${statusCor[ficha.status]} ${
                          ficha.status === 'em_atendimento' ? 'animate-spin' : ''
                        }`}
                      />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {paciente?.nome ?? 'Paciente não encontrado'}
                        </span>
                        <BadgeTipo tipo={ficha.tipo_atendimento} />
                        <BadgeStatus status={ficha.status} />
                        {ficha.precisa_colicario && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
                            <Droplets size={11} />
                            Colírio
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mb-2">
                        {paciente?.idade} anos · {paciente?.telefone}
                      </p>

                      {ficha.observacao_recepcao && (
                        <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          <MessageSquare size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 leading-relaxed">
                            {ficha.observacao_recepcao}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Horário */}
                    <div className="shrink-0 text-right hidden sm:block">
                      <p className="text-xs text-gray-400">
                        {new Date(ficha.data_atendimento + 'T00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
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
