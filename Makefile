# Execute the "targets" in this file with `make <target>` e.g. `make help`.

install:
	bash run.sh install

dev:
	bash run.sh dev

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

.PHONY: install dev build lint test clean help