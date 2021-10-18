import { http } from './http'
import { AxiosResponse } from 'axios'

const path = 'meta_object'

export function metaObjectData(value?: string): Promise<AxiosResponse<any>> {
  return http.post(`${path}/search`, { value })
}