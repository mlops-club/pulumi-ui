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

```bash
AWS_PROFILE=pulumi-ui AWS_REGION=us-west-2 pulumi login --state-uri s3://mlops-club-pulumi-state 
```

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


## TODOs

- [ ] Tests
  - [ ] Create a set of sample JSON files representing stacks for testing
  - [ ] Use something like `selenium` or `pylenium` to write UI tests (or `playwright`)

- SAML and SSO
  - [ ] SAML: Do a POC following [this guide](https://blog.purple-technology.com/how-to-build-serverless-app-with-saml-auth-via-aws-iam-identity-center/) to determine the work involved in supporting SAML.
  - [ ] SAML local dev environment: try to get a docker-compose with something thate emulates a SAML IdP, e.g. KeyCloak
  - [ ] Try FastAPI SSO with a provider, e.g. local emulated IdP in docker, or maybe AWS Cognito and localstack, etc.

Stack View
- [ ] Tab view
   - [x] `Readme` -> Render the `readme` output of the stack as html
   - [ ] Overview -> Should have the following sections
     - [ ] `View JSON` button -> Opens a model with the stack's syntax-highlighted JSON
     - [ ] Configuration - table view. Config keys and values
     - [ ] Outputs - table view. Names and values of outputs.
     - [ ] Tags - table view. Tag keys and values.
       - [ ] `+ New Tag` button. Opens modal. with key/value inputs and a cancel and save button.
         - reaches out to the backend api. Mutates the JSON. Adds a tag.
   - [ ] Resources
     - [ ] Has 2 tabs
         - [ ] **1. Table View,** 
           - 2 columns
             - [ ] icon (show svg icon of resource, or fall back to provider if not available, or fall back to blank)
             - [ ] Type, 
             - [ ] Name
           - [ ] Clicking a row or a node in the graph should show a "resource view"
             - [ ] Overview table
               - There will be exactly 3 rows and 2 columns. The columns contain the key/value of
                 - Type
                 - URN
                 - Stack Version
             - [ ] Outputs - 2 cols. Key/value for each output. Shows "No Outputs" and an icon if there are none.
             - [ ] Children - Table of same shape as the resources table, but limited to the children. 
         - [ ] **2. Graph View** - Shows the React flow component.
            - [x] each node should show the resource urn, abbreviated if longer than 25 characters
            - [ ] When a resource node clicked, takes you to a resource view
            - [x] To the right of the resource node, a small icon that can collapse/expand the node, showing it's children
            - [x] Child resources display to the right and vertically stacked
            - [ ] The expand/collapse action should be animated, like in Pulumi Cloud
            - [ ] Icon System: Each graph node should have an icon

   
