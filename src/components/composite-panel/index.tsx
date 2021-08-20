import React, { ReactNode, useState } from 'react'
import classNames from 'classnames'
import { CloseFill, PushpinLine, PushpinFill } from '@airclass/icons'
import { usePrefix } from '../../hooks'
import { TextWidget } from '../widgets'
import './styles'

export interface ICompositePanelItemProps {
  title?: ReactNode
  icon?: ReactNode
  href?: string
  extra?: React.ReactNode
}

const parseItems = (
  children: ReactNode,
): React.PropsWithChildren<ICompositePanelItemProps>[] => {
  const items: any[] = []
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type) {
      items.push(child.props)
    }
  })
  return items
}

export const CompositePanel: React.FC & {
  Item: React.FC<ICompositePanelItemProps>
} = (props) => {
  const prefix = usePrefix('-composite-panel')
  const [activeKey, setActiveKey] = useState(0)
  const [pinning, setPinning] = useState(false)
  const [visible, setVisible] = useState(true)
  const items = parseItems(props.children)
  const currentItem = items?.[activeKey]
  const content = currentItem?.children

  const renderContent = () => {
    if (!content || !visible) return
    return (
      <div className={classNames(prefix + '-tabs-content', { pinning })}>
        <div className={prefix + '-tabs-header'}>
          <div className={prefix + '-tabs-header-title'}>
            <TextWidget>{currentItem.title}</TextWidget>
          </div>
          <div className={prefix + '-tabs-header-actions'}>
            <div className={prefix + '-tabs-header-extra'}>
              {currentItem.extra}
            </div>
            {!pinning && (
              <PushpinLine onClick={() => setPinning(pinning)} />
            )}
            {pinning && (
              <PushpinFill onClick={() => setPinning(!pinning)} />
            )}
            <CloseFill onClick={() => setVisible(false)} />
          </div>
        </div>
        <div className={prefix + '-tabs-body'}>{content}</div>
      </div>
    )
  }

  return (
    <div className={prefix}>
      <div className={prefix + '-tabs'}>
        {items.map((item, index) => {
          const takeTab = () => {
            if (item.href) {
              return <a href={item.href}>{item.icon}</a>
            }
            return item.icon
          }
          return (
            <div
              className={classNames(prefix + '-tabs-pane', {
                active: activeKey === index,
              })}
              key={index}
              onClick={() => {
                if (index === activeKey) {
                  setVisible(!visible)
                } else {
                  setVisible(true)
                }
                setActiveKey(index)
              }}
            >
              {takeTab()}
            </div>
          )
        })}
      </div>
      {renderContent()}
    </div>
  )
}

CompositePanel.Item = () => {
  return <React.Fragment />
}
