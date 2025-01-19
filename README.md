# Wallet App

A full-stack wallet application to help users manage their accounts, set budgets, and track spending. The app supports creating accounts, categories, and subcategories, setting budgets (overall and per account), and provides transaction reports. Notifications are sent via sockets when spending exceeds the set budget.

---

## Features

- **Accounts**: Create and manage multiple accounts.
- **Categories/Subcategories**: Organize transactions under categories and subcategories.
- **Budgets**:
  - Set an overall budget.
  - Set individual budgets for specific accounts.
- **Transaction**: Add new transactions and View detailed reports of all transactions.
- **Notifications**: Get real-time notifications when spending exceeds the set budget via socket.
---

## Getting Started

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kayigmb/COAchallenge.git
   cd COAchallenge
   ```

2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Configure environment variables:
   - Copy the `.env.example` file to `.env`.
   - Update the `.env` file with your desired configuration.

4. Run the setup script to configure the backend environment:
   ```bash
   ./setup
   or 
   make setup
   ```

5. Apply database migrations:
   ```bash
   make migrate
   or 
   poetry run alembic revision --autogenerate  -m "New migration" && \
   poetry run alembic upgrade head 
   ```

6. Start the backend server:
   ```bash
   make run
   or
   poetry run python3 -m uvicorn main:app --reload --port {PORT}
   ```

---

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Configure the frontend environment:
   - Open the `.env.example` file.
   - Copy it to `.env` and update it with your desired configuration.

3. Start the development server:
   ```bash
   npm run dev
   ```

---

## Notifications

- The app uses WebSockets to notify users when spending exceeds their set budget.
- Ensure the backend and frontend are properly connected for real-time notifications to function.

---

## Folder Structure

```
wallet-app/
├── backend/       # Backend codebase
│   ├── setup      # Setup script
│   ├── Makefile   # Contains `migrate`, `setup` and `run` commands
│   ├── .env       # Environment variables for backend
│   └── ...
├── frontend/      # Frontend codebase
│   ├── .env       # Environment variables for frontend
│   └── ...
└── README.md      # Documentation
```

---

## Dependencies

### Backend
- Python (FastAPI)
- PostgreSQL
- WebSocket support

### Frontend
- NextJs 
- Tailwind CSS
- Shadcn

---

## Notes

- Ensure that PostgreSQL is running and accessible before starting the backend.
- Configure both the backend and frontend environments correctly to avoid connection issues.

---

Happy budgeting! 🎉

