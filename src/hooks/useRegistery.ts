import { IDesignerRegistry } from '../designer'
import { useDesigner } from './useDesigner'

export const useRegistry = (): IDesignerRegistry => {
  const designer = useDesigner()
  return designer.GlobalRegistry
}
