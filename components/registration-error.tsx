'use client'

import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RegistrationError } from '@/lib/error-handler'
import { getErrorSeverity } from '@/lib/error-handler'

interface RegistrationErrorProps {
  error: RegistrationError | null
  onRetry: () => void
  isRetrying?: boolean
}

export function RegistrationErrorDisplay({
  error,
  onRetry,
  isRetrying = false,
}: RegistrationErrorProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!error) return null

  const severity = getErrorSeverity(error.category)

  const severityStyles = {
    error: {
      container: 'border-red-200 bg-red-50',
      icon: 'text-red-600',
      header: 'text-red-800',
      detail: 'text-red-700',
      button: 'hover:bg-red-100',
    },
    warning: {
      container: 'border-amber-200 bg-amber-50',
      icon: 'text-amber-600',
      header: 'text-amber-800',
      detail: 'text-amber-700',
      button: 'hover:bg-amber-100',
    },
    info: {
      container: 'border-blue-200 bg-blue-50',
      icon: 'text-blue-600',
      header: 'text-blue-800',
      detail: 'text-blue-700',
      button: 'hover:bg-blue-100',
    },
  }

  const style = severityStyles[severity]

  return (
    <div
      className={`border rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 ${style.container}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Main Error Message */}
      <div className="flex gap-3">
        <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${style.icon}`} />
        <div className="flex-1">
          <h3 className={`font-semibold text-sm mb-1 ${style.header}`}>
            Qayta ko'rib chiq ro'yxatdan o'tishda xatolik yuz berdi
          </h3>
          <p className={`text-sm ${style.detail}`}>{error.message}</p>
        </div>
      </div>

      {/* Error Details Toggle */}
      {error.details && (
        <div className="border-t border-opacity-30 pt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`flex items-center gap-2 text-sm font-medium ${style.detail} hover:underline transition-colors`}
            type="button"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Tafsilotlarni yashirish
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Tafsilotlarni ko'rsatish
              </>
            )}
          </button>

          {showDetails && (
            <div className={`mt-2 p-3 rounded bg-black bg-opacity-5 border-l-2 ${style.detail}`}>
              <p className="text-xs font-mono break-words whitespace-pre-wrap">
                {error.details}
              </p>
              <p className="text-xs mt-2 opacity-75">
                Vaqt: {new Date(error.timestamp).toLocaleString('uz-UZ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        {error.retryable && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            size="sm"
            variant="outline"
            className={`gap-2 ${style.button}`}
          >
            <RotateCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Qayta urinmoqda...' : 'Qayta urini'}
          </Button>
        )}
        <Button
          onClick={() => {
            // Clear error by parent component
            const event = new CustomEvent('clearError')
            window.dispatchEvent(event)
          }}
          size="sm"
          variant="ghost"
          className={style.detail}
        >
          Yopish
        </Button>
      </div>

      {/* Network Error Helpful Tip */}
      {error.category === 'NETWORK_ERROR' && (
        <div className={`text-xs ${style.detail} italic pt-2 border-t border-opacity-30`}>
          💡 Maslahat: Internet ulanishini tekshiring va qayta urining.
        </div>
      )}

      {/* Email Already Exists Helpful Tip */}
      {error.category === 'EMAIL_ALREADY_EXISTS' && (
        <div className={`text-xs ${style.detail} italic pt-2 border-t border-opacity-30`}>
          💡 Maslahat: "Tizimga kirish" sahifasida mavjud akkauntingizdan foydalanib kiring yoki
          boshqa elektron pochta manzildan ro'yxatdan o'tib ko'ring.
        </div>
      )}
    </div>
  )
}
