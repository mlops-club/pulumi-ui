from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    pulumi_cloud_url: str