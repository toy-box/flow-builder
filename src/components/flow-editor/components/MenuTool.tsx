/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react'
import ReactDom from 'react-dom'
import { Menu, Dropdown } from 'antd'
import { ToolsView, EdgeView } from '@antv/x6'

export interface MenuToolOptions extends ToolsView.ToolItem.Options {
  x: number
  y: number
  onRemove?: () => void
  onHide?: (this: MenuTool) => void
}

class MenuTool extends ToolsView.ToolItem<EdgeView, MenuToolOptions>  {
  private knob?: HTMLDivElement

  render() {
    super.render()
    this.knob = ToolsView.createElement('div', false) as HTMLDivElement
    this.knob.style.position = 'absolute'
    this.container.appendChild(this.knob)
    this.updatePosition(this.options)
    setTimeout(() => {
      this.toggleTooltip(true)
    })
    return this
  }

  private toggleTooltip(visible: boolean) {
    if (this.knob) {
      ReactDom.unmountComponentAtNode(this.knob)
      document.removeEventListener('mousedown', this.onMouseDown)
      const menu = (
        <Menu>
          <Menu.Item>配置</Menu.Item>
          <Menu.Item danger onClick={this.options.onRemove}>删除</Menu.Item>
        </Menu>
      )
      if (visible) {
        ReactDom.render(
          <Dropdown
            visible={true}
            trigger={['contextMenu']}
            overlay={menu}
          >
            <span></span>
          </Dropdown>,
          this.knob,
        )
        document.addEventListener('mousedown', this.onMouseDown)
      }
    }
  }

  private updatePosition(pos?: { x: number; y: number }, ) {
    if (this.knob) {
      const style = this.knob.style
      if (pos) {
        style.left = `${pos.x}px`
        style.top = `${pos.y}px`
      } else {
        style.left = '-1000px'
        style.top = '-1000px'
      }
    }
  }

  private onMouseDown = (e: MouseEvent) => {
    setTimeout(() => {
      this.updatePosition()
      this.toggleTooltip(false)
      if (this.options.onHide) {
        this.options.onHide.call(this)
      }
    }, 200)
  }
}

export default MenuTool;
