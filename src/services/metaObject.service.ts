import { http } from './http'
import { AxiosResponse } from 'axios'

const path = 'entities'

export function metaObjectData(value?: string): Promise<AxiosResponse<any>> {
  return http.get(`${path}`, { params: { value } })
}