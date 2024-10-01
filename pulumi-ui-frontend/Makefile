generate-lockfile:
	docker run --rm -v "$(PWD):/app" -w /app --platform linux/arm64 node:22-bookworm-slim sh -c "npm install -g pnpm && pnpm install --lockfile-only"

.PHONY: generate-lockfile