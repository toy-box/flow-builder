import {
  action,
  define,
  observable,
} from '@formily/reactive'
import { ICompareOperation } from '@toy-box/meta-schema';
import { FlowMetaParam, TargetReference, Criteria } from '../../types'

export class RecordUpdate {
  id: string
  name: string
  description?: string
  connector?: TargetReference
  faultConnector?: TargetReference
  criteria?: Criteria
  registerId?: string
  inputAssignments?: ICompareOperation[]

  constructor(recordUpdate: FlowMetaParam) {
    this.id = recordUpdate.id
    this.name = recordUpdate.name
    this.description = recordUpdate.description
    this.connector = recordUpdate.connector
    this.faultConnector = recordUpdate.faultConnector
    this.registerId = recordUpdate.registerId
    this.criteria = recordUpdate.criteria
    this.inputAssignments = recordUpdate.inputAssignments
    this.makeObservable()
  }

  protected makeObservable() {
    define(this, {
      id: observable.ref,
      name: observable.ref,
      description: observable.ref,
      connector: observable.deep,
      faultConnector: observable.deep,
      registerId: observable.ref,
      criteria: observable.deep,
      inputAssignments: observable.shallow,
      onEdit: action
    })
  }

  onEdit = (recordUpdate: FlowMetaParam) => {
    this.id = recordUpdate.id
    this.name = recordUpdate.name
    this.description = recordUpdate.description
    this.connector = recordUpdate.connector
    this.faultConnector = recordUpdate.faultConnector
    this.registerId = recordUpdate.registerId
    this.criteria = recordUpdate.criteria
    this.inputAssignments = recordUpdate.inputAssignments
  }
}