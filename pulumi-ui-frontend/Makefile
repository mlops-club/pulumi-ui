# Execute the "targets" in this file with `make <target>` e.g. `make help`.

install:
	npm install

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

test:
	npm test

clean:
	rm -rf dist node_modules

generate-lockfile:
	docker run --rm -v "$(PWD):/app" -w /app --platform linux/arm64 node:22-bookworm-slim sh -c "npm install -g pnpm && pnpm install --lockfile-only"

.PHONY: install dev build lint test clean generate-lockfile