import { createContext } from 'react'
import { IDesignerContext } from './types'
import { GlobalRegistry } from './registry'

export const DesignerContext = createContext<IDesignerContext>({ prefix: 'fd', GlobalRegistry, serviceObj: {} as any});
