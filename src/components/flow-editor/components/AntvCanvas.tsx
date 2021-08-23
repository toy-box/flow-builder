import React, { useEffect, useCallback } from 'react';
import { Graph } from '@antv/x6';
import { AntvCanvas as FlowCanvas } from '@toy-box/flow-graph';
import { observer } from '@formily/reactive-react'
import { connect, StartNode, ExtendNode, EndNode, makeDecisionNode } from '@toy-box/flow-nodes';
import { useFlowGraph } from '../../../flow/hooks/useFlowGraph'
import { ExtendPanel } from './ExtendPanel';

const STAND_SIZE = 56;

export const AntvCanvas = observer(() => {
  const flowGraph = useFlowGraph();
  const flow = flowGraph.useFlow;

  const submit = useCallback(
    (id, type, data) => {
      flowGraph.updateInitialMeta(id, type, data)
      const graph = new Graph({
        container: document.getElementById('flow-canvas') || undefined,
        panning: true,
        grid: true,
        background: {
          color: '#fafafa',
        },
        frozen: true,
      });
      flow.setCanvas(
        new FlowCanvas({
          flowGraph: flow.flowGraph,
          canvas: graph,
          components: {
            StartNode: connect(StartNode, () => {
              return <div>start</div>;
            }),
            ExtendNode: connect(ExtendNode, <ExtendPanel callbackFunc={(id: string, type, data) =>submit(id, type, data)} />),
            EndNode: connect(EndNode),
          },
          svgNodes: {
            DecisionNode: makeDecisionNode
          }
        })
      );
      flow.setFlowNode(flowGraph.flowNodes)
    },
    [flow, flowGraph],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const graph = new Graph({
      container: document.getElementById('flow-canvas') || undefined,
      panning: true,
      grid: true,
      background: {
        color: '#fafafa',
      },
      frozen: true,
    });
    flow.setCanvas(
      new FlowCanvas({
        flowGraph: flow.flowGraph,
        canvas: graph,
        components: {
          StartNode: connect(StartNode, () => {
            return <div>start</div>;
          }),
          ExtendNode: connect(ExtendNode, <ExtendPanel callbackFunc={(id: string, type, data) =>submit(id, type, data)} />),
          EndNode: connect(EndNode),
        },
        svgNodes: {
          DecisionNode: makeDecisionNode
        }
      })
    );
  }, [flow, submit]);

  useEffect(() => {
    console.log(111111111111)
    flow.setFlowNode(flowGraph.flowNodes)
    // flow.setFlowNode([
    //   {
    //     id: '001',
    //     type: 'begin',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['100'],
    //     component: 'StartNode',
    //   },
    //   {
    //     id: '100',
    //     type: 'forward',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['200'],
    //   },
    //   {
    //     id: '200',
    //     type: 'forkBegin',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['500', '600'],
    //   },
    //   // {
    //   //   id: '210',
    //   //   type: 'forward',
    //   //   width: STAND_SIZE,
    //   //   height: STAND_SIZE,
    //   //   targets: ['500'],
    //   // },
    //   {
    //     id: '500',
    //     type: 'forward',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['220'],
    //     component: 'ExtendNode',
    //   },
    //   // {
    //   //   id: '211',
    //   //   type: 'forward',
    //   //   width: STAND_SIZE,
    //   //   height: STAND_SIZE,
    //   //   targets: ['600'],
    //   // },
    //   {
    //     id: '600',
    //     type: 'forward',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['220'],
    //     component: 'ExtendNode',
    //   },
    //   {
    //     id: '220',
    //     type: 'forkEnd',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['300'],
    //     component: 'ExtendNode',
    //   },
    //   {
    //     id: '300',
    //     type: 'forward',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['310'],
    //   },
    //   {
    //     id: '310',
    //     type: 'cycleBegin',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['311'],
    //   },
    //   {
    //     id: '311',
    //     type: 'cycleBack',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['312'],
    //     component: 'ExtendNode',
    //   },
    //   {
    //     id: '312',
    //     type: 'cycleEnd',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     targets: ['400'],
    //     component: 'ExtendNode',
    //   },
    //   {
    //     id: '400',
    //     type: 'end',
    //     width: STAND_SIZE,
    //     height: STAND_SIZE,
    //     component: 'EndNode',
    //   },
    // ]);
  }, [flow, flowGraph.flowNodes])

  return (
    <div id="flow-canvas" style={{ flex: 1 }}></div>
  );
});
