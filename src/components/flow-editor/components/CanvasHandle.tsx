import React from 'react'
import { Popover } from 'antd'
import {
  CompressOutlined,
  OneToOneOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons'
import classNames from 'classnames'

import  '../styles/canvasHandle.less'

interface Props {
  className?: string
  onZoomIn: () => void
  onZoomOut: () => void
  onFitContent: () => void
  onRealContent: () => void
}

const CanvasHandler: React.FC<Props> = (props) => {
  const { className, onZoomIn, onZoomOut, onFitContent, onRealContent } = props

  return (
    <ul className={classNames('canvas-handler', className)}>
      <Popover
        overlayClassName="canvas-handler-popover"
        content="放大"
        placement="left"
      >
        <li onClick={onZoomIn} className="canvas-handler-item">
          <ZoomInOutlined />
        </li>
      </Popover>
      <Popover
        overlayClassName="canvas-handler-popover"
        content="缩小"
        placement="left"
      >
        <li onClick={onZoomOut} className="canvas-handler-item">
          <ZoomOutOutlined />
        </li>
      </Popover>
      <Popover
        overlayClassName="canvas-handler-popover"
        content="实际尺寸"
        placement="left"
      >
        <li onClick={onRealContent} className="canvas-handler-item">
          <OneToOneOutlined />
        </li>
      </Popover>
      <Popover
        overlayClassName="canvas-handler-popover"
        content="适应画布"
        placement="left"
      >
        <li onClick={onFitContent} className="canvas-handler-item">
          <CompressOutlined />
        </li>
      </Popover>
    </ul>
  )
}

export default CanvasHandler
