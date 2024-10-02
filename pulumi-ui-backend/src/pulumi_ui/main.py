from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pathlib import Path
from pulumi_ui.routes import ROUTER
from pulumi_ui.settings import Settings

# Get the directory of the current file
THIS_DIR = Path(__file__).parent.resolve()

# Resolve the path to the static directory
STATIC_DIR = THIS_DIR / "static"


def create_app(settings: Settings = None, debug: bool = False):
    settings = settings or Settings()

    app = FastAPI(debug=debug)
    app.state.settings = settings

    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],  # Vite dev server default port
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(ROUTER)

    if debug:
        # Use the React app's build directory directly in debug mode
        react_build_dir = THIS_DIR.parent.parent.parent / "pulumi-ui-frontend" / "dist"
        app.mount("/", StaticFiles(directory=str(react_build_dir), html=True), name="static")
    else:
        app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
   
    # redirect / to /index.html
    @app.get("/")
    async def root():
        return RedirectResponse("/index.html")

    return app