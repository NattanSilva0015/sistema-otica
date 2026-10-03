// Campos de formulário reutilizáveis

export function Input({
  label,
  id,
  error,
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        required={required}
        className={`
          w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
          placeholder:text-gray-400 shadow-sm
          focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Select({
  label,
  id,
  error,
  children,
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={id}
        required={required}
        className={`
          w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
          shadow-sm bg-white
          focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-400' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Textarea({
  label,
  id,
  error,
  className = '',
  required = false,
  rows = 3,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={id}
        required={required}
        rows={rows}
        className={`
          w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
          placeholder:text-gray-400 shadow-sm resize-none
          focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-400' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
