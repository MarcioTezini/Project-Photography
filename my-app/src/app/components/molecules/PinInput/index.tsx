import OtpInput from 'react-otp-input'

interface PinInputProps {
  numberOfDigits?: number
  value: string | undefined
  onChange: (otp: string) => void
  inputStyle?: string
  customSeparator?: React.ReactNode
  hasError?: boolean
  isDarkMode?: boolean
}

export default function PinInput({
  numberOfDigits = 6,
  value,
  onChange,
  inputStyle,
  customSeparator,
  hasError,
  isDarkMode = false,
}: PinInputProps) {
  return (
    <OtpInput
      value={value}
      onChange={onChange}
      numInputs={numberOfDigits}
      renderSeparator={customSeparator || <div className="w-[10px]"></div>}
      renderInput={(props) => (
        <input
          className={
            inputStyle
              ? `${inputStyle} ${hasError ? 'border-red-500' : ''}`
              : `flex flex-col justify-center items-center text-center w-xxxm h-l rounded-xs border border-solid ${hasError ? 'border-notify-warning-normal' : 'border-grey-700'} outline-none text-BODY-M font-Semibold ${isDarkMode ? 'text-grey-300' : 'text-grey-900'} ${isDarkMode ? 'bg-grey-900' : 'bg-grey-300'}`
          }
          ref={props.ref}
          value={props.value}
          onChange={props.onChange}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
          onPaste={props.onPaste}
          onInput={props.onInput}
          type={props.type}
          inputMode={props.inputMode}
        />
      )}
    />
  )
}
