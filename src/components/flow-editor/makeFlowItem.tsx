import React from 'react'
import { Node } from '@antv/x6'
import { FlowGraph } from "../../flow/models"
import { FlowNodeMeta } from "../../flow/types"
import { flowItemsPack } from '../flow-item'
import { uid } from '../../utils'


export const makeNodeFromPack = (x: number, y: number, type: string, flowGraph: FlowGraph): FlowNodeMeta => {
  const id = uid()
  const portId = uid()
  console.log(type);
  return flowItemsPack[type].flowNodeMeta(id, portId, x, y)
}

export const makeNodeMetaWithComponent = (flowNodeMeta: FlowNodeMeta, flowGraph: FlowGraph) => {
  const { nodeMeta } = flowNodeMeta
  const NodeComponent =
    typeof nodeMeta.component === 'string'
      ? flowItemsPack[nodeMeta.component].component
      : undefined
  return {
    ...nodeMeta,
    component: NodeComponent
      ? (node: Node<Node.Properties>) => {
        const flowNode = {
          ...flowNodeMeta,
          node
        }
        return <NodeComponent flowNode={ flowNode } flowGraph = { flowGraph } />
      }
      : nodeMeta.component
  }
}