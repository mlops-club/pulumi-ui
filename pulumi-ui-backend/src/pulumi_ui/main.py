from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import RedirectResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
from pathlib import Path
import os
from pulumi_ui.routes import ROUTER


# Get the directory of the current file
THIS_DIR = Path(__file__).parent.resolve()

# Resolve the path to the static directory
STATIC_DIR = THIS_DIR / "static"


def create_app():
    app = FastAPI()

    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],  # Vite dev server default port
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(ROUTER)

    app.mount("/static", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
   
   # redirect / to /static/index.html
    @app.get("/")
    async def root():
        return RedirectResponse("/static/index.html")

    return app