
'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function NewInstanceButton() {
  const router = useRouter()

  return (
    <Button className='w-full text-sm md:text-base lg:text-lg py-2 md:py-3' onClick={() => router.push('/instances/new')}>
      Nova Máquina Virtual
    </Button>
  )
}
