'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <Button variant={"destructive"} className='w-full text-sm md:text-base lg:text-lg py-2 md:py-3' onClick={() => router.back()}>
      Cancelar
    </Button>
  )
}
