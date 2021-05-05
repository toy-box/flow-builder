import React, { FC } from 'react';
import '../styles/flowHandlePort.less';

export interface HandlePortProps {
  style?: React.CSSProperties;
  handle?: () => void;
}

const HandlePort: FC<HandlePortProps> = ({ style, handle }) => {
  return (
    <div className="flow-handle-port" style={style} onClick={handle}>
      <div className="flow-handle-port__inner"></div>
    </div>
  )
}

export default HandlePort;
