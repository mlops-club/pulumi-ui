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
    (cd "$BACKEND_DIR" && python -m pulumi_ui.cli up --debug)
}

function dev:frontend {
    (cd "$FRONTEND_DIR" && npm run build -- --watch)
}

function dev {
    trap 'kill 0' SIGINT
    dev:frontend &
    dev:backend &
    wait
}

function dev:backend-aws {
    (cd "$BACKEND_DIR" && AWS_PROFILE="pulumi-ui" AWS_REGION="us-west-2" python -m pulumi_ui.cli up --cloud-url s3://mlops-club-pulumi-state --debug)
}

function dev-aws {
    trap 'kill 0' SIGINT
    dev:frontend &
    dev:backend-aws &
    wait
}

function build:backend {
    (cd "$BACKEND_DIR" && python -m build --sdist --wheel .)
}

function build:frontend {
    (cd "$FRONTEND_DIR" && npm run build)
}

function build {
    # Build frontend
    (cd "$FRONTEND_DIR" && npm run build)
    
    # Copy built files to the backend static folder
    mkdir -p "$BACKEND_DIR/src/pulumi_ui/static"
    cp -r "$FRONTEND_DIR/dist/"* "$BACKEND_DIR/src/pulumi_ui/static/"

    # Build backend wheel
    (cd "$BACKEND_DIR" && python -m build --wheel)
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