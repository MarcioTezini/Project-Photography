import { useState, useEffect, forwardRef, ForwardedRef } from 'react'

const Switch = forwardRef(
  (
    {
      onChange,
      checked = false,
      ...props
    }: React.InputHTMLAttributes<HTMLInputElement>,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const [isChecked, setIsChecked] = useState(checked)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
      setIsChecked(checked)
    }, [checked])

    const toggleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = !isChecked
      setIsChecked(newValue)
      if (onChange) {
        const newEvent: React.ChangeEvent<HTMLInputElement> = {
          ...event,
          target: {
            ...event.target,
            checked: newValue,
          },
        }
        onChange(newEvent)
      }
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    return (
      <div className="flex items-center cursor-pointer">
        <label
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <input
            type="checkbox"
            className={'appearance-none w-[36px] h-[14px]'}
            checked={isChecked}
            onChange={toggleChecked}
            ref={ref}
            {...props}
          />
          <span
            className={`
              absolute rounded-xl top-0 right-0 bottom-0 left-0 w-[34px] h-[14px] transition-colors
              before:absolute before:content-[''] before:transition-[0.3s]
              before:h-[20px] before:w-[20px]  before:top-[-3px]
              before:rounded-xxl before:shadow-DShadow-Default
              ${isChecked && props.disabled && 'bg-fichasPay-main-400'}
              ${isChecked ? 'bg-fichasPay-main-400 before:translate-x-[17px]' : 'bg-grey-500 before:left-[-1px]'}
              ${!isChecked && isHovered ? 'bg-grey-400' : '1'}
              ${isChecked && !props.disabled ? 'bg-fichasPay-main-400 bg-opacity-70 before:bg-fichasPay-main-400' : 'before:bg-grey-300'}
              ${isHovered && !isChecked && !props.disabled && 'bg-grey-400'}
              ${props.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              ${isHovered && !props.disabled ? (isChecked ? 'bg-fichasPay-main-500' : 'hover:bg-grey-400') : ''}
            `}
          ></span>
        </label>
      </div>
    )
  },
)

Switch.displayName = 'Switch'

export default Switch
