import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../../types'

export class RecordCreates {
  recordCreates: FlowMetaParam[] = []

  constructor(recordCreates?: FlowMetaParam[]) {
    this.recordCreates = recordCreates || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      recordCreates: observable.deep,
    })
  }

  initDatas = (recordCreates: FlowMetaParam[]) => {
    this.recordCreates = recordCreates
  }

  onAdd = (recordCreate: FlowMetaParam) => {
    this.recordCreates.push(recordCreate)
  }

  onEdit = (recordCreate: FlowMetaParam) => {
    const idx = this.recordCreates.findIndex((de) => de.id === recordCreate.id)
    if (idx > -1) this.recordCreates.splice(idx, 1, recordCreate)
  }
}