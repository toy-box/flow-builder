import React, { FC, SVGProps } from 'react'
import { observer } from '@formily/reactive-react'
import { FlowItem, FlowItemProps, FlowNodeMetaFn } from '../types'
import { portAttrs } from './option'

import '../styles/gateway.less'

const RaphaelFork = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 32 32" {...props}>
      <path d="M13.74 10.25h8.046v2.626l7.556-4.363l-7.556-4.363v2.598H9.826c1.543.864 2.79 2.174 3.915 3.5zm8.046 10.404c-.618-.195-1.407-.703-2.29-1.587c-1.79-1.756-3.713-4.675-5.732-7.227c-2.05-2.486-4.16-4.972-7.45-5.09h-3.5v3.5h3.5c.655-.028 1.682.485 2.878 1.682c1.788 1.753 3.712 4.674 5.73 7.226c1.922 2.33 3.908 4.64 6.864 5.016v2.702l7.556-4.362l-7.556-4.362v2.502z" fill="currentColor">
      </path>
    </svg>
  )
}

const Gateway: FC<FlowItemProps> = observer((props) => {
  return (
    <div className="flow-item flow-gateway">
      <div className="flow-item-polygon flow-gateway-polygon">
        <RaphaelFork />
      </div>
    </div>
  )
})

export default Gateway

export const flowNodeMeta: FlowNodeMetaFn = (id: string, portId: string, x: number, y: number) => ({
  id,
  type: 'gateway',
  name: `gateway-${id}`,
  inFlowSize: 1,
  outFlowSize: 10,
  nodeMeta: {
    id,
    x,
    y,
    width: 64,
    height: 64,
    shape: 'react-shape',
    component: 'gateway',
    ports: {
      groups: {
        out: {
          position: {
            name: 'absolute',
            args: { x: 32, y: 60 }
          },
          attrs: portAttrs
        }
      },
      items: [
        {
          id: portId,
          group: 'out'
        }
      ]
    }
  }
})

export const GatewayPack: FlowItem = {
  component: Gateway,
  flowNodeMeta
}