import React, { FC, useCallback, useEffect, useState, useContext } from 'react'
// import { Graph } from '@antv/x6'
// import '@antv/x6-react-shape'
// import { useFlowGraph } from '../../../flow/hooks/useFlowGraph'
// import { useFlowGraphEffects } from '../../../flow/hooks/useFlowGraphEffect'
// import { onFlowGraphMount, onFlowGraphEditable } from '../../../flow/effects'
// import MenuTool from './MenuTool'
// import { makeNodeFromPack } from '../makeFlowItem'

// import '../styles/flowGround.less'
// import CanvasHandler from './CanvasHandle'

// import { processTypes } from "../../../flow/types"
// import { AssignmentModel, DecisionModel, SuspendModel, LoopModel,
//   SortCollectionModel, RecordCreateModel, RecordUpdateModel,
//   RecordRemoveModel, RecordLookUpModel } from '../../form-model';

// MenuTool.config({
//   tagName: 'div',
//   isSVGElement: false
// })

// Graph.registerEdgeTool('contextmenu', MenuTool, true)
// Graph.registerNodeTool('contextmenu', MenuTool, true)

// const FlowGround: FC = () => {
//   const flowGraph = useFlowGraph()
//   const [assignmentModel, setAssignmentModel] = useState(false)
//   const [decisionModel, setDecisionModel] = useState(false)

//   // useFlowGraphEffects(() => {
//   //   onFlowGraphEditable((flowGraph) => {
//   //     const { graph } = flowGraph
//   //     graph && graph.on('edge:added', ({ edge }) => {
//   //       flowGraph.createEdge({
//   //         id: edge.id,
//   //         name: '',
//   //         source: edge.getSourceCellId(),
//   //         target: edge.getTargetCellId(),
//   //         edge,
//   //       })
//   //     })
//   //     graph && graph.on('edge:mouseup', ({ edge }) => {
//   //       const flowEdge = flowGraph.edges.find(e => e.id === edge.id)
//   //       flowEdge && flowEdge.checkEdge()
//   //       flowGraph.updataEdges(edge.id, edge.getTargetCellId());
//   //     })
//   //     graph && graph.on('edge:contextmenu', ({ cell, e }) => {
//   //       const p = graph.clientToGraph(e.clientX, e.clientY)
//   //       cell.addTools([
//   //         {
//   //           name: 'contextmenu',
//   //           args: {
//   //             x: p.x,
//   //             y: p.y,
//   //             onRemove() {
//   //               const flowEdge = flowGraph.getEdge(cell.id)
//   //               flowEdge?.remove()
//   //               flowGraph.removeEdge(cell.id)
//   //             },
//   //             onHide() {
//   //               this.cell.removeTools()
//   //             },
//   //           },
//   //         },
//   //       ])
//   //     })
//   //     graph && graph.on('node:contextmenu', ({ node, e }) => {
//   //       const p = graph.clientToGraph(e.clientX, e.clientY)
//   //       node.addTools([
//   //         {
//   //           name: 'contextmenu',
//   //           args: {
//   //             x: p.x,
//   //             y: p.y,
//   //             onRemove() {
//   //               const flowNode = flowGraph.getNode(node.id)
//   //               flowNode?.remove()
//   //             },
//   //             onHide() {
//   //               this.cell.removeTools()
//   //             },
//   //           },
//   //         },
//   //       ])
//   //     })
//   //   })
//   // })

