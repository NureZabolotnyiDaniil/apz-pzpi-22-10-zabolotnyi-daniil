from fastapi import FastAPI
from contextlib import asynccontextmanager
from typing import AsyncIterator

from admin.views import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    print("Starting up...")
    yield
    print("Shutting down...")

app = FastAPI(openapi_url="/openapi.json", lifespan=lifespan)
app.include_router(admin_router)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
