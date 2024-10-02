import uvicorn
from pulumi_ui.main import create_app
from typer import Typer, Option

from typing import Optional
from pulumi_ui.settings import Settings
from pulumi_ui.pulumi_state import list_projects
import typer

from rich import print

cli = Typer()

STATE_URI_HELP_MSG = """\
The URI of the Pulumi state file.

file://path/to/.pulumi-state
s3://<bucket>/path/to/.pulumi
az://<container>/path/to/.pulumi
gs://<bucket>/path/to/.pulumi

If not specified, read from the PULUMI_STATE_URI environment variable.
"""

@cli.command()
def up(
    state_uri: Optional[str] = typer.Option(None, help=STATE_URI_HELP_MSG),
    debug: bool = Option(False, "--debug", help="Run in debug mode")
):
    """Launch the Pulumi UI."""
    settings_kwargs = {}
    if state_uri:
        settings_kwargs["pulumi_state_uri"] = state_uri
    settings = Settings(**settings_kwargs)

    app = create_app(settings=settings, debug=debug)
    uvicorn.run(app, host="localhost", port=8000)

@cli.command()
def help():
    print("help")

if __name__ == "__main__":
    cli()