//   useFlowGraphEffects(() => {
//     onFlowGraphMount((flowGraph) => {
//       const { graph } = flowGraph
//       graph && flowGraph.initialNodeMetas.forEach(node => {
//         flowGraph.createNode(node)
//       })
//       graph && graph.centerContent()
//       // flowGraph.onEditable()
//       graph && graph.on('edge:added', ({ edge }) => {
//         flowGraph.createEdge({
//           id: edge.id,
//           name: '',
//           source: edge.getSourceCellId(),
//           target: edge.getTargetCellId(),
//           edge,
//         })
//       })
//       graph && graph.on('edge:mouseup', ({ edge }) => {
//         const flowEdge = flowGraph.edges.find(e => e.id === edge.id)
//         flowEdge && flowEdge.checkEdge()
//         flowGraph.updataEdges(edge.id, edge.getTargetCellId());
//       })
//       graph && graph.on('edge:contextmenu', ({ cell, e }) => {
//         const p = graph.clientToGraph(e.clientX, e.clientY)
//         cell.addTools([
//           {
//             name: 'contextmenu',
//             args: {
//               x: p.x,
//               y: p.y,
//               onRemove() {
//                 const flowEdge = flowGraph.getEdge(cell.id)
//                 flowEdge?.remove()
//                 flowGraph.removeEdge(cell.id)
//               },
//               onHide() {
//                 this.cell.removeTools()
//               },
//             },
//           },
//         ])
//       })
//       graph && graph.on('node:contextmenu', ({ node, e }) => {
//         const p = graph.clientToGraph(e.clientX, e.clientY)
//         node.addTools([
//           {
//             name: 'contextmenu',
//             args: {
//               x: p.x,
//               y: p.y,
//               onRemove() {
//                 const flowNode = flowGraph.getNode(node.id)
//                 flowNode?.remove()
//               },
//               onEdit() {
//                 const flowNode = flowGraph.getNode(node.id)
//                 if (flowNode?.type === processTypes.ASSIGNMENT) {
//                   setAssignmentModel(true)
//                 } else {
//                   setDecisionModel(true)
//                 }
//               },
//               onHide() {
//                 this.cell.removeTools()
//               },
//             },
//           },
//         ])
//       })
//     })
//   })

//   useEffect(() => {
//     flowGraph.setGraph(
//       new Graph({
//         container: document.getElementById('flow-ground') || undefined,
//         scroller: {
//           enabled: true,
//           pannable: true,
//         },
//         background: {
//           color: '#fafafa'
//         }
//       })
//     )
//     flowGraph.createNode(makeNodeFromPack(-500, -290, 'record', flowGraph))
//   }, [flowGraph])

//   const onHandleSideToolbar = useCallback(
//     (action: 'in' | 'out' | 'fit' | 'real') => () => {
//       // 确保画布已渲染
//       if (flowGraph.mounted) {
//         switch (action) {
//           case 'in':
//             flowGraph.zoomGraph(0.1)
//             break
//           case 'out':
//             flowGraph.zoomGraph(-0.1)
//             break
//           case 'fit':
//             flowGraph.zoomGraphToFit()
//             break
//           case 'real':
//             flowGraph.zoomGraphRealSize()
//             break
//           default:
//         }
//       }
//     },
//     [flowGraph],
//   )

//   const assignmentCallBack = useCallback(
//     (bool) => {
//       setAssignmentModel(bool)
//     },
//     [],
//   )

//   return (
//     <React.Fragment>
//       <div id="flow-ground">
//       </div>
//       <CanvasHandler
//         onZoomIn={onHandleSideToolbar('in')}
//         onZoomOut={onHandleSideToolbar('out')}
//         onFitContent={onHandleSideToolbar('fit')}
//         onRealContent={onHandleSideToolbar('real')}
//       />
//       {/* <AssignmentModel showModel={assignmentModel} callbackFunc={(bool: boolean) => assignmentCallBack(bool)}/> */}
//       {decisionModel && <DecisionModel showModel={decisionModel} callbackFunc={(bool: boolean) => setDecisionModel(bool)} />}
//       {/* <SuspendModel showModel={assignmentModel} callbackFunc={(bool: boolean) => assignmentCallBack(bool)}/> */}
//       {/* <LoopModel showModel={assignmentModel} callbackFunc={(bool: boolean) => assignmentCallBack(bool)} /> */}
//       {/* <SortCollectionModel showModel={assignmentModel} callbackFunc={(bool: boolean) => assignmentCallBack(bool)} /> */}
//       {/* <RecordCreateModel showModel={assignmentModel} callbackFunc={(bool: boolean) => assignmentCallBack(bool)} /> */}
//       {/* <RecordUpdateModel showModel={assignmentModel} callbackFunc={(bool: boolean) => assignmentCallBack(bool)} /> */}
//       {/* <RecordRemoveModel showModel={assignmentModel} callbackFunc={(bool: boolean) => assignmentCallBack(bool)} /> */}
//       <RecordLookUpModel showModel={assignmentModel} callbackFunc={(bool: boolean) => assignmentCallBack(bool)} />
//     </React.Fragment>
//   )
// }

// export default FlowGround
