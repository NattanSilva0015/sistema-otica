// Spinner de carregamento reutilizável

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

const colors = {
  indigo:  'border-indigo-600 border-t-transparent',
  white:   'border-white border-t-transparent',
  gray:    'border-gray-400 border-t-transparent',
}

export function Spinner({ size = 'md', color = 'indigo', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Carregando..."
      className={`
        inline-block rounded-full animate-spin
        ${sizes[size]} ${colors[color]} ${className}
      `}
    />
  )
}

// Overlay de tela cheia durante carregamento inicial
export function LoadingScreen({ message = 'Carregando...' }) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
