import {
  action,
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam, TargetReference, IwaitEvent } from '../types'

export class FlowSuspend {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  defaultConnector?: TargetReference
  defaultConnectorName?: string
  waitEvents?: IwaitEvent[]

  constructor(suspend: FlowMetaParam) {
    this.id = suspend.id
    this.name = suspend.name
    this.description = suspend.description
    this.connector = suspend.connector
    this.defaultConnector = suspend.defaultConnector
    this.defaultConnectorName = suspend.defaultConnectorName
    this.waitEvents = suspend.waitEvents
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      description: observable.ref,
      connector: observable.deep,
      defaultConnector: observable.deep,
      defaultConnectorName: observable.deep,
      waitEvents: observable.deep,
      onEdit: action
    })
  }

  onEdit = (flowSuspend: FlowMetaParam) => {
    this.id = flowSuspend.id
    this.name = flowSuspend.name
    this.description = flowSuspend.description
    this.connector = flowSuspend.connector
    this.defaultConnector = flowSuspend.defaultConnector
    this.defaultConnectorName = flowSuspend.defaultConnectorName
    this.waitEvents = flowSuspend.waitEvents
  }
}