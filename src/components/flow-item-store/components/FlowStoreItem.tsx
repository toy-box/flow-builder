import React, { FC } from 'react'
import { ConnectDragSource, DragSourceMonitor, DragSource, DragSourceConnector } from 'react-dnd'

interface FlowStoreItemProps {
  title: string
  type: string
}

interface StoreItemProps extends FlowStoreItemProps {
  connectDragSource: ConnectDragSource
}

const StoreItem: FC<StoreItemProps> = ({ title, type, connectDragSource, children }) => {
  const prefixCls = 'flow-store-item'
  return connectDragSource(
    <div className={prefixCls}>
      <div className={`${prefixCls}__icon`}>
        {children}
      </div>
      <div className={`${prefixCls}__title`}>
        {title}
      </div>
    </div>
  )
}

const DragSourceItem = DragSource(
  'flowItem',
  {
    beginDrag: (props: StoreItemProps) => ({ title: props.title, type: props.type }),
  },
  (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
)(StoreItem)

const FlowStoreItem: FC<FlowStoreItemProps> = (props) => {
  return <div className="flow-store-item-wrap">
    <DragSourceItem {...props} />
  </div>
}

export default FlowStoreItem


