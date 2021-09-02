import { useFlowGraph } from './useFlowGraph'

export const useFlowNodes = () => {
  const flowGraph = useFlowGraph()
  return flowGraph.flowNodes
}
