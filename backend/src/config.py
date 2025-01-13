from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_URL: str
    PORT: int
    ALGORITHM: str
    SECRET_KEY: str
    EXPIRE_MINUTES: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
