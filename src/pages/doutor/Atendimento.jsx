import { useState } from 'react'
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  FileText,
  History,
  CheckCircle2,
  Save,
  AlertCircle,
  Droplets,
  CalendarDays,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { BadgeTipo } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'

// ─── Subcomponente: Campos de refração OD/OE ────────────────────────────────
function CamposOlho({ prefixo, label, cor, valores, onChange }) {
  return (
    <div className={`rounded-xl border-2 p-4 ${cor}`}>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Eye size={15} />
        {label}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <Input
          id={`${prefixo}_esferico`}
          label="Esférico"
          placeholder="-2.00"
          value={valores[`${prefixo}_esferico`]}
          onChange={(e) => onChange(`${prefixo}_esferico`, e.target.value)}
        />
        <Input
          id={`${prefixo}_cilindrico`}
          label="Cilíndrico"
          placeholder="-0.50"
          value={valores[`${prefixo}_cilindrico`]}
          onChange={(e) => onChange(`${prefixo}_cilindrico`, e.target.value)}
        />
        <Input
          id={`${prefixo}_eixo`}
          label="Eixo (°)"
          placeholder="180"
          value={valores[`${prefixo}_eixo`]}
          onChange={(e) => onChange(`${prefixo}_eixo`, e.target.value)}
        />
      </div>
    </div>
  )
}

const laudoVazio = {
  od_esferico: '',
  od_cilindrico: '',
  od_eixo: '',
  oe_esferico: '',
  oe_cilindrico: '',
  oe_eixo: '',
  observacao_medica: '',
  proxima_consulta: '',
}

