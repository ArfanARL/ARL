from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from secrets import compare_digest
import os

app = FastAPI(title="Agentic Research Labs AI Service", version="0.2.0", description="Private AI capability service; execution remains disabled until governance controls are configured.")

class CapabilityRequest(BaseModel):
    task: str = Field(min_length=1, max_length=120)
    input_text: str = Field(min_length=1, max_length=12000)
    correlation_id: str | None = Field(default=None, max_length=100)

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}

def require_service_token(token: str | None) -> None:
    expected = os.getenv("AI_SERVICE_TOKEN", "")
    if not expected or not token or not compare_digest(token, expected):
        raise HTTPException(status_code=401, detail="Unauthorized internal service request")

@app.get("/internal/v1/capabilities")
def capabilities(x_service_token: str | None = Header(default=None)):
    require_service_token(x_service_token)
    return {"capabilities": ["document-analysis", "knowledge-retrieval", "agent-workflows"], "execution_enabled": False}

@app.post("/internal/v1/tasks")
def submit_task(request: CapabilityRequest, x_service_token: str | None = Header(default=None)):
    require_service_token(x_service_token)
    # Deliberately fail closed: no model/provider is configured and no input is sent to an external model.
    return {"status": "not_configured", "task": request.task, "correlation_id": request.correlation_id, "message": "AI execution is disabled until provider controls, data classification, audit logging and human review are approved."}
