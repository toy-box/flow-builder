import { useContext } from 'react';
import { DesignerContext } from '../designer';

export const usePrefix = (after = '') => {
  return useContext(DesignerContext)?.prefix + after;
};
