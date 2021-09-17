/* eslint-disable react-hooks/rules-of-hooks */
import { isArr, isObj } from '@toy-box/toybox-shared';
import { AutoFlow, FlowMetaParamOfType } from '../../flow/models/AutoFlow'
import { FlowMetaParam } from '../../flow/types'

export interface RepeatErrorMessagePorps {
  flowGraph?: AutoFlow,
  apiId: string
}

export class RepeatErrorMessage {
  metaFlowDatas: FlowMetaParamOfType[] = []
  flowGraph: AutoFlow
  apiId: string
  errorMessage: string | null
  metaFlowData: FlowMetaParam | undefined

  constructor(flowGraph: AutoFlow, apiId: string, metaFlowData: FlowMetaParam | undefined, repeatName: string) {
    this.flowGraph = flowGraph
    this.apiId = apiId
    this.errorMessage = repeatName
    this.metaFlowData = metaFlowData
    this.init(flowGraph, apiId)
  }

  init = (flowGraph: AutoFlow, apiId: string) => {
    const flowData = flowGraph?.mataFlowJson.flow as any
    for (const key in flowData) {
      if (flowData.hasOwnProperty(key)) {
        if (isArr(flowData[key])) {
          flowData[key].forEach((data: FlowMetaParam) => {
            this.metaFlowDatas.push({
              ...data,
              flowType: key as any
            })
          })
        } else if (isObj(flowData[key])) {
          this.metaFlowDatas.push({
            ...flowData[key],
            flowType: key
          })
        }
      }
    }
    this.errorMessageFunc()
  }

  errorMessageFunc = () => {
    const idx = this.metaFlowDatas.findIndex((meta) => meta.id === this.apiId)
    if (this.metaFlowData && this.metaFlowData.id === this.apiId) return this.errorMessage = null
    if (idx <= -1) this.errorMessage = null
  }
}