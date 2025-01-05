'use client'

import { Viewer, Worker, RotateDirection } from '@react-pdf-viewer/core'
import { toolbarPlugin, ToolbarSlot } from '@react-pdf-viewer/toolbar'

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

import {
  FiChevronDown,
  FiChevronUp,
  FiMaximize2,
  FiRotateCw,
  FiZoomIn,
  FiZoomOut,
} from 'react-icons/fi'
import { useEffect, useState } from 'react'

interface PDFViewerProps {
  fileSrc: string
  onPageChange?: (currentPage: number, numberOfPages: number) => void
}

export default function PDFViewer({ fileSrc, onPageChange }: PDFViewerProps) {
  const [numberOfPages, setNumberOfPages] = useState(0)

  const toolbarPluginInstance = toolbarPlugin({
    searchPlugin: {
      enableShortcuts: false,
    },
  })
  const { Toolbar } = toolbarPluginInstance

  const handlePageChange = (e: { currentPage: number }) => {
    if (onPageChange && e.currentPage + 1 === numberOfPages) {
      onPageChange(e.currentPage + 1, numberOfPages)
    }
  }

  const openPDFInNewTab = () => {
    window.open(fileSrc, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    }, 100) // 1 segundo

    return () => clearTimeout(timeoutId) // Limpa o timeout caso o componente seja desmontado
  }, [])

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js">
      <div className="flex-col justify-center items-center w-full h-full">
        <Viewer
          fileUrl={fileSrc}
          plugins={[toolbarPluginInstance]}
          onPageChange={(e) => handlePageChange(e)}
          onDocumentLoad={(document) => {
            setNumberOfPages(document.doc.numPages)
          }}
        />
        <div className="relative -mt-[80px] sm:-mt-[70px]">
          <Toolbar>
            {(props: ToolbarSlot) => {
              const {
                CurrentPageInput,
                GoToNextPage,
                GoToPreviousPage,
                NumberOfPages,
                ZoomIn,
                ZoomOut,
                Rotate,
                Open,
              } = props
              return (
                <>
                  <div className="flex py-xs px-m items-center justify-center shadow-DShadow-L rounded-xl justify-self-center gap-m sm:gap-s bg-grey-300">
                    <div className="flex items-center gap-s">
                      <GoToPreviousPage>
                        {(props) => (
                          <FiChevronUp
                            size={20}
                            className={`cursor-pointer ${props.isDisabled ? 'text-grey-700 opacity-50' : 'text-grey-700'}`}
                            onClick={props.onClick}
                          />
                        )}
                      </GoToPreviousPage>
                      <GoToNextPage>
                        {(props) => (
                          <FiChevronDown
                            size={20}
                            className={`cursor-pointer ${props.isDisabled ? 'text-grey-700 opacity-50' : 'text-grey-700'}`}
                            onClick={props.onClick}
                          />
                        )}
                      </GoToNextPage>
                    </div>
                    <div className="flex justify-center items-center text-grey-900 text-BODY-S font-Medium">
                      <CurrentPageInput />
                      / <NumberOfPages />
                    </div>
                    <div className="flex items-center gap-s">
                      <ZoomOut>
                        {(props) => (
                          <FiZoomOut
                            size={20}
                            className="text-grey-700 cursor-pointer"
                            onClick={props.onClick}
                          />
                        )}
                      </ZoomOut>
                      <ZoomIn>
                        {(props) => (
                          <FiZoomIn
                            size={20}
                            className="text-grey-700 cursor-pointer"
                            onClick={props.onClick}
                          />
                        )}
                      </ZoomIn>
                      <Rotate direction={RotateDirection.Forward}>
                        {(props) => (
                          <FiRotateCw
                            size={20}
                            className="text-grey-700 cursor-pointer"
                            onClick={props.onClick}
                          />
                        )}
                      </Rotate>
                      <Open>
                        {() => (
                          <FiMaximize2
                            size={20}
                            className="text-grey-700 cursor-pointer"
                            onClick={openPDFInNewTab}
                          />
                        )}
                      </Open>
                    </div>
                  </div>
                </>
              )
            }}
          </Toolbar>
        </div>
      </div>
    </Worker>
  )
}
