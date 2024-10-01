# Pulumi UI

Pulumi UI is a web-based application for visualizing and managing self-hosted Pulumi state. It consists of a FastAPI backend and a React frontend, allowing users to view and interact with their Pulumi stacks and resources.

## Quickstart

```bash
make clean build run-wheel
```

## Project Structure

The project is organized into three main directories:

1. `pulumi-ui-backend/`: FastAPI backend
2. `pulumi-ui-frontend/`: React frontend
3. `pulumi-playground/`: Pulumi project for testing and development

## Prerequisites

- Python 3.11+
- Node.js 22+ (use `nvm` for version management)
- pnpm 9+
- Pulumi CLI

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/pulumi-ui.git
   cd pulumi-ui
   ```

2. Install dependencies:
   ```
   make install
   ```

   This will install both backend and frontend dependencies.

## Frontend (pulumi-ui-frontend)

The frontend uses the following tools and libraries:

- pnpm: Package manager
- Vite: Build tool and development server
- TypeScript: Typed superset of JavaScript
- React: UI library
- React Flow: Library for rendering node-based UIs
- Material-UI: React component library

To set up the frontend for development:

1. Ensure you're using the correct Node.js version:
   ```
   nvm use
   ```
   (This project includes an `.nvmrc` file for automatic version selection)

2. Install dependencies:
   ```
   cd pulumi-ui-frontend
   pnpm install
   ```

3. Start the development server:
   ```
   pnpm dev
   ```

## Backend (pulumi-ui-backend)

The backend uses:

- FastAPI: Modern, fast (high-performance) web framework for building APIs
- Uvicorn: ASGI server for running the FastAPI application

The backend also serves the frontend as static files in production.

To run the backend independently:

```
cd pulumi-ui-backend
pip install -e ".[dev]"
uvicorn pulumi_ui.main:app --reload
```

## Pulumi Playground (pulumi-playground)

> [!NOTE]
> Assumes there is a `pulumi-ui` AWS profile available.

The Pulumi Playground is used to generate sample Pulumi state for development and testing.

To set up Pulumi:

1. Install Pulumi CLI:
   ```
   brew install pulumi
   ```

2. Install Python dependencies:
   ```
   cd pulumi-playground
   pip install -e ".[dev]"
   ```
   Note: Use `pip` instead of `uv` to ensure compatibility with the Pulumi CLI.

3. Run Pulumi commands:
   ```
   make pulumi-up
   ```

The Pulumi Playground writes state that the backend serves to the frontend, which the frontend then visualizes.

## Running the Application

To run both the backend and frontend concurrently:

```
make dev
```

This will start the backend on `http://localhost:8000` and the frontend on `http://localhost:5173`.

## Development

- Backend (FastAPI):
  - Source code: `pulumi-ui-backend/src/pulumi_ui/`
  - Run independently: `cd pulumi-ui-backend && make dev`

- Frontend (React):
  - Source code: `pulumi-ui-frontend/src/`
  - Run independently: `cd pulumi-ui-frontend && pnpm dev`

- Pulumi Playground:
  - Source code: `pulumi-playground/src/pulumi_playground/pulumi_app/`
  - Run Pulumi commands: `cd pulumi-playground && make pulumi-up`

## Building the Application

To build the entire application (frontend and backend):

```
make build
```

This will build both the frontend and backend, resulting in a fully built application.
