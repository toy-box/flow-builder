import React from 'react'
import { Tooltip } from 'antd'
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
      <Tooltip
        overlayClassName="canvas-handler-popover"
        title="放大"
        placement="left"
      >
        <li onClick={onZoomIn} className="canvas-handler-item">
          <ZoomInOutlined />
        </li>
      </Tooltip>
      <Tooltip
        overlayClassName="canvas-handler-popover"
        title="缩小"
        placement="left"
      >
        <li onClick={onZoomOut} className="canvas-handler-item">
          <ZoomOutOutlined />
        </li>
      </Tooltip>
      <Tooltip
        overlayClassName="canvas-handler-popover"
        title="实际尺寸"
        placement="left"
      >
        <li onClick={onRealContent} className="canvas-handler-item">
          <OneToOneOutlined />
        </li>
      </Tooltip>
      <Tooltip
        overlayClassName="canvas-handler-popover"
        title="适应画布"
        placement="left"
      >
        <li onClick={onFitContent} className="canvas-handler-item">
          <CompressOutlined />
        </li>
      </Tooltip>
    </ul>
  )
}

export default CanvasHandler
