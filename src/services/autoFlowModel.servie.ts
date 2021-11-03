import { http } from './http'
import { AxiosResponse } from 'axios'

const path = 'auto_flow_model'

export interface FilterAutoFlowModelDTO {
  autoFlowId?: string
  name?: string
  notInIds?: string[]
  notInStates?: number[]
  objectId?: string
  operatorId?: string
  states?: number[]
}

export type FlowType = 'AUTO_START_UP' | 'PLAN_TRIGGER' | 'PLATFORM_EVENT' | 'RECORD_TRIGGER' | 'SCREEN'

export interface SaveAutoFlowModelDTO {
  description?: string
  flowType?: string
  flows?: object
  id?: string
  jobId?: string
  name?: string
  objectId?: string
  trigger?: string
}

export function autoFlowModels(page: number = 0, pageSize: number = 10, params: FilterAutoFlowModelDTO): Promise<AxiosResponse<any>> {
  return http.post(`${path}/filter_with_page`, Object.assign(params, { page, pageSize }))
}

export function saveAutoFlowModel(params: SaveAutoFlowModelDTO): Promise<AxiosResponse<any>> {
  return http.post(`${path}/save`, params)
}

export function autoFlowModel(id: string, userId?: string, tenantId?: string): Promise<AxiosResponse<any>> {
  return http.get(`${path}/${id}`, {
    params: { userId, tenantId }
  })
}