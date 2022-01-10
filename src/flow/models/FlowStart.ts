import {
  define,
  observable,
  action
} from '@formily/reactive'
import { IStartFlowMeta, TargetReference, Criteria, FlowType, ISchedule } from '../types'

export class FlowStart {
  id: string
  name: string
  type: FlowType
  connector?: TargetReference
  criteria?: Criteria | null
  objectId?: string
  recordTriggerType?: string
  schedule?: ISchedule
  triggerType?: string

  constructor(flowStart: IStartFlowMeta) {
    this.id = flowStart.id
    this.name = flowStart.name
    this.connector = flowStart.connector
    this.criteria = flowStart.criteria
    this.type = flowStart.type
    this.objectId = flowStart.objectId
    this.recordTriggerType = flowStart.recordTriggerType
    this.schedule = flowStart.schedule
    this.triggerType = flowStart.triggerType
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      type: observable.ref,
      connector: observable.deep,
      criteria: observable.deep,
      objectId: observable.ref,
      recordTriggerType: observable.ref,
      schedule: observable.deep,
      triggerType: observable.ref,
      onEdit: action
    })
  }

  onEdit = (flowStart: IStartFlowMeta) => {
    this.id = flowStart.id
    this.name = flowStart.name
    this.connector = flowStart.connector
    this.criteria = flowStart.criteria
    this.type = flowStart.type
    this.objectId = flowStart.objectId
    this.recordTriggerType = flowStart.recordTriggerType
    this.schedule = flowStart.schedule
    this.triggerType = flowStart.triggerType
  }
}