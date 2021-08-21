import { ReactNode, FC } from 'react'
import { usePrefix } from '../../hooks'
import './styles'


export type NavbarProps = {
  brand?: ReactNode
}

export const Navbar: FC<NavbarProps> = ({ brand = 'FlowDesigner' }) => {
  const prefixCls = usePrefix('-navbar')
  return (
    <header className={prefixCls}>
      <div className={`${prefixCls}-brand`}>
        {brand}
      </div>
    </header>
  )
}