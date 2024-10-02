import uvicorn
from pulumi_ui.main import create_app
from typer import Typer, Option

from typing import Optional
from pulumi_ui.settings import Settings
from pulumi_ui.pulumi_state import list_projects

cli = Typer()

@cli.command()
def up(
    cloud_url: Optional[str] = None,
    debug: bool = Option(False, "--debug", help="Run in debug mode")
):
    settings_kwargs = {}
    if cloud_url:
        settings_kwargs["pulumi_cloud_url"] = cloud_url
    settings = Settings(**settings_kwargs)

    print(list_projects(settings.pulumi_cloud_url))

    app = create_app(settings=settings, debug=debug)
    uvicorn.run(app, host="localhost", port=8000)

@cli.command()
def help():
    print("help")

if __name__ == "__main__":
    cli()