# Vinyl Control

Sistema para loja de discos de vinil: cadastro do acervo, controle de estoque e registro de vendas e reposições.

O projeto tem duas partes independentes:

- **`web/`**: o front-end (Vite + JavaScript puro).
- **`backend/`**: a API (Node.js + Express).

## Estrutura

```
vinyl-control/
├── web/
│   ├── index.html
│   └── src/
│       ├── api/          
│       ├── components/
│       ├── pages/        
│       ├── state/        
│       ├── styles/
│       └── utils/
└── backend/
    ├── server.js
    ├── .env
    ├── prisma/
    └── src/
        ├── routes/
        ├── controllers/
        ├── services/
        └── db/
```

## Como rodar

Use dois terminais, um para cada parte

### 1. Backend

```bash
cd backend
npm i
```

Crie o arquivo `.env` na pasta `backend` :

```
PORT=3000
DATABASE_URL=...
```

Depois inicie a API:

```bash
npm run dev
```

Quando aparecer `API disponível na porta 3000`, a API está no ar

### 2. Front-end

```bash
cd web
npm i
npm run dev
```

Abra o endereço que o Vite mostrar no terminal (normalmente `http://localhost:5173`).

## Como o front fala com o backend

O front chama o backend diretamente, em `http://localhost:3000` por padrão, sem precisar de `.env`

### Rotas do backend

| Recurso | Rota base | Rotas |
| --- | --- | --- |
| Login | `/auth` | `POST /login` |
| Discos | `/disco` | `POST /cadastrar`, `GET /listar`, `GET /buscar/:id`, `PUT /atualizar/:id`, `DELETE /excluir/:id` |
| Movimentações | `/movimentacaoestoque` | mesmas rotas de `/disco` |
| Usuários | `/usuario` | mesmas rotas de `/disco` |

Os caminhos usados pelo front ficam no objeto `ROTAS`, no topo de `web/src/api/http.js`

### Nomes dos campos

A tradução entre os campos do front e os do backend fica em `web/src/api/mapeamento.js`. Se algum campo do backend tiver outro nome, altere só o valor correspondente nesse arquivo


## Tecnologias

- Front-end: Vite, JavaScript, CSS, fonte Poppins
- Backend: Node.js, Express, Prisma