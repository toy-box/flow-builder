import { Layout } from 'antd'
import { ReactNode, FC } from 'react'
import './styles'

const { Header } = Layout

export type NavbarProps = {
  brand?: ReactNode
}

export const Navbar: FC<NavbarProps> = ({ brand = 'FlowDesigner' }) => {
  const prefix = 'flow-designer-navbar'
  return (
    <Header className={prefix}>
      <div className={`${prefix}-brand`}>
        {brand}
      </div>
    </Header>
  )
}