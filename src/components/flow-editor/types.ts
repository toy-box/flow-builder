import { FC } from 'react'
import { AutoFlow } from '../../flow/models/AutoFlow'
import { FlowNodeProps } from '../../flow/types'

export type FlowComponentMapType = Record<string, FC<{ flowNode: FlowNodeProps, flowGraph: AutoFlow }>>
