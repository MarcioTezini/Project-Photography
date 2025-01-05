import { tv } from 'tailwind-variants'

interface TagProps {
  children: React.ReactNode
  variant?:
    | 'default'
    | 'alert'
    | 'cacheta'
    | 'info'
    | 'poker'
    | 'success'
    | 'warning'
}

export default function Tag({ children, variant = 'default' }: TagProps) {
  const tag = tv({
    base: 'inline-flex px-xs py-xxs justify-center items-center gap-xs rounded-xxl text-LABEL-L font-Bold text-center',
    variants: {
      color: {
        default: 'bg-a-black-30 text-grey-800',
        alert: 'bg-a-yellow-50 text-notify-alert-darkest',
        cacheta: 'bg-cacheta-a-main-50 text-grey-900',
        info: 'bg-a-blue-50 text-notify-info-darkest',
        poker: 'bg-gaming-a-main-50 text-grey-900',
        success: 'bg-a-green-50 text-notify-success-darkest',
        warning: 'bg-a-red-50 text-notify-warning-darkest',
      },
    },
  })

  return (
    <div className={tag({ color: variant })}>
      <label className="text-LABEL-L">{children}</label>
    </div>
  )
}
