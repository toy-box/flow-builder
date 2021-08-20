import React from 'react'
import { GlobalRegistry} from '../../designer'
import { Navbar, FlowEditor} from '../../components'
import { DesignerContext } from '../../designer'
import { FlowMeta } from '../../flow/types'

import './style.less'


const flow: FlowMeta = {
  "start": {
    "id": "start",
    "name": "开始",
    "connector": {
      "targetReference": 'loop1'
    }
  },
  "loops": [
    {
      "id": "loop1",
      "name": "循环1",
      "nextValueConnector": {
        "targetReference": null
      },
      "defaultConnector": {
        "targetReference": null
      },
      "collectionReference": "list1",
      "iterationOrder": "desc"
    },
  ],
}

const flowMeta = {
  id: 'flow-meta-1',
  name: 'flow',
  flow: flow,
}


export const FlowDesigner = () => {
  return (
    <DesignerContext.Provider value={{ prefix: 'fd', GlobalRegistry }}>
      <Navbar />
      <FlowEditor flowMeta={flowMeta} />
    </DesignerContext.Provider>
  )
}

