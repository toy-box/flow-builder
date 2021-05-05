import { Node } from '@antv/x6';
import React from 'react'
import { FlowGraph } from '../../flow/models';
import { FlowNodeMeta, FlowNodeProps } from '../../flow/types';


export type NodeMetaFn = (id: string, portId: string, x: number, y: number) => Node.Metadata
export type FlowNodeMetaFn = (id: string, portId: string, x: number, y: number) => FlowNodeMeta

export interface FlowItemProps { flowNode?: FlowNodeProps, flowGraph?: FlowGraph }
export interface FlowItem {
  component: React.FC<FlowItemProps>
  flowNodeMeta: FlowNodeMetaFn
}