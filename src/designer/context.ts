import { createContext } from 'react'
import { IDesignerContext } from './types'
import { GlobalRegistry } from './registry'

export const DesignerContext = createContext<IDesignerContext>({ prefix: 'flow-designer', GlobalRegistry });
