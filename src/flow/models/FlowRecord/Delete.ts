import {
  action,
  define,
  observable,
} from '@formily/reactive'
import { FlowMetaParam, TargetReference, Criteria } from '../../types'

export class RecordDelete {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  defaultConnector?: TargetReference
  criteria?: Criteria
  registerId?: string

  constructor(recordDelete: FlowMetaParam) {
    this.id = recordDelete.id
    this.name = recordDelete.name
    this.description = recordDelete.description
    this.connector = recordDelete.connector
    this.defaultConnector = recordDelete.defaultConnector
    this.registerId = recordDelete.registerId
    this.criteria = recordDelete.criteria
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      description: observable.ref,
      connector: observable.deep,
      defaultConnector: observable.deep,
      registerId: observable.ref,
      criteria: observable.deep,
      onEdit: action
    })
  }

  onEdit = (recordDelete: FlowMetaParam) => {
    this.id = recordDelete.id
    this.name = recordDelete.name
    this.description = recordDelete.description
    this.connector = recordDelete.connector
    this.defaultConnector = recordDelete.defaultConnector
    this.registerId = recordDelete.registerId
    this.criteria = recordDelete.criteria
  }
}