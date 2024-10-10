from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    pulumi_state_uri: str
