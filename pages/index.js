import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from "wagmi";
import Dashboard from '../components/Dashboard';
import { useisMounted } from '../components/useIsMounted';


export default function Home() {
  const mounted = useisMounted()
  return (
    <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "20px"}}>
      <ConnectButton />
      {mounted ? <Dashboard /> : <>Waiting to mount </>}
    </div>
  )
}
