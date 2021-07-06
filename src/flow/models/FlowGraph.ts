import { Graph } from '@antv/x6'
import {
  define,
  observable,
  batch,
  observe,
} from '@formily/reactive'
import { Heart } from './Heart'
import { FlowEdge } from './FlowEdge'
import { FlowNode } from './FlowNode'
import { FlowEdgeProps, FlowGraphEffects, FlowGraphMeta, FlowNodeProps, LifeCycleTypes } from '../types'
import { runEffects } from '../shared/effectbox'

export class FlowGraph {
  id: string
  initialized: boolean
  mounted: boolean
  unmounted: boolean
  editable: boolean
  graph?: Graph
  nodes: FlowNode[] = []
  edges: FlowEdge[] = []
  initialMeta: FlowGraphMeta
  heart: Heart
  disposers: (() => void)[] = []

  constructor(flowGraphMeta: FlowGraphMeta) {
    this.id = flowGraphMeta.id
    this.initialized = false
    this.mounted = false
    this.unmounted = false
    this.editable = false
    this.initialMeta = flowGraphMeta
    this.heart = new Heart({ lifecycles: [], context: this})
    this.makeObservable()
    this.makeReactive()
    // this.onInit()
  }

  protected makeObservable() {
    define(this, {
      nodes: observable.deep,
      edges: observable.deep,
      initialized: observable.ref,
      mounted: observable.ref,
      unmounted: observable.ref,
      initialMeta: observable,
      setId: batch,
      // onInit: batch,
    })
  }

  protected makeReactive() {
    this.disposers.push(
      observe(this.initialMeta, (change) => {
        this.notify(LifeCycleTypes.ON_FLOW_GRAPH_INIT_CHANGE)
      }),
    )
  }

  get initLifecycles() {
    return [LifeCycleTypes.ON_FLOW_REMOVE_END, (edge: FlowEdge) => this.removeEdge(edge.id)]
  }

  get initialNodeMetas() {
    return this.initialMeta.nodes
  }

  setGraph = (graph: Graph) => {
    this.graph = graph
    this.onMount();
  }

  setId = (id: string) => {
    this.id = id
  }

  getNode = (id: string) => {
    return this.nodes.find(node => node.id === id)
  }

  getEdge = (id: string) => {
    return this.edges.find(edge => edge.id === id)
  }

  createNode = (flowNodeProps: FlowNodeProps) => {
    if (this.graph == null) {
      throw new Error('graph not mounted')
    }
    // this.graph.addNode(makeNodeMetaWithComponent(flowNodeProps, this))
    const flowNode = new FlowNode(flowNodeProps, this)
    this.nodes.push(flowNode)
    return flowNode
  }

  createEdge = (flowEdgeProps: FlowEdgeProps) => {
    const flowEdge = new FlowEdge(flowEdgeProps, this)
    flowEdge.fixEdgeSource()
    this.edges.push(flowEdge)
    return flowEdge
  }

  updataEdges = (id: string, targetId: string) => {
    if (targetId) return;
    this.edges = this.edges.filter(edge => edge.id !== id)
  }

  removeEdge = (id: string) => {
    this.edges = this.edges.filter(edge => edge.id !== id)
    // this.edges.splice(idx, 1)
  }

  addEffects = (id: any, effects?: FlowGraphEffects) => {
    if (!this.heart.hasLifeCycles(id)) {
      this.heart.addLifeCycles(id, effects ? runEffects(this, effects) : runEffects(this))
    }
  }

  zoomGraph(factor: number) {
    this.graph?.zoom(factor)
  }

  zoomGraphToFit = () => {
    this.graph?.zoomToFit({ padding: 12 })
  }

  // 缩放到实际尺寸
  zoomGraphRealSize = () => {
    this.graph?.scale(1)
    this.graph?.centerContent()
  }

  removeEffects = (id: any) => {
    this.heart.removeLifeCycles(id)
  }

  notify = (type: string, payload?: any) => {
    this.heart.publish(type, payload ? payload : this)
  }

  /** hooks **/

  onInit = () => {
    this.initialized = true
    this.notify(LifeCycleTypes.ON_FLOW_GRAPH_INIT)
  }

  onMount = () => {
    this.mounted = true
    this.notify(LifeCycleTypes.ON_FLOW_GRAPH_MOUNT)
  }

  onEditable = () => {
    this.editable = true
    this.notify(LifeCycleTypes.ON_FLOW_GRAPH_EDITABLE)
  }
}