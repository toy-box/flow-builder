import { http } from './http'
import { AxiosResponse } from 'axios'


export function autoFlows(page: number = 0, pageSize: number = 10, name?: string, userId?: string): Promise<AxiosResponse<any>> {
  return http.post(`auto_flow/filter_with_page`, { page, pageSize, name, userId })
}

export function autoFlowData(id: string): Promise<AxiosResponse<any>> {
  return http.get(`auto_flow/${id}`, {
  })
}