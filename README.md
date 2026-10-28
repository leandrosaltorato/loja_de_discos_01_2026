# Loja de vinhos: Node.js, Prisma e MySQL

Schema transcrito do DER enviado: `USUARIO`, `DISCO` e `MOVIMENTACAO_ESTOQUE`, com campos, tipos, chave única e relações representados no Prisma.

## Subir e iniciar

Requer Node.js e Docker Compose.

```bash
npm install
docker compose up -d
npm run db:generate
npm run db:push
npm start
```

`DATABASE_URL` e as credenciais locais estão em `.env`. Altere as senhas antes de usar fora do ambiente local. `db:push` cria/ajusta o banco conforme o schema.

## Login

`POST /auth/login`

```json
{ "email": "usuario@exemplo.com", "senha": "sua-senha" }
```

Retorna os dados básicos do usuário quando as credenciais conferem, ou HTTP 401. Não há cadastro nem geração de token. O serviço compara hashes bcrypt quando a coluna `senha` contém um hash bcrypt; também aceita igualdade direta para compatibilidade com registros legados descritos apenas pelo DER. Para produção, cadastre/importe senhas como hashes bcrypt.

## Observações do DER

- Relações: um usuário pode ter várias movimentações; cada movimentação referencia um usuário e um disco; um disco pode ter várias movimentações.
- O desenho não informa nulabilidade nem regras `ON DELETE`; campos foram definidos como obrigatórios e as relações usam o comportamento padrão do Prisma/MySQL.
- `tipo_movimentacao` foi representado como ENUM `entrada`/`saida`, conforme os valores mostrados.
- O DER rotula as senhas como `VARCHAR(100)`, mas não especifica se são texto puro ou hash. O serviço dá suporte a bcrypt sem mudar esse tipo.
