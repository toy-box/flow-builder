import React from 'react';
import { FlowGraph } from '../models';

export const FlowContext = React.createContext<FlowGraph | null>(null)