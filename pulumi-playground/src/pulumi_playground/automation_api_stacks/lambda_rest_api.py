import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx
import json
from pulumi import AssetArchive, FileArchive
from pathlib import Path

THIS_DIR = Path(__file__).parent
LAMBDA_FUNCTION_DIR = THIS_DIR / "../automation_api_stacks/lambda_function"
LAMBDA_LAYER_DIR = THIS_DIR / "../automation_api_stacks/lambda_layer"

class LambdaRestApiStack(pulumi.Stack):
    def __init__(self, name: str, opts: pulumi.ResourceOptions = None):
        super().__init__(name, opts)

        # Create an S3 bucket
        bucket = aws.s3.Bucket("lambda-rest-api-bucket")

        # Create a Docker build for the Lambda layer
        layer_image = awsx.ecr.Image("lambda-layer",
            repository_url=awsx.ecr.get_repository("lambda-layer-repo").url,
            path=str(LAMBDA_LAYER_DIR),
            extra_options=["--platform=linux/amd64"])

        # Create a Lambda layer from the Docker build
        layer = aws.lambda_.LayerVersion("lambda-layer",
            layer_name="lambda-dependencies",
            compatible_runtimes=["python3.9"],
            code=layer_image.image_uri)

        # Create the Lambda function
        lambda_func = aws.lambda_.Function("api-lambda",
            runtime="python3.9",
            handler="handler.lambda_handler",
            role=aws.iam.get_role(name="lambda-role").arn,
            code=AssetArchive({
                ".": FileArchive(str(LAMBDA_FUNCTION_DIR))
            }),
            layers=[layer.arn],
            environment={
                "variables": {
                    "BUCKET_NAME": bucket.id
                }
            })

        # Create an API Gateway v2
        api = aws.apigatewayv2.Api("http-api",
            protocol_type="HTTP",
            route_key="POST /",
            target=lambda_func.invoke_arn)

        # Grant API Gateway permission to invoke the Lambda function
        invoke_permission = aws.lambda_.Permission("api-lambda-permission",
            action="lambda:InvokeFunction",
            function=lambda_func.name,
            principal="apigateway.amazonaws.com",
            source_arn=api.execution_arn.apply(lambda arn: f"{arn}/*/*"))

        # Export the API endpoint URL
        pulumi.export("api_endpoint", api.api_endpoint)
        pulumi.export("bucket_name", bucket.id)

