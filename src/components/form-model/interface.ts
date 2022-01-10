import {
  CompareOP,
} from '@toy-box/meta-schema'
import { type } from 'os'

export interface IRuleItem {
  name: string
  id: string
  description?: string
  criteria: ICriteriaItem
}

export interface ICriteriaItem {
  logic?: string
  conditions: Partial<IConditionItem>[]
}

export interface IConditionItem {
  fieldPattern: string
  type: string
  value: string
  operation: CompareOP
}

export enum AssignmentOpEnum {
  ADD = 'Add',
  SUBTRACT = 'Subtract',
  ASSIGN = 'Assign',
  ADD_AT_START = 'AddAtStart',
  REMOVE_FIRST = 'RemoveFirst',
  REMOVE_ALL = 'RemoveAll',
}
