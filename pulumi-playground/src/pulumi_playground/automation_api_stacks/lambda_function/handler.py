import json
import boto3
import os
from datetime import datetime

s3 = boto3.client('s3')
bucket_name = os.environ['BUCKET_NAME']

def lambda_handler(event, context):
    current_time = datetime.now().isoformat()
    file_name = f"request_{current_time}.json"

    s3.put_object(
        Bucket=bucket_name,
        Key=file_name,
        Body=json.dumps(event),
        ContentType='application/json'
    )

    return {
        'statusCode': 200,
        'body': json.dumps(f'Request saved as {file_name}')
    }
