import  { GatewayPack, FormProcessPack } from './components';
import { FlowItem } from './types';

export const flowItemsPack: Record<string, FlowItem> = {
  gateway: GatewayPack,
  formProcess: FormProcessPack
}
