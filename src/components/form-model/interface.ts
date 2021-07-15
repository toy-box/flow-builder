import {
  CompareOP,
} from '@toy-box/meta-schema'

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