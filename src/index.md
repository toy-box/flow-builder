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
import React, { useState, useEffect } from 'react';
import {
  GlobalRegistry,
  Navbar, FlowEditor,
  DesignerContext,
  AutoFlow,
  flow, getMetaObjectData
} from '@toy-box/flow-builder';
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
  return (
    <DesignerContext.Provider value={{ prefix: 'fd', GlobalRegistry, serviceObj }}>
      <Navbar />
      <FlowEditor flowGraph={flowGraph} />
    </DesignerContext.Provider>
  );
};
```
