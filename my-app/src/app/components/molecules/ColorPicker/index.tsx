import React, { useState } from 'react'
import { SketchPicker, ColorResult } from 'react-color'

interface CustomColorPickerProps {
  color: string
  onChange: (color: ColorResult) => void
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  color: initialColor,
  onChange,
}) => {
  const [color, setColor] = useState<string>(initialColor)
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false)

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker)
  }

  const handleChange = (color: ColorResult) => {
    setColor(color.hex)
    onChange(color)
    document.documentElement.style.setProperty('--pickerColor', color.hex)
  }

  const customStyles = {
    default: {
      picker: {
        width: '231px',
        height: '257px',
        gap: '6px',
        borderRadius: '6px',
        border: '0.5px solid #C6C6C6',
        padding: '12px 12px 18.5px 12px',
        display: 'grid',
      },
      saturation: {
        borderRadius: '6px',
      },
      sliders: {
        padding: '10px 0',
      },
      hue: {
        borderRadius: '18px',
      },
      input: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
      wrap: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 0 10px 0',
      },
      label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '5px',
      },
      preview: {
        display: 'none',
      },
      hueHorizontal: {
        backgroundColor: color,
      },
    },
  }

  return (
    <div onClick={handleClick} className="shadow-DShadow-Special-X">
      <SketchPicker
        color={color}
        onChange={handleChange}
        disableAlpha={true}
        styles={customStyles}
        presetColors={[]}
        width="256px"
      />
    </div>
  )
}

export default CustomColorPicker