export function Atendimento() {
  const {
    fichaAtivaId,
    fichas,
    buscarPacientePorId,
    buscarFichasPorPaciente,
    buscarLaudoPorFicha,
    salvarLaudo,
    setTelaAtual,
    setFichaAtivaId,
  } = useApp()

  const [laudoForm, setLaudoForm] = useState(laudoVazio)
  const [salvo, setSalvo] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')

  const ficha = fichas.find((f) => f.id === fichaAtivaId)
  const paciente = ficha ? buscarPacientePorId(ficha.paciente_id) : null
  const fichasAnteriores = paciente
    ? buscarFichasPorPaciente(paciente.id).filter(
        (f) => f.id !== fichaAtivaId && f.status === 'finalizado'
      )
    : []

  const laudoExistente = ficha ? buscarLaudoPorFicha(ficha.id) : null

  if (!ficha || !paciente) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={40} className="text-red-400 mb-3" />
        <p className="text-gray-600 font-medium">Nenhuma ficha selecionada.</p>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => setTelaAtual('doutor_fila')}
        >
          <ArrowLeft size={16} />
          Voltar à Fila
        </Button>
      </div>
    )
  }

  function handleCampoLaudo(campo, valor) {
    setLaudoForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleSalvar(e) {
    e.preventDefault()
    const camposOd = ['od_esferico', 'od_cilindrico', 'od_eixo']
    const camposOe = ['oe_esferico', 'oe_cilindrico', 'oe_eixo']
    const todosCampos = [...camposOd, ...camposOe]
    const algumVazio = todosCampos.some((c) => !laudoForm[c].trim())
    if (algumVazio) {
      setErroSalvar('Preencha todos os campos de refração do OD e OE.')
      return
    }
    setErroSalvar('')
    salvarLaudo(ficha.id, laudoForm)
    setSalvo(true)
  }

  function voltarFila() {
    setFichaAtivaId(null)
    setTelaAtual('doutor_fila')
  }

  // ─── Tela de sucesso ──────────────────────────────────────────────────────
  if (salvo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={36} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">Laudo salvo com sucesso!</p>
          <p className="text-sm text-gray-500 mt-1">
            Ficha de <span className="font-medium text-gray-700">{paciente.nome}</span> finalizada.
          </p>
        </div>
        <Button onClick={voltarFila}>
          <ArrowLeft size={16} />
          Voltar à Fila
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Navegação */}
      <Button variant="ghost" size="sm" onClick={voltarFila} className="mb-5 -ml-1">
        <ArrowLeft size={16} />
        Voltar à Fila
      </Button>

      {/* Cabeçalho do paciente */}
      <div className="flex items-start gap-4 mb-6 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-base shrink-0">
          {paciente.nome.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h1 className="text-base font-bold text-gray-900">{paciente.nome}</h1>
            <BadgeTipo tipo={ficha.tipo_atendimento} />
          </div>
          <p className="text-sm text-gray-500">
            {paciente.idade} anos ·{' '}
            {new Date(paciente.data_nascimento + 'T00:00').toLocaleDateString('pt-BR')} ·{' '}
            {paciente.telefone}
            {paciente.cpf && <span className="ml-2 text-gray-400">· CPF: {paciente.cpf}</span>}
          </p>
        </div>
      </div>

      {/* Alerta de colírio — aparece logo após o cabeçalho do paciente */}
      {ficha.precisa_colicario && (
        <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-cyan-50 border-2 border-cyan-300 rounded-xl">
          <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center shrink-0">
            <Droplets size={20} className="text-cyan-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-cyan-900">Colírio necessário</p>
            <p className="text-xs text-cyan-700">
              Este paciente precisa de colírio para dilatar a pupila antes da consulta.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Coluna esquerda: observações + histórico */}
        <div className="lg:col-span-1 space-y-4">
          {/* Observações da recepção */}
          {ficha.observacao_recepcao && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageSquare size={15} className="text-amber-500" />
                  Obs. da Recepção
                </h2>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-gray-700 leading-relaxed bg-amber-50 rounded-lg p-3 border border-amber-100">
                  {ficha.observacao_recepcao}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Histórico de consultas */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <History size={15} className="text-indigo-500" />
                Histórico ({fichasAnteriores.length})
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              {fichasAnteriores.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 px-4">
                  Primeira consulta deste paciente.
                </p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {fichasAnteriores.map((f) => {
                    const laudo = buscarLaudoPorFicha(f.id)
                    return (
                      <li key={f.id} className="px-5 py-3">
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">
                          {new Date(f.data_atendimento + 'T00:00').toLocaleDateString('pt-BR')} ·{' '}
                          {f.tipo_atendimento}
                        </p>
                        {laudo && (
                          <div className="text-xs text-gray-500 font-mono bg-gray-50 rounded-md p-2 mt-1 space-y-0.5">
                            <p>
                              <span className="font-semibold text-gray-700">OD:</span>{' '}
                              {laudo.od_esferico} / {laudo.od_cilindrico} / {laudo.od_eixo}°
                            </p>
                            <p>
                              <span className="font-semibold text-gray-700">OE:</span>{' '}
                              {laudo.oe_esferico} / {laudo.oe_cilindrico} / {laudo.oe_eixo}°
                            </p>
                            {laudo.observacao_medica && (
                              <p className="font-sans text-gray-500 mt-1 not-italic">
                                {laudo.observacao_medica}
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Coluna direita: formulário do laudo */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText size={15} className="text-indigo-500" />
                {laudoExistente ? 'Laudo Registrado' : 'Preencher Laudo de Refração'}
              </h2>
            </CardHeader>
            <CardBody>
              {laudoExistente ? (
                /* Laudo já salvo — exibição */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border-2 border-blue-100 p-4 bg-blue-50/40">
                      <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Eye size={14} /> Olho Direito (OD)
                      </h3>
                      <p className="text-xs text-gray-600 font-mono">
                        Esf: {laudoExistente.od_esferico} · Cil: {laudoExistente.od_cilindrico} · Eixo: {laudoExistente.od_eixo}°
                      </p>
                    </div>
                    <div className="rounded-xl border-2 border-emerald-100 p-4 bg-emerald-50/40">
                      <h3 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                        <Eye size={14} /> Olho Esquerdo (OE)
                      </h3>
                      <p className="text-xs text-gray-600 font-mono">
                        Esf: {laudoExistente.oe_esferico} · Cil: {laudoExistente.oe_cilindrico} · Eixo: {laudoExistente.oe_eixo}°
                      </p>
                    </div>
                  </div>
                  {laudoExistente.observacao_medica && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Observações Médicas</p>
                      <p className="text-sm text-gray-700">{laudoExistente.observacao_medica}</p>
                    </div>
                  )}
                  {laudoExistente.proxima_consulta && (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                      <CalendarDays size={16} className="text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-indigo-700">Próxima Consulta</p>
                        <p className="text-sm text-indigo-900 font-medium">
                          {new Date(laudoExistente.proxima_consulta + 'T00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button onClick={voltarFila}>
                      <ArrowLeft size={16} />
                      Voltar à Fila
                    </Button>
                  </div>
                </div>
              ) : (
                /* Formulário */
                <form onSubmit={handleSalvar} noValidate>
                  <div className="space-y-4">
                    <CamposOlho
                      prefixo="od"
                      label="Olho Direito (OD)"
                      cor="border-blue-100 bg-blue-50/30 text-blue-800"
                      valores={laudoForm}
                      onChange={handleCampoLaudo}
                    />
                    <CamposOlho
                      prefixo="oe"
                      label="Olho Esquerdo (OE)"
                      cor="border-emerald-100 bg-emerald-50/30 text-emerald-800"
                      valores={laudoForm}
                      onChange={handleCampoLaudo}
                    />
                    <Textarea
                      id="observacao_medica"
                      label="Observações Médicas"
                      placeholder="Ex: Miopia leve bilateral. Recomendo uso contínuo dos óculos e retorno em 12 meses."
                      rows={4}
                      value={laudoForm.observacao_medica}
                      onChange={(e) => handleCampoLaudo('observacao_medica', e.target.value)}
                    />

                    <Input
                      id="proxima_consulta"
                      label="Próxima Consulta (Retorno)"
                      type="date"
                      value={laudoForm.proxima_consulta}
                      onChange={(e) => handleCampoLaudo('proxima_consulta', e.target.value)}
                    />

                    {erroSalvar && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                        <AlertCircle size={16} className="shrink-0" />
                        {erroSalvar}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <Button variant="secondary" type="button" onClick={voltarFila}>
                        <ArrowLeft size={16} />
                        Cancelar
                      </Button>
                      <Button type="submit" variant="success">
                        <Save size={16} />
                        Salvar Laudo e Finalizar Ficha
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
