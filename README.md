# Raio Cloud Services

Miniatura de cloud no seu HomeLab.

## Sobre o Projeto

Raio Cloud Services é uma aplicação full-stack para criação, gerenciamento e controle de máquinas virtuais QEMU/KVM através de uma interface web moderna. O projeto consiste em uma plataforma para gerenciamento de infraestrutura local permitindo provisionamento rápido de VMs.

## Stack Tecnológica

- **Backend**: Next.js API Routes (Node.js/TypeScript)
- **Frontend**: React/Next.js com UI Shadcn
- **Virtualização**: QEMU/KVM com libvirt
- **Infraestrutura**: Scripts Bash para gerenciamento das VMs

## Funcionalidades

- Criação de VMs com configurações personalizáveis
- Gerenciamento do ciclo de vida das VMs (iniciar, parar, excluir)
- Configuração de rede com port forwarding automático
- Integração com SSH via chaves públicas
- Dashboard com status das VMs

## Requisitos

- Ubuntu ou distribuição Linux compatível
- QEMU/KVM e libvirt
- Node.js (LTS)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/usuario/raio-cloud-services.git
cd raio-cloud-services

# Instale as dependências
npm install

# Execute o script de instalação
sudo bash scripts/install/rcs-install-ubuntu.sh

# Inicie a aplicação
npm run dev
```

## Arquitetura

O sistema é dividido em três componentes principais:

1. **Interface Web**: Dashboard para gerenciamento das VMs
2. **API REST**: Endpoints para controle das operações
3. **Scripts de Virtualização**: Camada de integração com QEMU/KVM

## Contribuição

Contribuições são bem-vindas! Abra uma issue para discutir suas ideias ou envie um Pull Request.

## Licença

MIT