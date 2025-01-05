import React from 'react'

interface ContentPageProps {
  children: React.ReactNode
  pageName: string
  pageButton?: React.ReactNode
}

export const ContentPage: React.FC<ContentPageProps> = ({
  children,
  pageName,
  pageButton,
}) => {
  return (
    <div className="bg-grey-300 rounded-md shadow-DShadow-Special-X flex flex-col p-s divide-y divide-grey-600 gap-xm">
      <div className="flex items-center justify-between">
        <h6 className="text-H6 text-grey-900 font-Regular">{pageName}</h6>
        {pageButton && <div>{pageButton}</div>}
      </div>
      <div className="pt-xm">{children}</div>
    </div>
  )
}
