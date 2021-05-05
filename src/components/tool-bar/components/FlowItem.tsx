import React, { FC } from 'react'
import { ConnectDragSource, DragSourceMonitor, DragSource, DragSourceConnector } from 'react-dnd'

interface FlowItemProps {
  title: string
  type: string
}

interface StoreItemProps extends FlowItemProps {
  connectDragSource: ConnectDragSource
}

const prefixCls = 'flow-item'


const StoreItem: FC<StoreItemProps> = ({ title, type, connectDragSource, children }) => {
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

const FlowStoreItem: FC<FlowItemProps> = (props) => {
  return <div className={`${prefixCls}-wrap`}>
    <DragSourceItem {...props} />
  </div>
}

export default FlowStoreItem
