import {
  define,
  observable,
  action
} from '@formily/reactive'
import { ICompareOperation } from '@toy-box/meta-schema';
import { FlowMetaParam } from '../types'

export class FlowAssignment {
  id: string
  name: string
  description?: string
  connector?: {
    targetReference: string | null
  }
  defaultConnector?: {
    targetReference: string | null
  }
  criteria?: {
    conditions: ICompareOperation[]
  }

  constructor(flowAssignment: FlowMetaParam) {
    this.id = flowAssignment.id
    this.name = flowAssignment.name
    this.description = flowAssignment.description
    this.connector = flowAssignment.connector
    this.defaultConnector = flowAssignment.defaultConnector
    this.criteria = flowAssignment.criteria
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      description: observable.ref,
      connector: observable.deep,
      defaultConnector: observable.deep,
      criteria: observable.deep,
      onEdit: action
    })
  }

  onEdit = (flowAssignment: FlowMetaParam) => {
    this.id = flowAssignment.id
    this.name = flowAssignment.name
    this.description = flowAssignment.description
    this.connector = flowAssignment.connector
    this.defaultConnector = flowAssignment.defaultConnector
    this.criteria = flowAssignment.criteria
  }
}