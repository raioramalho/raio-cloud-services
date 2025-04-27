export type CreateVirtualMachineDto = {
  name: string
  size: {
    cpu: number
    memory: string
  }
  diskSize: string
  image: string
  sshKey: string
  userName: string
}

export type VirtualMachineSettings = {
  id: string
  name:string
  cpu: number
  memory: string
  cidata: string
  storage: string
  image: string
  baseImage: string
  username?: string
  sshKey: string
  pid: number
  status: 'Ativo' | 'Inativo' | 'Pendente'
}
