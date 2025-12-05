import React from 'react'
import Logo from '@/assets/logo.svg?react'
import { APP_NAME } from '@/constants/app.constants'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
}

const sizeClasses: Record<BrandLogoSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
}

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'lg' }) => {
  return (
    <Logo
      className={`${sizeClasses[size]} text-primary flex-shrink-0`}
      fill="currentColor"
    />
  )
}

const BrandName: React.FC = () => {
  return (
    <span className="whitespace-nowrap font-bold text-xl text-headline">
      {APP_NAME}
    </span>
  )
}

export { BrandLogo, BrandName }