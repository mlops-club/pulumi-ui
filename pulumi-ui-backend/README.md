<p align="center">
    <img src="https://raw.githubusercontent.com/mlops-club/pyprojen/c5b6755a803f7c6f18a42b7cea6f9eb9c917c417/logo.png">
    <h3 align="center">pyprojen</h3>
</p>

<p align="center">
  A minimal, Python-centric port of <a href="https://projen.io/">projen</a>.
</p>

<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge&logo=apache" alt="Apache 2.0 License">
  </a>
  <!-- <a href="https://gitpod.io/#https://github.com/mlops-club/pyprojen">
    <img src="https://img.shields.io/badge/Gitpod-ready--to--code-blue?style=for-the-badge&logo=gitpod" alt="Gitpod ready-to-code">
  </a> -->
  <a href="https://github.com/mlops-club/pyprojen/commits/main">
    <img src="https://img.shields.io/github/commit-activity/w/projen/projen?style=for-the-badge&logo=github" alt="Commit activity">
  </a>
  <a href="https://www.youtube.com/watch?v=SOWMPzXtTCw">
    <img src="https://img.shields.io/badge/Projen%20debut%20demo-red?style=for-the-badge&logo=youtube" alt="Projen debut demo">
  </a>
</p>

<br/>

## Overview

Project templates are great... except that they promote "code duplication at scale" and all the technical debt that come with that.

