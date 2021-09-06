import { useRegistry } from './useRegistery'


export const useLocale = (token: string) => {
  const registry = useRegistry()
  return registry.getDesignerMessage(token) || token
}
