import React, { FC, useCallback, useEffect } from 'react'
import { Graph } from '@antv/x6'
import '@antv/x6-react-shape'
import { useFlowGraph } from '../../../flow/hooks/useFlowGraph'
import { useFlowGraphEffects } from '../../../flow/hooks/useFlowGraphEffect'
import { onFlowGraphMount, onFlowGraphEditable } from '../../../flow/effects'
import MenuTool from './MenuTool'

import '../styles/flowGround.less'
import CanvasHandler from './CanvasHandle'

MenuTool.config({
  tagName: 'div',
  isSVGElement: false
})

Graph.registerEdgeTool('contextmenu', MenuTool, true)
Graph.registerNodeTool('contextmenu', MenuTool, true)

const FlowGround: FC = () => {
  const flowGraph = useFlowGraph()

  useFlowGraphEffects(() => {
    onFlowGraphEditable((flowGraph) => {
      const { graph } = flowGraph
      graph && graph.on('edge:added', ({ edge }) => {
        flowGraph.createEdge({
          id: edge.id,
          name: '',
          source: edge.getSourceCellId(),
          target: edge.getTargetCellId(),
          edge,
        })
      })
      graph && graph.on('edge:mouseup', ({ edge }) => {
        const flowEdge = flowGraph.edges.find(e => e.id === edge.id)
        flowEdge && flowEdge.checkEdge()
      })
      graph && graph.on('edge:contextmenu', ({ cell, e }) => {
        const p = graph.clientToGraph(e.clientX, e.clientY)
        cell.addTools([
          {
            name: 'contextmenu',
            args: {
              x: p.x,
              y: p.y,
              onRemove() {
                const flowEdge = flowGraph.getEdge(cell.id)
                flowEdge?.remove()
              },
              onHide() {
                this.cell.removeTools()
              },
            },
          },
        ])
      })
      graph && graph.on('node:contextmenu', ({ node, e }) => {
        const p = graph.clientToGraph(e.clientX, e.clientY)
        node.addTools([
          {
            name: 'contextmenu',
            args: {
              x: p.x,
              y: p.y,
              onRemove() {
                const flowNode = flowGraph.getNode(node.id)
                flowNode?.remove()
              },
              onHide() {
                this.cell.removeTools()
              },
            },
          },
        ])
      })
    })
  })

  useFlowGraphEffects(() => {
    onFlowGraphMount((flowGraph) => {
      const { graph } = flowGraph
      graph && flowGraph.initialNodeMetas.forEach(node => {
        flowGraph.createNode(node)
      })
      graph && graph.centerContent()
      flowGraph.onEditable()
    })
  })

  useEffect(() => {
    flowGraph.setGraph(
      new Graph({
        container: document.getElementById('flow-ground') || undefined,
        scroller: {
          enabled: true,
          pannable: true,
        },
        background: {
          color: '#fafafa'
        }
      })
    )
  }, [flowGraph])

  const onHandleSideToolbar = useCallback(
    (action: 'in' | 'out' | 'fit' | 'real') => () => {
      // 确保画布已渲染
      if (flowGraph.mounted) {
        switch (action) {
          case 'in':
            flowGraph.zoomGraph(0.1)
            break
          case 'out':
            flowGraph.zoomGraph(-0.1)
            break
          case 'fit':
            flowGraph.zoomGraphToFit()
            break
          case 'real':
            flowGraph.zoomGraphRealSize()
            break
          default:
        }
      }
    },
    [flowGraph],
  )

  return (
    <React.Fragment>
      <div id="flow-ground">
      </div>
      <CanvasHandler
        onZoomIn={onHandleSideToolbar('in')}
        onZoomOut={onHandleSideToolbar('out')}
        onFitContent={onHandleSideToolbar('fit')}
        onRealContent={onHandleSideToolbar('real')}
      />
    </React.Fragment>
  )
}

export default FlowGround
