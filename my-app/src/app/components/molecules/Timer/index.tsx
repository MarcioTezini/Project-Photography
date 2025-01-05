import { useState, useEffect } from 'react'
import { formatTime } from '@/bosons/formatters/timeFormatter'

interface ITimer {
  initialTime: number
}

export const Timer: React.FC<ITimer> = ({ initialTime }) => {
  const useTimer = (initialSeconds: number) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds)

    useEffect(() => {
      if (timeLeft <= 0) return

      const intervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(intervalId)
    }, [timeLeft])

    return timeLeft
  }

  const timeLeft = useTimer(initialTime)
  const { hours, minutes, seconds } = formatTime(timeLeft)

  return (
    <span className="text-BODY-XM font-Medium text-grey-900">
      {`${hours}:${minutes}:${seconds}`}
    </span>
  )
}
