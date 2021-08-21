import { useContext } from 'react';
import { DesignerContext } from '../designer'

export const useDesigner = () => {
  return useContext(DesignerContext)
}
