import { useContext } from 'react'
import { FlowContext } from '../shared'

export const useFlowGraph = () => {
  const flowGraph = useContext(FlowContext)
  if (!flowGraph) {
    throw new Error('Can not found flowGraph instance from context.')
  }
  return flowGraph
}
