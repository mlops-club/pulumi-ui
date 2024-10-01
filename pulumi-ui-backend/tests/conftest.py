"""
Register pytest plugins, fixtures, and hooks to be used during test execution.

Docs: https://stackoverflow.com/questions/34466027/in-pytest-what-is-the-use-of-conftest-py-files
"""


import sys
from pathlib import Path

THIS_DIR = Path(__file__).parent
TESTS_DIR_PARENT = (THIS_DIR / "..").resolve()

# add the parent directory of tests/ to PYTHONPATH
# so that we can use "from tests.<module> import ..." in our tests and fixtures
sys.path.insert(0, str(TESTS_DIR_PARENT))

# module import paths to python files containing fixtures
pytest_plugins = [
    # e.g. "tests/fixtures/example_fixture.py" should be registered as:
    "tests.fixtures.example_fixture",
]
