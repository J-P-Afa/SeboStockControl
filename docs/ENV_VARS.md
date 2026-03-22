# 🛠 Variáveis de Ambiente (Environment Variables)

Este guia consolida todas as variáveis de ambiente necessárias para a execução completa do **SeboStockControl**.

## 📦 Backend (`backend/.env`)

| Variável | Descrição | Exemplo / Padrão |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o PostgreSQL | `postgresql://admin:admin123@localhost:5432/sebo_db` |
| `PORT` | Porta onde o servidor NestJS irá rodar | `3001` |
| `JWT_SECRET` | Chave secreta para assinatura de tokens JWT | `mudar-para-algo-seguro-em-producao` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `1d` |

## 💻 Frontend (`frontend/.env.local`)

| Variável | Descrição | Exemplo / Padrão |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL base da API do Backend | `http://localhost:3001/api` |

---

> [!IMPORTANT]
> Em produção, NUNCA utilize as chaves padrão. Utilize um gerenciador de segredos ou variáveis de ambiente injetadas via CI/CD / Docker.
