from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}

# Add more API routes as needed

# Remove the if __name__ == "__main__" block, as we'll run it differently for development