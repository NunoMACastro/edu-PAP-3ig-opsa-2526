# BK-MF0-12 - Criar Armazéns e Localizações

## Descrição

Este projeto implementa a funcionalidade de gestão de armazéns e localizações.

Permite:

- Criar armazéns
- Listar armazéns
- Criar localizações associadas a um armazém
- Validar dados obrigatórios
- Impedir localizações duplicadas no mesmo armazém

---

## Estrutura do Projeto

```text
src/
├── schema.prisma
├── routes.js
├── controller.js
├── services.js
├── validators.js
```

---

## Tecnologias Utilizadas

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JavaScript

---

## Endpoints

### Listar Armazéns

```http
GET /warehouses
```

### Criar Armazém

```http
POST /warehouses
```

Exemplo:

```json
{
  "code": "ARM001",
  "name": "Armazém Principal"
}
```

### Criar Localização

```http
POST /warehouses/:id/locations
```

Exemplo:

```json
{
  "code": "A1-01"
}
```

---

## Validações

### Armazém

- Código obrigatório
- Nome obrigatório

### Localização

- Código obrigatório
- Não permite códigos repetidos no mesmo armazém

---

## Base de Dados

Executar:

```bash
npx prisma generate
npx prisma migrate dev --name create_warehouses
```

---

## Autor

Nome: TEU NOME

Curso: GPSI

Módulo: BK-MF0-12