[`projen`](https://projen.io/) (the tool this project is based on) represents a new generation of project template tools. `projen` helps you manage the "day 2 problem" for project templates, to avoid "template drift".

`projen` also helps you treat project configuration as an abstraction, whose implementation details can be changed/improved, without disrupting the developer workflow. Elad Ben-Israel, creator of `projen`, `AWS CDK`, and Winglang gave a [talk on this at CDK day 2020](https://www.youtube.com/watch?v=SOWMPzXtTCw).

1. ⚡️ **Agility.** Centrally push unit-tested updates to all existing projects created from your templates in *minutes, not months*.
2. 🧱 **Modularity.** Define composable, parameterized "components" that you can add/remove from your project as needed.

## Real Examples

`pyprojen` is a minimal port of `projen`'s core functionality to Python.

Specifically, it gets you

1. ⚡️ **Agility**

  - **Examples:**
    - 10x the speed of CI for all repos overnight by making CI steps run in parallel instead of serially
    - Update a team linting rule in `pyproject.toml`, `ruff.toml`, etc.
    - Add auth steps to publish to or install from a private PyPI registry in CI or `Dockerfile`s
    - Completely change CI systems with minimal disruption, e.g. switch from Bitbucket Pipelines to GitHub Actions to AWS CodeBuild and back

2. 🧱 **Modularity**

  - **Examples**:
    1. define an opinionated `PythonPackage` component, and
    1. layer on top a
        - `FastAPIApp`,
        - `StreamlitApp`,
        - `CdkApp`,
        - `PulumiApp`,
        - `AirflowDag`,
        - `DagsterDag`,
        - `BentoMLService`,
        - `AwsLambdaPythonFunction`,
        - etc.
    1. Add (or remove) as many of these to your repo as you like, whenever you like, and find these packages instantly set up with CI, linting, formatting, tests, packaging, publishing, deploying, etc.
        - For example, you might incrementally develop a "mini data science app monorepo" with
          1. a `MetaflowDag` that trains a model
          1. served in a `FastAPI` app
          1. which you can interact with via a `Streamlit` app
          1. both of which are deployed by an `AwdCdk` app
        - all of these components would ideally be instantly set up with CI, linting, formatting, testing, packaging, publishing, deployment, etc. the moment they are added. And "un set up" with those if they are removed.

## Q&A

> ### How does `(py)projen` compare to `copier` or `cookiecutter`?

<details>
<summary>Click to expand</summary>

[`copier`](https://copier.readthedocs.io/en/stable/) is a reaction to `cookiecutter`, built to allow template updates to be propagated to existing projects.

1. **Migration.** The migration process for `(py)projen` is a single CLI command (`python .pyprojenrc.py`). Whereas the migration process for `copier` is [a bit more manual](https://copier.readthedocs.io/en/stable/updating/#how-the-update-works) and prone to errors.

2. **Composable components.** `copier` is more like `cookiecutter` in that it uses Jinja templates to generate a certain set of files. `(py)projen` lets you define re-usable components. You can add arbitrary numbers of these components to your project with different parameters and remove them just as easily.

That said, although `cookiecutter` and `copier` are more limited, they are also simpler.
</details>

> ### What is the difference between `pyprojen` and `projen`?

<details>
<summary>Click to expand</summary>

#### 1. Fundamentally, `projen` offers a few things:

1. A `Project`, `Component`, and `Construct` abstraction that lets you define reusable components that you can push updates to.
2. Primitive components like `TextFile`, `YamlFile`, `JsonFile`, `MarkdownFile`, etc. that you can compose to build "higher-level components".
3. A library of opinionated, higher-level components like `PythonProject`, `TypescriptProject`, `DockerCompose`, `GithubWorkflow`, ...
4. An opinionated "task runner" system (think `Makefile/Justfile`, `poetry` scripts, etc.) to define project-related commands.
5. A `projen new` command which creates the initial `.projenrc.py` config file for your project

#### 2. `pyprojen` implements [1] and [2] from the list above (the unopinionated parts).

It is up to you to create your own components with your own opinions on things like

- when, if, and how to manage virtual environments, e.g. `uv`, `pip`, `conda`, etc.
- which linter/formatter to use, e.g. `ruff`, `pre-commit`, etc.
- how to structure single- and multi-package repos (monorepos) and CI for them

Coming from tools like `cookiecutter` or `copier`, many people/teams prefer than using off-the-shelf templates or components.

#### 3. `pyprojen` is not a drop-in replacement for `projen`, but it tries to get close.

If you write components in Python using `pyprojen`, it should be easy to move them over to the `projen` Python bindings if you decide to.
</details>

> ### Should I use `pyprojen` or `projen`?

<details>
<summary>Click to expand</summary>

**TL;DR** Bias towards `projen`, unless you

1. Want a Python-first dev experience, and
2. Prefer to fully-define your own project template/components rather than using projen's existing project templates, higher-level components, or task runner system

`projen` is a larger project and is primarily maintained by developers at AWS. `projen`,

But to develop with `projen`, you either need to write TypeScript, or use generated Python bindings that invoke TypeScript.

If you are familiar with writing AWS CDK in Python, developing with `projen` in Python is a similar experience, because they both use Python bindings generated from TypeScript using the [JSII](https://github.com/aws/jsii) project.

This means:

1. Not all internals of the original TS/JS code is exposed in the TS bindings, e.g. private attributes. You can unexectedly hit dead ends when attributes or methods that are available in TS are simply not available in Python.
2. Step debugging is limited. The bindings are thin wrappers around a tool that invokes the original TypeScript/JavaScript code
3. Errors raised by python bindings are cryptic and difficult to parse.
4. Autocompletion is poor
5. You need to have NodeJS installed on your system and in CI
6. The JSII is a bit slow. (seconds not milliseconds)
</details>

## Quick start (TODO)

> [!NOTE]
> Until this section is filled out, you can refer to [this repo](https://github.com/phitoduck/phito-projen) to get a sense of what projen can do. And the official [projen docs](https://projen.io/) contain many of the same concepts that this port uses.

```bash
pip install pyprojen
```

```python
from pyprojen import ...
```

## Developing/Contributing

### System requirements

You will need the following installed on your machine to develop on this codebase

- `make` AKA `cmake`, e.g. `sudo apt-get update -y; sudo apt-get install cmake -y`
- Python 3.7+, ideally using `pyenv` to easily change between Python versions
- `git`

###

```bash
# clone the repo
git clone https://github.com/<your github username>/pyprojen.git

# install the dev dependencies
make install

# run the tests
make test
```
