import {
  define,
  observable,
  action
} from '@formily/reactive'
import { FlowMetaParam } from '../types'

export class FlowDecision {
  id: string
  name: string
  description?: string
  connector?: {
    targetReference: string | null
  }
  defaultConnector?: {
    targetReference: string | null
  }
  rules?: FlowMetaParam[]

  constructor(flowDecision: FlowMetaParam) {
    this.id = flowDecision.id
    this.name = flowDecision.name
    this.description = flowDecision.description
    this.connector = flowDecision.connector
    this.defaultConnector = flowDecision.defaultConnector
    this.rules = flowDecision.rules
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      description: observable.ref,
      connector: observable.deep,
      defaultConnector: observable.deep,
      rules: observable.shallow,
      onEdit: action
    })
  }

  onEdit = (flowDecision: FlowMetaParam) => {
    this.id = flowDecision.id
    this.name = flowDecision.name
    this.description = flowDecision.description
    this.connector = flowDecision.connector
    this.defaultConnector = flowDecision.defaultConnector
    this.rules = flowDecision.rules
  }
}