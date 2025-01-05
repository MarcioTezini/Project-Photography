import React, { useEffect, useState } from 'react'
import { FiClock } from 'react-icons/fi'

interface TimerProps {
  initialTime: number
}

export const DepositQrCodeTimer: React.FC<TimerProps> = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-xxs">
      <span className="text-yellow-500 text-BODY-M font-Bold">
        {formatTime(timeLeft)}
      </span>
      <FiClock className="text-yellow-500" size={20} />
    </div>
  )
}
