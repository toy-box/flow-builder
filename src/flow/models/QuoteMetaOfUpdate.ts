import { IFieldMeta } from '@toy-box/meta-schema';
import { AutoFlow } from './AutoFlow';

export const QuoteMetaOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  flowAssignmentOfUpdate(autoFlow, flowMeta, quoteId)
  flowDecisionOfUpdate(autoFlow, flowMeta, quoteId)
  flowSuspendOfUpdate(autoFlow, flowMeta, quoteId)
  flowLoopOfUpdate(autoFlow, flowMeta, quoteId)
  flowSortCollectionOfUpdate(autoFlow, flowMeta, quoteId)
  recordCreateOfUpdate(autoFlow, flowMeta, quoteId)
  recordUpdateOfUpdate(autoFlow, flowMeta, quoteId)
  recordRemoveOfUpdate(autoFlow, flowMeta, quoteId)
  recordLookUpOfUpdate(autoFlow, flowMeta, quoteId)
}

export const flowAssignmentOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  autoFlow.flowAssignments.forEach((assignment) => {
    assignment.assignmentItems?.forEach((item) => {
      const val = item.value?.split('.')?.[0]
      const assignToReference = item.assignToReference?.split('.')?.[0]
      if (val && val === quoteId) {
        item.value = item.value.replace(val, flowMeta.key)
      } else if (item.value === quoteId) {
        item.value = flowMeta.key
      }
      if (assignToReference && assignToReference === quoteId) {
        item.assignToReference = item.assignToReference.replace(assignToReference, flowMeta.key)
      } else if (item.assignToReference === quoteId) {
        item.assignToReference = flowMeta.key
      } 
    })
  })
}

export const flowDecisionOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  autoFlow.flowDecisions.forEach((decision) => {
    decision.rules?.forEach((rule) => {
      rule.criteria?.conditions.forEach((condition) => {
        const val = condition.value?.split('.')?.[0]
        const fieldPattern = condition.fieldPattern?.split('.')?.[0]
        if (val && val === quoteId) {
          condition.value = condition.value.replace(val, flowMeta.key)
        } else if (condition.value === quoteId) {
          condition.value = flowMeta.key
        }
        if (fieldPattern && fieldPattern === quoteId) {
          condition.fieldPattern = condition.fieldPattern.replace(fieldPattern, flowMeta.key)
        } else if (condition.fieldPattern === quoteId) {
          condition.fieldPattern = flowMeta.key
        } 
      })
    })
  })
}

export const flowSuspendOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  autoFlow.flowSuspends.forEach((suspend) => {
    suspend.waitEvents?.forEach((item) => {
      const val = item?.recoveryTimeInfo?.dateValue?.split('.')?.[0]
      const recordIdValue = item?.recoveryTimeInfo?.recordIdValue?.split('.')?.[0]
      if (val && val === quoteId) {
        item.recoveryTimeInfo.dateValue = item.recoveryTimeInfo.dateValue.replace(val, flowMeta.key)
      } else if (item?.recoveryTimeInfo?.dateValue === quoteId) {
        item.recoveryTimeInfo.dateValue = flowMeta.key
      } else if (recordIdValue && recordIdValue === quoteId) {
        item.recoveryTimeInfo.recordIdValue = item.recoveryTimeInfo.recordIdValue.replace(recordIdValue, flowMeta.key)
      } else if (item?.recoveryTimeInfo?.recordIdValue === quoteId) {
        item.recoveryTimeInfo.recordIdValue = flowMeta.key
      }
    })
  })
}

export const flowLoopOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  autoFlow.flowLoops.forEach((loop) => {
    const collectionReference = loop?.collectionReference?.split('.')?.[0]
    if (collectionReference && collectionReference === quoteId) {
      loop.collectionReference = loop?.collectionReference?.replace(collectionReference, flowMeta.key)
    } else if (loop?.collectionReference === quoteId) {
      loop.collectionReference = flowMeta.key
    } 
  })
}

export const flowSortCollectionOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  autoFlow.flowSortCollections.forEach((loop) => {
    const collectionReference = loop?.collectionReference?.split('.')?.[0]
    if (collectionReference && collectionReference === quoteId) {
      loop.collectionReference = loop?.collectionReference?.replace(collectionReference, flowMeta.key)
    } else if (loop?.collectionReference === quoteId) {
      loop.collectionReference = flowMeta.key
    } 
  })
}

export const recordCreateOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  autoFlow.recordCreates.forEach((record) => {
    const assignRecordIdToReference = record?.assignRecordIdToReference?.split('.')?.[0]
    if (assignRecordIdToReference && assignRecordIdToReference === quoteId) {
      record.assignRecordIdToReference = record?.assignRecordIdToReference?.replace(assignRecordIdToReference, flowMeta.key)
    } else if (record?.assignRecordIdToReference === quoteId) {
      record.assignRecordIdToReference = flowMeta.key
    } 
    record.inputAssignments?.forEach((item) => {
      const val = item?.value?.split('.')?.[0]
      if (val && val === quoteId) {
        item.value = item?.value?.replace(val, flowMeta.key)
      } else if (item?.value === quoteId) {
        item.value = flowMeta.key
      }
    })
  })
}

export const recordUpdateOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  autoFlow.recordUpdates.forEach((record) => {
    record.inputAssignments?.forEach((item) => {
      const val = item?.value?.split('.')?.[0]
      if (val && val === quoteId) {
        item.value = item?.value?.replace(val, flowMeta.key)
      } else if (item?.value === quoteId) {
        item.value = flowMeta.key
      }
    })
    record.criteria?.conditions?.forEach((item) => {
      const val = item?.value?.split('.')?.[0]
      if (val && val === quoteId) {
        item.value = item?.value?.replace(val, flowMeta.key)
      } else if (item?.value === quoteId) {
        item.value = flowMeta.key
      }
    })
  })
}

export const recordRemoveOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  autoFlow.recordUpdates.forEach((record) => {
    record.criteria?.conditions?.forEach((item) => {
      const val = item?.value?.split('.')?.[0]
      if (val && val === quoteId) {
        item.value = item?.value?.replace(val, flowMeta.key)
      } else if (item?.value === quoteId) {
        item.value = flowMeta.key
      }
    })
  })
}

export const recordLookUpOfUpdate = (autoFlow: AutoFlow, flowMeta: IFieldMeta, quoteId: string) => {
  autoFlow.recordLookups.forEach((record) => {
    const outputReference = record?.outputReference?.split('.')?.[0]
    if (outputReference && outputReference === quoteId) {
      record.outputReference = record?.outputReference?.replace(outputReference, flowMeta.key)
    } else if (record?.outputReference === quoteId) {
      record.outputReference = flowMeta.key
    } 
    record.outputAssignments?.forEach((item) => {
      const val = item?.field?.split('.')?.[0]
      if (val && val === quoteId) {
        item.field = item?.field?.replace(val, flowMeta.key)
      } else if (item?.field === quoteId) {
        item.field = flowMeta.key
      }
    })
    record.criteria?.conditions?.forEach((item) => {
      const val = item?.value?.split('.')?.[0]
      if (val && val === quoteId) {
        item.value = item?.value?.replace(val, flowMeta.key)
      } else if (item?.value === quoteId) {
        item.value = flowMeta.key
      }
    })
  })
}