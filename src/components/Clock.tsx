import { useState, useEffect } from "react";
import dayjs from "dayjs";

export default function Clock() {
  const [clock, setClock] = useState(dayjs());
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setClock(dayjs());
    }, 1000)

    return () => clearInterval(intervalId);
  }, [])

  return <p>{clock.format('HH:mm:ss')}</p>
}
