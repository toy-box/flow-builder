import React from 'react';
import { AutoFlow } from '../models/AutoFlow';

export const FlowContext = React.createContext<AutoFlow | null>(null)