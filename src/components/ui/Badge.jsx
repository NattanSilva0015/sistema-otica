// Badge para tipo de atendimento e status da ficha

const tipoVariants = {
  'Primeira Consulta': 'bg-blue-100 text-blue-800 border-blue-200',
  'Retorno': 'bg-purple-100 text-purple-800 border-purple-200',
  'Acompanhamento': 'bg-amber-100 text-amber-800 border-amber-200',
  'Garantia/Ajuste': 'bg-rose-100 text-rose-800 border-rose-200',
}

const statusVariants = {
  aguardando: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  em_atendimento: 'bg-blue-100 text-blue-800 border-blue-200',
  finalizado: 'bg-green-100 text-green-800 border-green-200',
}

const statusLabels = {
  aguardando: 'Aguardando',
  em_atendimento: 'Em Atendimento',
  finalizado: 'Finalizado',
}

export function BadgeTipo({ tipo }) {
  const classes = tipoVariants[tipo] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}
    >
      {tipo}
    </span>
  )
}

export function BadgeStatus({ status }) {
  const classes = statusVariants[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}
    >
      {statusLabels[status] ?? status}
    </span>
  )
}
