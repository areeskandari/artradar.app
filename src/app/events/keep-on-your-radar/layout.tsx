import { RadarCrmGate } from '@/components/events/RadarCrmGate'

export default function KeepOnYourRadarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RadarCrmGate />
      {children}
    </>
  )
}
