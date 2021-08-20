import { Node } from '@antv/x6'
// import {
//   action,
//   define,
//   observable,
//   reaction
// } from '@formily/reactive'
// import { uid } from '../../utils'
// import { FlowGraph } from './FlowGraph'
// import { FlowNodeProps, LifeCycleTypes } from '../types'
// import { makeNodeMetaWithComponent } from '../../components/flow-editor/makeFlowItem'

// export class FlowNode {
//   id: string
//   name: string
//   type: string
//   node: Node<Node.Properties>
//   nodeMeta: Node.Metadata
//   mounted: boolean
//   unmounted: boolean
//   inFlowSize: number = 1
//   outFlowSize: number = 1
//   flowGraph: FlowGraph
//   disposers: (() => void)[] = []

//   constructor(props: FlowNodeProps, flowGraph: FlowGraph) {
//     if (!flowGraph.graph) {
//       throw new Error('flow graph not read')
//     }
//     this.id = props.id || uid()
//     this.type = props.type
//     this.name = props.name
//     this.node = props.node || flowGraph.graph.addNode(makeNodeMetaWithComponent(props, flowGraph))
//     this.nodeMeta = props.nodeMeta
//     this.inFlowSize = props.inFlowSize
//     this.outFlowSize = props.outFlowSize
//     this.mounted = false
//     this.unmounted = false
//     this.flowGraph = flowGraph
//     this.makeObservable()
//     this.makeReactive()
//   }

//   protected makeObservable() {
//     define(this, {
//       id: observable.ref,
//       name: observable.ref,
//       mounted: observable.ref,
//       unmounted: observable.ref,
//       nodeMeta: observable,
//       node: observable,
//       inFlowSize: observable.ref,
//       outFlowSize: observable.ref,
//       inFlows: observable.computed,
//       outFlows: observable.computed,
//       inCount: observable.computed,
//       outCount: observable.computed,
//       isInOpen: observable.computed,
//       isOutOpen: observable.computed,
//       setOutPortVisible: action
//     })
//   }

//   protected makeReactive() {
//     this.disposers.push(
//       reaction(() => this.isOutOpen, (isOutOpen) => {
//         this.setOutPortVisible(isOutOpen)
//       }),
//     )
//   }

//   get inFlows() {
//     return this.flowGraph.edges.filter(edge => edge.target === this.id).map(edge => edge.id)
//   }

//   get outFlows() {
//     return this.flowGraph.edges.filter(edge => edge.source === this.id).map(edge => edge.id)
//   }

//   get inCount() {
//     return this.inFlows.length
//   }

//   get outCount() {
//     return this.outFlows.length
//   }

//   get isOutOpen() {
//     return this.outCount < this.outFlowSize
//   }

//   get isInOpen() {
//     return this.inCount < this.inFlowSize
//   }

//   setOutPortVisible(visible: boolean) {
//     if (visible) {
//       this.node.addPort({
//         group: 'out',
//       })
//     } else {
//       this.node.removePorts()
//     }
//   }

//   dispose = () => {
//     this.disposers.forEach((dispose) => {
//       dispose()
//     })
//   }

//   unmount() {
//     this.node.remove()
//     this.unmounted = true
//     this.flowGraph.notify(LifeCycleTypes.ON_FLOW_GRAPH_UMOUNT, this)
//   }

//   remove() {
//     this.flowGraph.notify(LifeCycleTypes.ON_FLOW_REMOVE_START, this)
//     this.unmount()
//     this.dispose()
//     this.flowGraph.notify(LifeCycleTypes.ON_FLOW_REMOVE_END, this)
//   }
// }