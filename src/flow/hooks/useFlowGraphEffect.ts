import { useEffect, useMemo, useRef } from 'react'
import { useFlowGraph } from './useFlowGraph'
import { uid } from '../../utils'
import { FlowGraphEffects } from '../types'

export const useFlowGraphEffects = (
  effects?: FlowGraphEffects
) => {
  const ref = useRef<any>(null)
  const flowGraph = useFlowGraph()
  ref.current = useMemo(() => {
    const id = uid()
    flowGraph.addEffects(id, effects)
    return id
  }, [effects, flowGraph])
  useEffect(() => {
    return () => {
      flowGraph.removeEffects(ref.current)
    }
  }, [flowGraph])
}
