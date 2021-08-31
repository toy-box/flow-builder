import {
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam } from '../../types'

export class RecordDeletes {
  recordDeletes: FlowMetaParam[] = []

  constructor(recordDeletes?: FlowMetaParam[]) {
    this.recordDeletes = recordDeletes || []
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      recordDeletes: observable.deep,
    })
  }

  initDatas = (recordDeletes: FlowMetaParam[]) => {
    this.recordDeletes = recordDeletes
  }

  onAdd = (recordDelete: FlowMetaParam) => {
    this.recordDeletes.push(recordDelete)
  }

  onEdit = (recordDelete: FlowMetaParam) => {
    const idx = this.recordDeletes.findIndex((de) => de.id === recordDelete.id)
    if (idx > -1) this.recordDeletes.splice(idx, 1, recordDelete)
  }
}