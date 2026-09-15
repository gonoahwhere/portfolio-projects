## Project Structure

This project is split into two main parts:

### `backend/`
- Contains the Flask server written in python
- Handles:
    - API routes for frontend communication
    - Database creation and interaction (SQL)
- Entry point: `__main__.py`

### `frontend/`
- Contains the React application
- Handles:
    - User interface (UI)
    - User interactions
    - Requests to the backend API
- Entry point: `src/index.js`

## Scripts

### `npm start`

Runs both the Flask backend and React development server concurrently.

> ⚠️ The React frontend must be started from the `frontend/` directory.

This uses the following command:

```
"start": "cross-env PYTHONDONTWRITEBYTECODE=1 concurrently -k -n FLASK,REACT -c yellow,magenta \"cd .. && python3 -m backend\" \"node start-react.cjs\""
```

## Breakdown

- `cross-env`: Ensures compatibility across Windows, macOS and Linux
- `PYTHONDONTWRITEBYTECODE=1`: Prevents `.pyc` / `__pycache__` files from being created
- `concurrently`: Runs multiple processes at once
- `-k`: Stops all processes if one fails
- `-c yellow,magenta`: Adds colour to differentiate the logs
- `cd .. && python3 -m backend`: Starts the Flask backend in Python3
- `node start-react.cjs`: Starts the React frontend

## Dependencies

All commands below should be run from the **project root directory**.

> Make sure you have Python3 installed. Windows may require installation, macOS and Linux it is standard

### Backend

Installing dependencies for the backend

> If you `cd` into `backend/`

```bash
cd backend/
python3 -m pip install -r requirements.txt
```

> If you're in the **project root directory**

```bash
python3 -m pip install -r backend/requirements.txt
```

### Frontend

Installing dependencies for the front end

```bash
cd frontend/
npm install
```

> You can do `npm i` for simplicity if you would like!

## How It Works

- The **Flask backend** runs a local server that handles data and database operations
- The **React frontend** runs in the browser and communicates with the backend using API routes
- Running `npm start` from the `frontend/` directory launches both together for development
