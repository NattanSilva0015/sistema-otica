import { useState } from 'react'
import { UserPlus, ClipboardList, ChevronDown, CheckCircle2, Droplets } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'

const tiposAtendimento = [
  'Primeira Consulta',
  'Retorno',
  'Acompanhamento',
  'Garantia/Ajuste',
]

const campoVazio = {
  nome: '',
  data_nascimento: '',
  telefone: '',
}

const fichaVazia = {
  paciente_id: '',
  tipo_atendimento: 'Primeira Consulta',
  observacao_recepcao: '',
  precisa_colicario: false,
}

function calcularIdade(data_nascimento) {
  if (!data_nascimento) return null
  const hoje = new Date()
  const nasc = new Date(data_nascimento)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

export function NovoAtendimento() {
  const { pacientes, adicionarPaciente, abrirFicha, setTelaAtual } = useApp()

  // Controle de etapas: 'paciente' → 'ficha' → 'sucesso'
  const [etapa, setEtapa] = useState('paciente')
  const [modoNovoPaciente, setModoNovoPaciente] = useState(true)
  const [buscaPaciente, setBuscaPaciente] = useState('')

  const [dadosPaciente, setDadosPaciente] = useState(campoVazio)
  const [dadosFicha, setDadosFicha] = useState(fichaVazia)
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [erros, setErros] = useState({})
  const [fichaAberta, setFichaAberta] = useState(null)

  // ─── Busca de paciente existente ────────────────────────────────────────
  const pacientesFiltrados = buscaPaciente.trim()
    ? pacientes.filter((p) =>
        p.nome.toLowerCase().includes(buscaPaciente.toLowerCase())
      )
    : pacientes.slice(0, 6)

  function selecionarPacienteExistente(p) {
    setPacienteSelecionado(p)
    setDadosFicha((prev) => ({ ...prev, paciente_id: p.id }))
    setEtapa('ficha')
  }

  // ─── Validação etapa paciente ────────────────────────────────────────────
  function validarNovoPaciente() {
    const e = {}
    if (!dadosPaciente.nome.trim()) e.nome = 'Nome obrigatório'
    if (!dadosPaciente.data_nascimento) e.data_nascimento = 'Data de nascimento obrigatória'
    if (!dadosPaciente.telefone.trim()) e.telefone = 'Telefone obrigatório'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function avancarComNovoPaciente() {
    if (!validarNovoPaciente()) return
    const idade = calcularIdade(dadosPaciente.data_nascimento)
    const novo = adicionarPaciente({ ...dadosPaciente, idade })
    setPacienteSelecionado(novo)
    setDadosFicha((prev) => ({ ...prev, paciente_id: novo.id }))
    setEtapa('ficha')
  }

  // ─── Salvar ficha ────────────────────────────────────────────────────────
  function salvarFicha(e) {
    e.preventDefault()
    const ficha = abrirFicha(dadosFicha)
    setFichaAberta(ficha)
    setEtapa('sucesso')
  }

  function resetar() {
    setEtapa('paciente')
    setModoNovoPaciente(true)
    setBuscaPaciente('')
    setDadosPaciente(campoVazio)
    setDadosFicha(fichaVazia)
    setPacienteSelecionado(null)
    setErros({})
    setFichaAberta(null)
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Novo Atendimento"
        description="Cadastre ou selecione um paciente e abra a ficha de atendimento."
      />

      {/* Indicador de etapas */}
      <div className="flex items-center gap-2 mb-8">
        {['paciente', 'ficha', 'sucesso'].map((step, i) => {
          const labels = ['1. Paciente', '2. Ficha', '3. Confirmação']
          const isDone =
            (step === 'paciente' && (etapa === 'ficha' || etapa === 'sucesso')) ||
            (step === 'ficha' && etapa === 'sucesso')
          const isActive = etapa === step
          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone && <CheckCircle2 size={12} />}
                {labels[i]}
              </div>
              {i < 2 && <div className="w-6 h-px bg-gray-200" />}
            </div>
          )
        })}
      </div>

      {/* ── ETAPA 1: Paciente ── */}
      {etapa === 'paciente' && (
        <div className="space-y-4">
          {/* Toggle novo / existente */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModoNovoPaciente(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                modoNovoPaciente
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <UserPlus size={16} />
              Novo Paciente
            </button>
            <button
              type="button"
              onClick={() => setModoNovoPaciente(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                !modoNovoPaciente
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ClipboardList size={16} />
              Paciente Existente
            </button>
          </div>

          {/* Formulário novo paciente */}
          {modoNovoPaciente ? (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <UserPlus size={16} className="text-indigo-500" />
                  Dados do Novo Paciente
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      id="nome"
                      label="Nome completo"
                      placeholder="Ex: Maria Aparecida Santos"
                      required
                      value={dadosPaciente.nome}
                      onChange={(e) =>
                        setDadosPaciente((prev) => ({ ...prev, nome: e.target.value }))
                      }
                      error={erros.nome}
                    />
                  </div>
                  <Input
                    id="data_nascimento"
                    label="Data de nascimento"
                    type="date"
                    required
                    value={dadosPaciente.data_nascimento}
                    onChange={(e) =>
                      setDadosPaciente((prev) => ({
                        ...prev,
                        data_nascimento: e.target.value,
                      }))
                    }
                    error={erros.data_nascimento}
                  />
                  <Input
                    id="telefone"
                    label="Telefone / WhatsApp"
                    placeholder="(11) 99999-9999"
                    required
                    value={dadosPaciente.telefone}
                    onChange={(e) =>
                      setDadosPaciente((prev) => ({ ...prev, telefone: e.target.value }))
                    }
                    error={erros.telefone}
                  />
                </div>
                <div className="mt-5 flex justify-end">
                  <Button onClick={avancarComNovoPaciente}>
                    Continuar para Ficha
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            /* Busca paciente existente */
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-gray-700">Buscar Paciente</h2>
              </CardHeader>
              <CardBody>
                <Input
                  id="busca"
                  placeholder="Digite o nome do paciente..."
                  value={buscaPaciente}
                  onChange={(e) => setBuscaPaciente(e.target.value)}
                  className="mb-4"
                />
                <ul className="divide-y divide-gray-100" role="listbox" aria-label="Pacientes encontrados">
                  {pacientesFiltrados.length === 0 ? (
                    <li className="py-6 text-center text-sm text-gray-400">
                      Nenhum paciente encontrado.
                    </li>
                  ) : (
                    pacientesFiltrados.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          role="option"
                          onClick={() => selecionarPacienteExistente(p)}
                          className="w-full flex items-center justify-between py-3 px-2 rounded-lg
                            hover:bg-indigo-50 transition-colors text-left group"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">
                              {p.nome}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.idade} anos · {p.telefone}
                            </p>
                          </div>
                          <ChevronDown
                            size={16}
                            className="text-gray-300 group-hover:text-indigo-500 rotate-[-90deg]"
                          />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* ── ETAPA 2: Ficha ── */}
      {etapa === 'ficha' && pacienteSelecionado && (
        <div className="space-y-4">
          {/* Resumo do paciente */}
          <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
              {pacienteSelecionado.nome.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-900">{pacienteSelecionado.nome}</p>
              <p className="text-xs text-indigo-600">
                {pacienteSelecionado.idade} anos · {pacienteSelecionado.telefone}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setEtapa('paciente'); setPacienteSelecionado(null) }}
              className="ml-auto text-xs text-indigo-500 hover:text-indigo-700 underline"
            >
              Alterar
            </button>
          </div>

          <form onSubmit={salvarFicha}>
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ClipboardList size={16} className="text-indigo-500" />
                  Dados da Ficha de Atendimento
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Select
                  id="tipo_atendimento"
                  label="Tipo de Atendimento"
                  required
                  value={dadosFicha.tipo_atendimento}
                  onChange={(e) =>
                    setDadosFicha((prev) => ({ ...prev, tipo_atendimento: e.target.value }))
                  }
                >
                  {tiposAtendimento.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>

                <Textarea
                  id="observacao_recepcao"
                  label="Observações da Recepção"
                  placeholder="Ex: Paciente trouxe óculos antigo, relata dor de cabeça ao ler..."
                  rows={4}
                  value={dadosFicha.observacao_recepcao}
                  onChange={(e) =>
                    setDadosFicha((prev) => ({
                      ...prev,
                      observacao_recepcao: e.target.value,
                    }))
                  }
                />

                {/* Colírio */}
                <label
                  htmlFor="precisa_colicario"
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors select-none ${
                    dadosFicha.precisa_colicario
                      ? 'border-cyan-400 bg-cyan-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <input
                    id="precisa_colicario"
                    type="checkbox"
                    className="w-4 h-4 accent-cyan-600 shrink-0"
                    checked={dadosFicha.precisa_colicario}
                    onChange={(e) =>
                      setDadosFicha((prev) => ({
                        ...prev,
                        precisa_colicario: e.target.checked,
                      }))
                    }
                  />
                  <Droplets
                    size={18}
                    className={dadosFicha.precisa_colicario ? 'text-cyan-600' : 'text-gray-400'}
                  />
                  <div>
                    <p className={`text-sm font-semibold ${dadosFicha.precisa_colicario ? 'text-cyan-800' : 'text-gray-700'}`}>
                      Paciente precisa de colírio
                    </p>
                    <p className="text-xs text-gray-500">
                      Marque se for necessário dilatar a pupila antes da consulta
                    </p>
                  </div>
                </label>

                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setEtapa('paciente')}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" variant="success">
                    <ClipboardList size={16} />
                    Abrir Ficha na Fila
                  </Button>
                </div>
              </CardBody>
            </Card>
          </form>
        </div>
      )}

      {/* ── ETAPA 3: Sucesso ── */}
      {etapa === 'sucesso' && fichaAberta && (
        <Card>
          <CardBody className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">Ficha aberta com sucesso!</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium text-gray-700">{pacienteSelecionado?.nome}</span>{' '}
                foi adicionado(a) à fila de atendimento.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tipo: <strong>{fichaAberta.tipo_atendimento}</strong>
              </p>
              {fichaAberta.precisa_colicario && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-semibold">
                  <Droplets size={13} />
                  Colírio necessário
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="secondary" onClick={() => setTelaAtual('recepcao_fichas')}>
                Ver Fichas do Dia
              </Button>
              <Button onClick={resetar}>
                <UserPlus size={16} />
                Novo Atendimento
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
