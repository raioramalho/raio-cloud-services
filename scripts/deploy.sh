#!/bin/bash
NOME_PROJETO=$1
PORTA=$2

if [ -z "$NOME_PROJETO" ]; then
    echo '{"status": "error", "message": "Nome do projeto é obrigatório"}' >&2
    exit 1
fi

DIRETORIO_PROJETO="./projects/$NOME_PROJETO"

if [ ! -d "$DIRETORIO_PROJETO" ]; then
    echo '{"status": "error", "message": "Projeto '$NOME_PROJETO' não encontrado"}' >&2
    exit 1
fi

# Construir e implantar o container
docker build -t $NOME_PROJETO $DIRETORIO_PROJETO
docker run -d --name $NOME_PROJETO -p $PORTA:3000 $NOME_PROJETO
echo '{"status": "success", "message": "Projeto '$NOME_PROJETO' implantado com sucesso"}'