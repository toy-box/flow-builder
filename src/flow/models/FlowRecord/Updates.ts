import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../../types'

export class RecordUpdates {
  recordUpdates: FlowMetaParam[] = []

  constructor(recordUpdates?: FlowMetaParam[]) {
    this.recordUpdates = recordUpdates || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      recordUpdates: observable.deep,
    })
  }

  initDatas = (recordUpdates: FlowMetaParam[]) => {
    this.recordUpdates = recordUpdates
  }

  onAdd = (recordUpdate: FlowMetaParam) => {
    this.recordUpdates.push(recordUpdate)
  }

  onEdit = (recordUpdate: FlowMetaParam) => {
    const idx = this.recordUpdates.findIndex((de) => de.id === recordUpdate.id)
    if (idx > -1) this.recordUpdates.splice(idx, 1, recordUpdate)
  }
}