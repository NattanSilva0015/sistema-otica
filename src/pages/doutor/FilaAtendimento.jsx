import { useState } from 'react'
import { Clock, MessageSquare, ArrowRight, CheckCircle2, Inbox, Droplets, RefreshCw } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { BadgeTipo, BadgeStatus } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'

export function FilaAtendimento() {
  const {
    fichasAguardando,
    fichas,
    buscarPacientePorId,
    atualizarStatusFicha,
    carregarFichasDeHoje,
    setFichaAtivaId,
    setTelaAtual,
  } = useApp()
  const toast = useToast()

  const [iniciandoId, setIniciandoId] = useState(null) // id da ficha sendo iniciada
  const [recarregando, setRecarregando] = useState(false)

  const fila = fichasAguardando()
  const hoje = new Date().toISOString().split('T')[0]
  const emAtendimento = fichas.filter((f) => f.status === 'em_atendimento')
  const finalizadosHoje = fichas.filter((f) => f.status === 'finalizado' && f.data_atendimento === hoje)

  // Paciente pode vir aninhado (JOIN no SELECT) ou no cache de pacientes
  function getPaciente(ficha) {
    return ficha._paciente ?? buscarPacientePorId(ficha.paciente_id)
  }

  async function iniciarAtendimento(ficha) {
    setIniciandoId(ficha.id)
    try {
      await atualizarStatusFicha(ficha.id, 'em_atendimento')
      setFichaAtivaId(ficha.id)
      setTelaAtual('doutor_atendimento')
    } catch (err) {
      toast.error('Erro ao iniciar atendimento', err.message)
    } finally {
      setIniciandoId(null)
    }
  }

  function continuarAtendimento(ficha) {
    setFichaAtivaId(ficha.id)
    setTelaAtual('doutor_atendimento')
  }

  async function recarregar() {
    setRecarregando(true)
    try {
      await carregarFichasDeHoje()
    } catch (err) {
      toast.error('Erro ao atualizar fila', err.message)
    } finally {
      setRecarregando(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Fila de Atendimento"
        description="Pacientes aguardando consulta"
        action={
          <Button variant="secondary" size="sm" onClick={recarregar} disabled={recarregando}>
            {recarregando ? <Spinner size="sm" /> : <RefreshCw size={15} />}
            Atualizar
          </Button>
        }
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <span className="text-2xl font-bold text-yellow-700">{fila.length}</span>
          <p className="text-xs font-medium text-yellow-600 mt-0.5">Aguardando</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-2xl font-bold text-blue-700">{emAtendimento.length}</span>
          <p className="text-xs font-medium text-blue-600 mt-0.5">Em Atendimento</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <span className="text-2xl font-bold text-emerald-700">{finalizadosHoje.length}</span>
          <p className="text-xs font-medium text-emerald-600 mt-0.5">Finalizados Hoje</p>
        </div>
      </div>

      {/* Em atendimento */}
      {emAtendimento.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Em Atendimento Agora</h2>
          <div className="space-y-3">
            {emAtendimento.map((ficha) => {
              const paciente = getPaciente(ficha)
              return (
                <Card key={ficha.id} className="border-blue-200 bg-blue-50/30">
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        {paciente?.nome?.charAt(0) ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">{paciente?.nome}</span>
                          <BadgeTipo tipo={ficha.tipo_atendimento} />
                          <BadgeStatus status={ficha.status} />
                          {ficha.precisa_colicario && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
                              <Droplets size={11} /> Colírio
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{paciente?.idade} anos · {paciente?.telefone}</p>
                      </div>
                      <Button size="sm" onClick={() => continuarAtendimento(ficha)}>
                        Continuar <ArrowRight size={14} />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Fila aguardando */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Aguardando Atendimento
          {fila.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
              {fila.length}
            </span>
          )}
        </h2>

        {fila.length === 0 ? (
          <EmptyState icon={Inbox} title="Fila vazia"
            description="Nenhum paciente aguardando no momento. Quando a recepção abrir fichas, elas aparecerão aqui." />
        ) : (
          <div className="space-y-3">
            {fila.map((ficha, index) => {
              const paciente = getPaciente(ficha)
              const isPrimeiro = index === 0
              const esteIniciando = iniciandoId === ficha.id

              return (
                <Card key={ficha.id} className={isPrimeiro ? 'border-indigo-300 ring-1 ring-indigo-200' : ''}>
                  <CardBody>
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isPrimeiro ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`} aria-label={`Posição ${index + 1} na fila`}>
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {paciente?.nome ?? 'Paciente não encontrado'}
                          </span>
                          <BadgeTipo tipo={ficha.tipo_atendimento} />
                          {isPrimeiro && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Próximo</span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mb-2">
                          {paciente?.idade} anos · {paciente?.telefone}
                        </p>

                        {ficha.precisa_colicario && (
                          <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2 mb-2">
                            <Droplets size={14} className="text-cyan-600 shrink-0" />
                            <p className="text-xs font-semibold text-cyan-800">Paciente precisa de colírio antes da consulta</p>
                          </div>
                        )}

                        {ficha.observacao_recepcao && (
                          <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                            <MessageSquare size={12} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                              <strong className="font-medium">Recepção: </strong>
                              {ficha.observacao_recepcao}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        <Button size="sm" variant={isPrimeiro ? 'primary' : 'secondary'}
                          disabled={esteIniciando} onClick={() => iniciarAtendimento(ficha)}>
                          {esteIniciando ? <Spinner size="sm" color={isPrimeiro ? 'white' : 'indigo'} /> : <>Atender <ArrowRight size={14} /></>}
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Finalizados */}
      {finalizadosHoje.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            Finalizados Hoje
          </h2>
          <div className="space-y-2">
            {finalizadosHoje.map((ficha) => {
              const paciente = getPaciente(ficha)
              return (
                <div key={ficha.id} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-700 flex-1">{paciente?.nome}</span>
                  <BadgeTipo tipo={ficha.tipo_atendimento} />
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
