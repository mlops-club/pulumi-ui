import uvicorn
from pulumi_ui.main import create_app
from typer import Typer, Option

from typing import Optional
from pulumi_ui.settings import Settings
from pulumi_ui.pulumi_state import list_projects

cli = Typer()

@cli.command()
def up(
    state_uri: Optional[str] = None,
    debug: bool = Option(False, "--debug", help="Run in debug mode")
):
    settings_kwargs = {}
    if state_uri:
        settings_kwargs["pulumi_state_uri"] = state_uri
    settings = Settings(**settings_kwargs)

    print(list_projects(settings.pulumi_state_uri))

    app = create_app(settings=settings, debug=debug)
    uvicorn.run(app, host="localhost", port=8000)

@cli.command()
def help():
    print("help")

if __name__ == "__main__":
    cli()