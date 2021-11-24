import { useContext } from 'react';
import { DesignerContext } from '../designer';

export const useService = () => {
  return useContext(DesignerContext)?.serviceObj;
};
