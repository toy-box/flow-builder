import React, { FC, SVGProps } from 'react'
import { observer } from '@formily/reactive-react'
import { portAttrs } from './option'
import { FlowItem, FlowItemProps, FlowNodeMetaFn } from '../types'

import '../styles/formProcess.less'


const MdiDocument = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h7v-2H7z" fill="currentColor"></path></svg>
  )
}

const FormProcess: FC<FlowItemProps> = observer((props) => {
  return (
    <div className="flow-item flow-form-process">
      <div className="flow-item-polygon flow-form-process-polygon">
        <MdiDocument />
      </div>
    </div>
  )
})

export default FormProcess


export const flowNodeMeta: FlowNodeMetaFn = (id: string, portId: string, x: number, y: number) => ({
  id,
  type: 'formProcess',
  name: `formProcess-${id}`,
  inFlowSize: 10,
  outFlowSize: 1,
  nodeMeta: {
    id,
    x,
    y,
    width: 64,
    height: 64,
    shape: 'react-shape',
    component: 'formProcess',
    ports: {
      groups: {
        out: {
          position: {
            name: 'absolute',
            args: { x: 32, y: 52 },
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

export const FormProcessPack: FlowItem = {
  component: FormProcess,
  flowNodeMeta
}