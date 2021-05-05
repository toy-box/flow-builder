import { FC } from 'react'
import { FlowGraph } from '../../flow/models/FlowGraph'
import { FlowNodeProps } from '../../flow/types'

export type FlowComponentMapType = Record<string, FC<{ flowNode: FlowNodeProps, flowGraph: FlowGraph }>>
