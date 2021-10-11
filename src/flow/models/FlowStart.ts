import {
  define,
  observable,
  action
} from '@formily/reactive'
import { FlowMetaParam, TargetReference } from '../types'

export class FlowStart {
  id: string
  name: string
  connector?: TargetReference

  constructor(flowStart: FlowMetaParam) {
    this.id = flowStart.id
    this.name = flowStart.name
    this.connector = flowStart.connector
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      connector: observable.deep,
      onEdit: action
    })
  }

  onEdit = (flowStart: FlowMetaParam) => {
    this.id = flowStart.id
    this.name = flowStart.name
    this.connector = flowStart.connector
  }
}