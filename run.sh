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
    build:backend
    build:frontend
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

# print all functions in this file
function help {
    echo "$0 <task> <args>"
    echo "Tasks:"
    compgen -A function | cat -n
}

TIMEFORMAT="Task completed in %3lR"
time ${@:-help}