import { Node, Edge } from '@antv/x6'
import {
  define,
  observable,
  batch,
} from '@formily/reactive'
import { FlowGraph } from './FlowGraph'
import { LifeCycleTypes } from '../types'

export interface FlowEdgeProps {
  id?: string
  name: string
  source?: string
  target?: string
  edge: Edge<Edge.Properties>
  edgeMeta?: Edge.Metadata
}

export class FlowEdge {
  id: string
  name: string
  edgeMeta?: Edge.Metadata
  edge: Edge<Edge.Properties>
  source?: string
  target?: string
  mounted: boolean
  unmounted: boolean
  flowGraph: FlowGraph

  constructor(props: FlowEdgeProps, flowGraph: FlowGraph) {
    this.id = props.id || props.edge.id
    this.name = props.name
    this.edge = props.edge
    this.edgeMeta = props.edgeMeta
    this.source = props.source
    this.target = props.target
    this.mounted = false
    this.unmounted = false
    this.flowGraph = flowGraph
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      mounted: observable.ref,
      unmounted: observable.ref,
      source: observable.ref,
      target: observable.ref,
      edge: observable,
      edgeMeta: observable,
      setSource: batch,
      setTarget: batch,
      fixEdgeSource: batch,
      fixEdgeTarget: batch,
      fixConnectedStyle: batch,
      checkEdge: batch,
    })
  }

  fixEdgeSource() {
    this.fixDragStyle()
    const sourceNode = this.edge.getSourceNode()
    sourceNode && this.edge.setSource(sourceNode)
  }

  fixEdgeTarget() {
    const targetNode = this.edge.getTargetNode()
    targetNode && this.edge.setTarget(targetNode)
  }

  fixDragStyle() {
    this.edge.setAttrs({
      line: {
        strokeDasharray: '5 5',
        stroke: '#8c8c8c',
        strokeWidth: 2,
      }
    })
  }


  fixConnectedStyle() {
    this.edge.setRouter('er', { offset: 'center' })
    this.edge.setConnector('rounded', { radius: 4 })
    this.edge.setAttrs({
      line: {
        strokeDasharray: 'none'
      }
    })
  }

  checkEdge() {
    if (this.edge.getTargetCellId()) {
      this.fixEdgeTarget();
      this.fixConnectedStyle()
    } else {
      this.remove()
    }
  }


  setTarget(target: Node<Node.Properties>) {
    this.edge && this.edge.setTarget(target)
  }

  setSource(source: Node<Node.Properties>) {
    this.edge && this.edge.setSource(source)
  }

  remove() {
    // this.flowGraph.notify(LifeCycleTypes.ON_FLOW_REMOVE_START, this)
    this.edge.remove()
    this.unmounted = true
    // this.flowGraph.notify(LifeCycleTypes.ON_FLOW_REMOVE_END, this)
  }
}