
'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'

interface NewItemIconProps {
  icon: React.ReactNode, 
  destin: string,
}
export default function NewItemIcon(props: NewItemIconProps) {
  const router = useRouter()

  return (
    <Button variant={"ghost"}  onClick={() => router.push(props.destin)}>
      {props.icon}
    </Button>
  )
}
