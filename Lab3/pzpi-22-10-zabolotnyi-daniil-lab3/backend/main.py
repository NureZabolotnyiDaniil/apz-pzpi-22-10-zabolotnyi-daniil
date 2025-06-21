from contextlib import asynccontextmanager
from typing import AsyncIterator
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

# Import models to ensure they are registered with SQLAlchemy
from models.db_activity import DatabaseActivity
from routers.admin.views import router as admin_router
from routers.lantern.views import router as lantern_router
from routers.renovation.views import router as renovation_router
from routers.breakdown.views import router as breakdown_router
from routers.park.views import router as park_router
from routers.statistics.views import router as statistics_router
from routers.repairman.views import router as repairman_router
from routers.company.views import router as company_router
from routers.mobile.views import router as mobile_router
from routers.updates.views import router as updates_router
from routers.activities.views import router as activities_router
from iot.views import router as iot_router
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    print("Starting up...")
    yield
    print("Shutting down...")


app = FastAPI(openapi_url="/openapi.json", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "SmartLighting API",
        "version": "1.0",
        "docs": "/docs",
        "status": "running"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Тестовий endpoint для перевірки CORS
@app.get("/test")
async def test_cors():
    return {
        "message": "CORS test successful",
        "timestamp": "2024-01-01T12:00:00Z",
        "status": "ok"
    }

app.include_router(admin_router)
app.include_router(lantern_router)
app.include_router(breakdown_router)
app.include_router(renovation_router)
app.include_router(park_router)
app.include_router(repairman_router)
app.include_router(company_router)
app.include_router(mobile_router)
app.include_router(updates_router)
app.include_router(activities_router)
app.include_router(statistics_router)
app.include_router(iot_router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="SmartLighting API",
        version="1.0",
        description="SmartLighting arkpz project",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }
    for path, methods in openapi_schema["paths"].items():
        for method, details in methods.items():
            if not (path.startswith("/admin/") and method == "post"):
                details["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
