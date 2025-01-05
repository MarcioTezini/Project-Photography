'use client'

import { useState, useEffect } from 'react'
import { useQuill } from 'react-quilljs'
import 'quill/dist/quill.snow.css'
import './styles.css'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

interface ValidationMessage {
  message: string
  isValid?: boolean
}

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number // Propriedade opcional para limitar os caracteres
  validationMessages?: ValidationMessage[]
  variant?: 'error' | 'alert' | 'success' | 'info'
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
  ],
}

const variantClasses = {
  error: 'variant-error',
  alert: 'variant-alert',
  success: 'variant-success',
  info: 'variant-info',
}

export default function TextEditor({
  value,
  onChange,
  maxLength,
  validationMessages,
  variant,
}: TextEditorProps) {
  const { quill, quillRef } = useQuill({ theme: 'snow', modules })
  const [text, setText] = useState('')

  // Sincroniza o valor inicial quando o quill está pronto
  useEffect(() => {
    if (quill && value !== text) {
      quill.clipboard.dangerouslyPasteHTML(value || '')
      setText(value || '') // Atualiza o estado local com o valor inicial
    }
  }, [value, quill])

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        const content = quill.root.innerHTML

        // Verifica se o conteúdo é o valor "<p><br></p>" e trata como vazio
        const cleanedContent = content === '<p><br></p>' ? '' : content

        let plainText = quill.getText().trim() // Obtém o texto sem formatação e remove espaços extras

        // Verifica o comprimento do texto sem formatação e ajusta conforme maxLength
        if (maxLength && plainText.length > maxLength) {
          plainText = plainText.substring(0, maxLength) // Limita o texto ao maxLength
          quill.deleteText(maxLength, plainText.length) // Remove qualquer caractere adicional
        }

        setText(cleanedContent) // Atualiza o estado local com o novo conteúdo
        onChange(cleanedContent) // Dispara a função onChange para o componente pai
      })
    }
  }, [quill, onChange, maxLength])

  const defaultVariantClass = 'variant-default'
  const variantClass = variant ? variantClasses[variant] : defaultVariantClass

  return (
    <div className={`relative w-full ${variantClass}`}>
      <div ref={quillRef} className={`ql-container ql-snow ${variantClass}`} />
      {maxLength && quill && (
        <div
          className={`absolute ${validationMessages && validationMessages.length > 0 ? 'bottom-[30px]' : 'bottom-xs'} right-xs ${
            maxLength - Math.min(quill?.getText()?.trim()?.length || 0) === 0
              ? 'text-notify-warning-normal'
              : 'text-grey-700'
          }`}
        >
          {maxLength - Math.min(quill?.getText()?.trim()?.length || 0)}
        </div>
      )}
      {validationMessages && validationMessages.length > 0 && (
        <div className="flex flex-col gap-xxs mt-xs">
          {validationMessages.map((valMsg) => (
            <p
              key={valMsg.message}
              className="flex gap-xxs items-center text-LABEL-L font-Medium text-notify-warning-darkest"
            >
              {valMsg.isValid ? (
                <FiCheckCircle className="w-[12px] h-[12px] text-notify-success-darkest" />
              ) : (
                <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
              )}
              {valMsg.message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
