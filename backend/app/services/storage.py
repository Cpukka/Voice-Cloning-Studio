import os
import boto3
from botocore.exceptions import ClientError
from pathlib import Path
from typing import Optional
from ..core.config import settings

class StorageService:
    def __init__(self):
        self.use_s3 = settings.use_s3
        if self.use_s3:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=settings.aws_region
            )
            self.bucket = settings.aws_bucket_name
        else:
            self.local_path = Path("./storage")
            self.local_path.mkdir(exist_ok=True)
    
    def upload_file(self, file_content: bytes, file_path: str, content_type: str = "audio/wav") -> str:
        if self.use_s3:
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket,
                    Key=file_path,
                    Body=file_content,
                    ContentType=content_type
                )
                return f"https://{self.bucket}.s3.amazonaws.com/{file_path}"
            except ClientError as e:
                raise Exception(f"S3 upload failed: {e}")
        else:
            full_path = self.local_path / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            with open(full_path, "wb") as f:
                f.write(file_content)
            return f"/storage/{file_path}"
    
    def download_file(self, file_path: str) -> Optional[bytes]:
        if self.use_s3:
            try:
                response = self.s3_client.get_object(Bucket=self.bucket, Key=file_path)
                return response['Body'].read()
            except ClientError:
                return None
        else:
            full_path = self.local_path / file_path
            if full_path.exists():
                with open(full_path, "rb") as f:
                    return f.read()
            return None
    
    def delete_file(self, file_path: str) -> bool:
        if self.use_s3:
            try:
                self.s3_client.delete_object(Bucket=self.bucket, Key=file_path)
                return True
            except ClientError:
                return False
        else:
            full_path = self.local_path / file_path
            if full_path.exists():
                full_path.unlink()
                return True
            return False

storage_service = StorageService()