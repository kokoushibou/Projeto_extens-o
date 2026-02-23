# Agenda do Salão (React Native + Expo + TypeScript)

Aplicativo mobile para gerenciamento de um salão com agenda diária, cadastro de clientes, serviços e agendamentos.

## Funcionalidades

- 5 telas principais:
  - **Agenda**
  - **Novo/Editar Agendamento**
  - **Clientes**
  - **Detalhe do Cliente (com histórico)**
  - **Serviços**
- Persistência local com **SQLite** usando `expo-sqlite`.
- CRUD completo de:
  - clientes
  - serviços
  - agendamentos
- Ações rápidas na agenda para alterar status com um toque.
- Aviso de conflito ao salvar agendamento na mesma data + hora (com confirmação para continuar).

## Banco de dados

As tabelas são criadas automaticamente ao iniciar o app:

- `clients(id,name,phone,notes,createdAt,updatedAt)`
- `services(id,name,durationMin,defaultPrice,createdAt,updatedAt)`
- `appointments(id,date,startTime,durationMin,clientId,serviceId,price,status,notes,createdAt,updatedAt)`

Status permitidos em agendamentos:

- `MARCADO`
- `CONCLUIDO`
- `FALTOU`
- `CANCELADO`

## Estrutura do projeto

```text
src/
  components/
  db/
  screens/
  types/
  utils/
```

## Como rodar

```bash
npm install
npx expo start
```

## Observações

- Não há login, nuvem, notificações ou integração com WhatsApp.
- Navegação implementada com React Navigation (stack).
