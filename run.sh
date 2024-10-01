#!/bin/bash

set -e

#####################
# --- Constants --- #
#####################

THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
BACKEND_DIR="$THIS_DIR/pulumi-ui-backend"
FRONTEND_DIR="$THIS_DIR/pulumi-ui-frontend"

##########################
# --- Task Functions --- #
##########################

function install:backend {
    (cd "$BACKEND_DIR" && uv pip install --editable ".[dev]")
}

function install:frontend {
    (cd "$FRONTEND_DIR" && npm install)
}

function install {
    install:backend
    install:frontend
}

function dev:backend {
    (cd "$BACKEND_DIR" && uvicorn pulumi_ui.main:app --reload --host 0.0.0.0 --port 8000)
}

function dev:frontend {
    (cd "$FRONTEND_DIR" && npm run dev)
}

function dev {
    trap 'kill 0' SIGINT
    dev:backend &
    dev:frontend &
    wait
}

function build:backend {
    (cd "$BACKEND_DIR" && python -m build --sdist --wheel .)
}

function build:frontend {
    (cd "$FRONTEND_DIR" && npm run build)
}

function build {
    # Build frontend using Docker
    docker build -t pulumi-ui-frontend:latest -f "$FRONTEND_DIR/Dockerfile" "$FRONTEND_DIR"
    
    # Copy built files from the Docker image to the backend static folder
    mkdir -p "$BACKEND_DIR/src/pulumi_ui/static"
    docker run --rm -v "$BACKEND_DIR/src/pulumi_ui/static:/output" pulumi-ui-frontend:latest sh -c "cp -r /app/dist/* /output/"

    # Build backend wheel using Docker
    docker run --rm \
        -v "$BACKEND_DIR:/app" \
        -v "$HOME/.cache/pip:/root/.cache/pip" \
        -w /app \
        --platform linux/amd64 \
        python:3.11-bookworm \
        sh -c "
            set -ex
            pip install --upgrade pip
            pip install build
            python -m build --wheel
        "
}

function lint:backend {
    (cd "$BACKEND_DIR" && pre-commit run --all-files)
}

function lint:frontend {
    (cd "$FRONTEND_DIR" && npm run lint)
}

function lint {
    lint:backend
    lint:frontend
}

function test:backend {
    (cd "$BACKEND_DIR" && python -m pytest)
}

function test:frontend {
    (cd "$FRONTEND_DIR" && npm test)
}

function test {
    test:backend
    test:frontend
}

function clean:backend {
    (cd "$BACKEND_DIR" && bash run.sh clean)
}

function clean:frontend {
    (cd "$FRONTEND_DIR" && rm -rf dist node_modules)
}

function clean {
    clean:backend
    clean:frontend
}

# Add these functions to the run.sh file

function ensure_pipx {
    if ! command -v pipx &> /dev/null; then
        echo "pipx not found. Installing pipx..."
        python3 -m pip install pipx
        python3 -m pipx ensurepath
    fi
}

function run_built_wheel {
    WHEEL_FILE=$(ls -t "$BACKEND_DIR/dist/"*.whl | head -n1)

    deactivate || true
    rm -rf .tmp-venv || true
    uv venv .tmp-venv
    source .tmp-venv/bin/activate
    uv pip install "$WHEEL_FILE"
    .tmp-venv/bin/pulumi-ui up
}

function generate_lockfile {
    docker run --rm -v "$FRONTEND_DIR:/app" -w /app --platform linux/arm64 node:22-bookworm-slim sh -c "npm install -g pnpm && pnpm install --lockfile-only"
}

# ... (keep the existing functions)

# Modify the help function to include the new function
function help {
    echo "$0 <task> <args>"
    echo "Tasks:"
    compgen -A function | grep -v "^_" | sort | cat -n
}

TIMEFORMAT="Task completed in %3lR"
time ${@:-help}