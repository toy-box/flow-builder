---
nav:
  title: Components
  path: /components
---

Install dependencies,

```bash
$ npm i flow-builder
```

## 头部菜单

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  GlobalRegistry,
  Navbar, FlowEditor,
  DesignerContext,
  AutoFlow,
  flow, getMetaObjectData
} from '@toy-box/flow-builder';
import { Button } from 'antd';
// import 'antd/dist/antd.css';
// import 'codemirror/lib/codemirror.css';

GlobalRegistry.setDesignerLanguage('zh-CN')

export default () => {
  const [flowMeta, setFlowMeta] = useState({
    id: 'flow-meta-1',
    name: 'flow',
    flow: flow,
  })
  const flowGraph = new AutoFlow(flowMeta, 'PLAN_TRIGGER', 'edit')
  const serviceObj = {
    getMetaObjectData
  };
  const back = useCallback(() => {
    flowGraph.history.undo()
  }, [])
  const next = useCallback(() => {
    flowGraph.history.redo()
  }, [])
  return (
    <DesignerContext.Provider value={{ prefix: 'fd', GlobalRegistry, serviceObj }}>
      <Navbar />
      <div>
        <Button onClick={back}>回退</Button>
        <Button onClick={next}>前进</Button>
      </div>
      <FlowEditor flowGraph={flowGraph} />
    </DesignerContext.Provider>
  );
};
```
