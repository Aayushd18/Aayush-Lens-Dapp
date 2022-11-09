import { useEffect, useState } from "react";

export function useisMounted() {
  const [ mounted, setMounted ] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}