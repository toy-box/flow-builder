import  { GatewayPack, FormProcessPack, RecordPack, AssignmentPack } from './components';
import { FlowItem } from './types';

export const flowItemsPack: Record<string, FlowItem> = {
  gateway: GatewayPack,
  formProcess: FormProcessPack,
  record: RecordPack,
  assignment: AssignmentPack
}
