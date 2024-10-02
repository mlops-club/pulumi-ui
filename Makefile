# Execute the "targets" in this file with `make <target>` e.g. `make help`.

install:
	bash run.sh install

dev:
	bash run.sh dev

dev-aws:
	bash run.sh dev-aws

build:
	bash run.sh build

lint:
	bash run.sh lint

test:
	bash run.sh test

clean:
	bash run.sh clean

help:
	bash run.sh help

run-wheel:
	bash run.sh run_built_wheel

.PHONY: install dev dev-aws build lint test clean help run-wheel