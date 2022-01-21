/* eslint-disable react-hooks/rules-of-hooks */
import { isArr, isObj } from '@toy-box/toybox-shared';
import { type } from 'os';
import { AutoFlow, FlowMetaParamOfType } from '../../flow/models/AutoFlow'
import { FlowMetaParam, IFieldMetaFlow } from '../../flow/types'
import { TextWidget } from '../widgets'

export interface RepeatErrorMessagePorps {
  flowGraph?: AutoFlow,
  apiId: string
}

export class RepeatErrorMessage {
  metaFlowDatas: FlowMetaParamOfType[] = []
  flowGraph: AutoFlow
  apiId: string
  errorMessage: string | null = null
  metaFlowData: FlowMetaParam | IFieldMetaFlow | undefined
  apiReg: RegExp | undefined

  constructor(flowGraph: AutoFlow, apiId: string, metaFlowData: FlowMetaParam | IFieldMetaFlow | undefined, apiReg?: RegExp) {
    this.flowGraph = flowGraph
    this.apiId = apiId
    this.metaFlowData = metaFlowData
    this.apiReg = apiReg
    this.init(flowGraph, apiId)
  }

  init = (flowGraph: AutoFlow, apiId: string) => {
    const flowData = flowGraph?.mataFlowJson.flow as any
    for (const key in flowData) {
      if (flowData.hasOwnProperty(key)) {
        if (isArr(flowData[key])) {
          flowData[key].forEach((data: FlowMetaParam) => {
            return this.metaFlowDatas.push({
              ...data,
              flowType: key as any
            });
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
    if (this.apiReg?.test(this.apiId)) {
      if (this.apiId.length <= 32) {
        this.errorMessage = 'flow.form.validator.repeatName'
        const idx = this.metaFlowDatas.findIndex((meta: any) => meta.id === this.apiId || meta?.key === this.apiId)
        const metaFlowData: any = this.metaFlowData
        if (metaFlowData?.id === this.apiId || metaFlowData?.key === this.apiId) return this.errorMessage = null
        if (idx <= -1) this.errorMessage = null
      } else {
        this.errorMessage = 'flow.form.validator.apiLength'
      }
    } else {
      this.errorMessage = 'flow.form.validator.resourceRegRuleMessage'
    }
  }
}