import React, { useCallback, useEffect, useState } from 'react'
import { DropzoneState, useDropzone } from 'react-dropzone'
import Image from 'next/image'
import {
  FiAlertCircle,
  FiAlertOctagon,
  FiCheckCircle,
  FiPlusCircle,
  FiRefreshCw,
  FiTrash2,
} from 'react-icons/fi'
interface ValidationMessage {
  message: string
  isValid?: boolean
}
interface InputProps {
  dropzone: DropzoneState
  primaryText: string
  secondaryText: string
  className?: string
  validationMessages?: ValidationMessage[]
  error?: string
  typeResolutionText?: string
  resolutionNumber?: string
  reserveSpaceForMessages?: boolean
}
interface HasFileProps {
  file?: File
  removeFile: () => void
  openDropzone: () => void
  className?: string
  validationMessages?: ValidationMessage[]
  typeResolutionText?: string
  resolutionNumber?: string
  value?: string
  width?: number
  height?: number
  reserveSpaceForMessages?: boolean
}
interface FilesPreviewProps {
  file?: File
  removeFile: () => void
  openDropzone: () => void
  value?: string
  width?: number
  height?: number
}
interface DropzoneProps {
  accept: { [key: string]: string[] }
  primaryText: string
  secondaryText: string
  value?: string | string[]
  onChange?: (file: File | null) => void
  className?: string
  validationMessages?: ValidationMessage[]
  typeResolutionText?: string
  resolutionNumber?: string
  width?: number
  height?: number
  reserveSpaceForMessages?: boolean
}
interface DropzoneFile extends File {
  height?: number
  width?: number
  path?: string
}
const FilesPreview: React.FC<FilesPreviewProps> = ({
  file,
  removeFile,
  openDropzone,
  value,
  width,
  height,
}) => {
  let fileUrl: string
  if (file) {
    fileUrl = URL.createObjectURL(file)
  } else {
    fileUrl = value ?? ''
  }
  return (
    <div className="w-full h-full p-s flex justify-center items-center relative group">
      <Image
        src={fileUrl}
        alt={file?.name ?? ''}
        width={width}
        height={height}
        className="max-h-[120px] shadow-md"
      />
      <div className="max-w-[90%] max-h-[90%] m-auto absolute inset-0 flex items-center justify-center bg-a-black-80 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex text-center items-center gap-xm">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              openDropzone()
            }}
            className="text-white"
          >
            <FiRefreshCw className="text-H5 text-a-white-80" />
          </button>
          <p className="text-BODY-M text-a-white-80">|</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeFile()
            }}
            className="text-white"
          >
            <FiTrash2 className="text-H5 text-a-white-80" />
          </button>
        </div>
      </div>
    </div>
  )
}
const HasFile: React.FC<HasFileProps> = ({
  file,
  removeFile,
  openDropzone,
  className,
  validationMessages,
  typeResolutionText,
  resolutionNumber,
  value,
  width,
  height,
  reserveSpaceForMessages = false,
}) => {
  const isImage = file?.type.startsWith('image/')
  const iconClass =
    Array.isArray(validationMessages) && validationMessages.length > 0
      ? 'text-notify-warning-normal'
      : 'text-notify-alert-normal'
  return (
    <div className="w-[100%] ">
      <div
        className={`min-h-[141px] max-h-[120px] rounded-sm border-dashed border-2 border-notify-info-normal bg-a-blue-5 flex ${className}`}
      >
        <div className="w-full bg-white rounded-md shadow-md flex gap-3 items-center justify-center">
          {isImage ? (
            <FilesPreview
              file={file}
              removeFile={removeFile}
              openDropzone={openDropzone}
              width={width}
              height={height}
            />
          ) : (
            <FilesPreview
              value={value}
              removeFile={removeFile}
              openDropzone={openDropzone}
              width={width}
              height={height}
            />
          )}
        </div>
      </div>
      <div
        className={`flex justify-between items-center border rounded-sm border-solid border-notify-alert-normal p-xs mt-xs ${className}`}
      >
        <div className="flex items-center gap-xs">
          {<FiAlertOctagon size={20} className={`${iconClass} ${className}`} />}
          <p className="text-[11px] text-grey-600 font-Regular m-auto sm:ml-xs">
            {typeResolutionText}
          </p>
        </div>
        <p className="text-BODY-S text-grey-900 font-Regular">
          {resolutionNumber}
        </p>
      </div>
      <div
        className={`flex flex-col gap-xxs pt-xxs ml-xs self-stretch ${reserveSpaceForMessages && 'min-h-[24px]'}`}
      >
        {validationMessages && validationMessages.length > 0 ? (
          validationMessages.map((valMsg) => (
            <p
              key={valMsg.message}
              className="flex gap-xxs items-center text-LABEL-L font-Medium text-grey-800"
            >
              {valMsg.isValid ? (
                <FiCheckCircle className="w-[12px] h-[12px] text-notify-success-darkest" />
              ) : (
                <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
              )}
              {valMsg.message}
            </p>
          ))
        ) : reserveSpaceForMessages ? (
          <p className="invisible flex gap-xxs items-center text-LABEL-L font-Medium text-grey-800">
            <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
            Mensagem de validação
          </p>
        ) : null}
      </div>
    </div>
  )
}
const Input: React.FC<InputProps> = ({
  dropzone,
  primaryText,
  secondaryText,
  className,
  validationMessages,
  typeResolutionText,
  resolutionNumber,
  reserveSpaceForMessages = false,
}) => {
  const { getRootProps, getInputProps } = dropzone
  const iconClass =
    Array.isArray(validationMessages) && validationMessages.length > 0
      ? 'text-notify-warning-normal'
      : 'text-notify-alert-normal'
  return (
    <div>
      <div
        {...getRootProps()}
        className={`w-[100%] h-[141px] rounded-sm border-dashed border-2 border-notify-info-normal bg-a-blue-5 ${className}`}
      >
        <label htmlFor="dropzone-file" className="cursor-pointer w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <FiPlusCircle className="text-3xl text-notify-info-normal text-H1 pt-s" />
            <p className="text-BODY-M text-grey-900 pt-xs">
              <span className="font-Bold">{primaryText}</span>
            </p>
            <p className="text-grey-900 text-LABEL-M font-Semibold pt-xs">
              {secondaryText}
            </p>
          </div>
        </label>
        <input {...getInputProps()} className="hidden mb-m" />
      </div>
      <div
        className={`w-[100%] flex justify-between items-center border rounded-sm border-solid border-notify-alert-normal p-xs mt-xs ${className}`}
      >
        <div className="flex items-center gap-xs">
          {<FiAlertOctagon size={20} className={`${iconClass} ${className}`} />}
          <p className="text-[11px] text-grey-600">{typeResolutionText}</p>
        </div>
        <p className="text-LABEL-L text-grey-900">{resolutionNumber}</p>
      </div>
      <div
        className={`flex flex-col gap-xxs pt-xxs ml-xs self-stretch ${reserveSpaceForMessages && 'min-h-[24px]'}`}
      >
        {validationMessages && validationMessages.length > 0 ? (
          validationMessages.map((valMsg) => (
            <p
              key={valMsg.message}
              className="flex gap-xxs items-center text-LABEL-L font-Medium text-grey-800"
            >
              {valMsg.isValid ? (
                <FiCheckCircle className="w-[12px] h-[12px] text-notify-success-darkest" />
              ) : (
                <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
              )}
              {valMsg.message}
            </p>
          ))
        ) : reserveSpaceForMessages ? (
          <p className="invisible flex gap-xxs items-center text-LABEL-L font-Medium text-grey-800">
            <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
            Mensagem de validação
          </p>
        ) : null}
      </div>
    </div>
  )
}
export const Dropzone: React.FC<DropzoneProps> = ({
  accept,
  primaryText,
  secondaryText,
  onChange,
  className,
  typeResolutionText,
  validationMessages,
  resolutionNumber,
  value,
  width,
  height,
  reserveSpaceForMessages = false,
}) => {
  const [file, setFile] = useState<DropzoneFile | null>(null)
  const [initialValueLoaded, setInitialValueLoaded] = useState(false)
  useEffect(() => {
    if (value && !initialValueLoaded) {
      if (typeof value === 'string') {
        fetch(`${value}`, { mode: 'no-cors' })
          .then((response) => response.blob())
          .then((blob) => {
            let fileName: string = ''
            fileName = value.split('/').pop() ?? 'file'
            const fileFromPath: DropzoneFile = new File([blob], fileName, {
              type: blob.type,
            })
            fileFromPath.path = value
            setFile(fileFromPath)
            setInitialValueLoaded(true)
            const img = document.createElement('img')
            img.src = URL.createObjectURL(blob)
            img.onload = () => {
              fileFromPath.width = img.width
              fileFromPath.height = img.height
              setFile(fileFromPath)
              setInitialValueLoaded(true)
              if (onChange) {
                onChange(fileFromPath)
              }
            }
            if (onChange) {
              onChange(fileFromPath)
            }
          })
          .catch((error) => console.error('Erro ao carregar a imagem:', error))
      } else if (value instanceof File) {
        const fileFromPath: DropzoneFile = value
        fileFromPath.path = value.name
        setFile(fileFromPath)
        setInitialValueLoaded(true)
        const img = document.createElement('img')
        img.src = URL.createObjectURL(value)
        img.onload = () => {
          fileFromPath.width = img.width
          fileFromPath.height = img.height
          setFile(fileFromPath)
          if (onChange) {
            onChange(fileFromPath)
          }
        }
      }
    }
  }, [value, initialValueLoaded, onChange])
  const removeFile = useCallback(() => {
    setFile(null)
    if (onChange) {
      onChange(null)
    }
  }, [onChange])
  const onDrop = useCallback(
    (files: File[]) => {
      const newFile: DropzoneFile = files[0]
      setFile(newFile)
      if (onChange) {
        onChange(newFile)
      }
    },
    [onChange],
  )
  const dropzone = useDropzone({
    onDrop,
    accept,
  })
  const openDropzone = useCallback(() => {
    dropzone.open()
  }, [dropzone])
  if (file)
    return (
      <HasFile
        file={file}
        removeFile={removeFile}
        openDropzone={openDropzone}
        className={className}
        validationMessages={validationMessages}
        typeResolutionText={typeResolutionText}
        resolutionNumber={resolutionNumber}
        value={file.path}
        width={width}
        height={height}
        reserveSpaceForMessages={reserveSpaceForMessages}
      />
    )
  return (
    <Input
      dropzone={dropzone}
      primaryText={primaryText}
      secondaryText={secondaryText}
      className={className}
      validationMessages={validationMessages}
      typeResolutionText={typeResolutionText}
      resolutionNumber={resolutionNumber}
      reserveSpaceForMessages={reserveSpaceForMessages}
    />
  )
}
