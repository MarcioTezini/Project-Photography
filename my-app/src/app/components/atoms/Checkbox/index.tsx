import { useState, forwardRef, ForwardedRef } from 'react'
import { FiCheck } from 'react-icons/fi'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isBrandCheckbox?: boolean
  isDarkMode?: boolean
}

const Checkbox = forwardRef(
  (
    {
      onChange,
      checked,
      isBrandCheckbox = false,
      isDarkMode = false,
      ...props
    }: CheckboxProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const [isHovered, setIsHovered] = useState(false)

    const toggleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event)
      }
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    const baseClasses =
      'w-[20px] h-[20px] flex-shrink-0 rounded-xs border border-solid border-grey-500 transition-colors'

    let checkedClasses = ''

    if (checked && !props.disabled) {
      checkedClasses = isBrandCheckbox
        ? 'bg-fichasPay-main-400 border-fichasPay-main-400'
        : 'bg-fichasPay-main-400 border-fichasPay-main-400'
    } else if (checked && props.disabled) {
      checkedClasses = 'bg-grey-400'
    } else if (!checked && !props.disabled) {
      checkedClasses = isDarkMode ? 'bg-grey-700' : 'bg-grey-300'
    } else {
      checkedClasses = 'bg-grey-400'
    }

    const brandHoveredClass = isBrandCheckbox
      ? 'bg-fichasPay-main-500 border-fichasPay-main-500'
      : 'bg-fichasPay-main-500 border-fichasPay-main-500'

    const hoveredCheckedClasses = checked
      ? brandHoveredClass
      : 'border-grey-600'

    const hoveredClasses =
      isHovered && !props.disabled ? hoveredCheckedClasses : ''

    const finalClasses = `${baseClasses} ${checkedClasses} ${hoveredClasses}`

    return (
      <label
        className={`flex items-center h-[20px] `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <input
          type="checkbox"
          className={`appearance-none ${finalClasses}`}
          checked={checked}
          onChange={toggleChecked}
          ref={ref}
          {...props}
        />
        {(checked || (isHovered && !props.disabled)) && (
          <FiCheck
            className={`relative right-[18px] w-s h-s ${isHovered && !checked && !props.disabled && 'text-grey-600'} ${props.disabled && checked && 'text-fichasPay-main-400'} -mr-s`}
          />
        )}
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
