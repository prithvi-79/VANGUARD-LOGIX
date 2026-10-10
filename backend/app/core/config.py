"""
VANGUARD-LOGIX Application Configuration
Supports environment variable overrides and sensible defense-theater defaults.
"""

import os
from typing import List

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    from pydantic import Field

    class Settings(BaseSettings):
        model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

        PROJECT_NAME: str = "VANGUARD-LOGIX"
        VERSION: str = "0.1.0"
        DESCRIPTION: str = "Indian Army Northern Command XIV Corps Forward Tactical Supply Chain & Predictive Logistics Engine"
        API_PREFIX: str = "/api"
        DATABASE_URL: str = Field(
            default_factory=lambda: os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./vanguard.db")
        )
        SEED: int = 26251
        THEATER: str = "NORTHERN_COMMAND_XIV_CORPS"
        HEADQUARTERS: str = "Leh (14 Corps HQ)"
        CORS_ORIGINS: List[str] = ["*"]
        ENVIRONMENT: str = "development"
        LOG_LEVEL: str = "INFO"

except ImportError:
    from pydantic import BaseModel

    class Settings(BaseModel):  # type: ignore[no-redef]
        PROJECT_NAME: str = "VANGUARD-LOGIX"
        VERSION: str = "0.1.0"
        DESCRIPTION: str = "Indian Army Northern Command XIV Corps Forward Tactical Supply Chain & Predictive Logistics Engine"
        API_PREFIX: str = "/api"
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./vanguard.db")
        SEED: int = 26251
        THEATER: str = "NORTHERN_COMMAND_XIV_CORPS"
        HEADQUARTERS: str = "Leh (14 Corps HQ)"
        CORS_ORIGINS: List[str] = ["*"]
        ENVIRONMENT: str = "development"
        LOG_LEVEL: str = "INFO"


settings = Settings()
