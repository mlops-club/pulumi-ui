import sys
import json
import pulumi
from pulumi import automation as auto
from pulumi_aws import s3, lambda_, apigatewayv2, iam
import os

# Get the current directory of the script
current_dir = os.path.dirname(os.path.abspath(__file__))

# This is the pulumi program in "inline function" form
def pulumi_program():
    # Create an S3 bucket
    bucket = s3.Bucket("lambda-rest-api-bucket")

    # Create the Lambda function
    lambda_role = iam.Role("lambda-role",
        assume_role_policy=json.dumps({
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "sts:AssumeRole",
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com",
                },
            }],
        }))

    # Attach necessary policies to the Lambda role
    iam.RolePolicyAttachment("lambda-basic-execution",
        role=lambda_role.name,
        policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole")

    iam.RolePolicyAttachment("lambda-s3-access",
        role=lambda_role.name,
        policy_arn="arn:aws:iam::aws:policy/AmazonS3FullAccess")

    lambda_func = lambda_.Function("api-lambda",
        runtime="python3.9",
        handler="handler.lambda_handler",
        role=lambda_role.arn,
        code=pulumi.AssetArchive({
            ".": pulumi.FileArchive(os.path.join(current_dir, "lambda_function"))
        }),
        environment={
            "variables": {
                "BUCKET_NAME": bucket.id
            }
        })

    # Create an API Gateway v2
    api = apigatewayv2.Api("http-api",
        protocol_type="HTTP",
        route_key="POST /",
        target=lambda_func.invoke_arn)

    # Grant API Gateway permission to invoke the Lambda function
    lambda_.Permission("api-lambda-permission",
        action="lambda:InvokeFunction",
        function=lambda_func.name,
        principal="apigateway.amazonaws.com",
        source_arn=api.execution_arn.apply(lambda arn: f"{arn}/*/*"))

    # Export the API endpoint URL and bucket name
    pulumi.export("api_endpoint", api.api_endpoint)
    pulumi.export("bucket_name", bucket.id)
    
    # Use apply() to create the example curl command
    example_curl = api.api_endpoint.apply(
        lambda endpoint: f"curl -X POST {endpoint} -H 'Content-Type: application/json' -d '{{\"key\": \"value\"}}'"
    )
    pulumi.export("example_curl_command", example_curl)

# To destroy our program, we can run `python main.py destroy`
destroy = False
args = sys.argv[1:]
if len(args) > 0:
    if args[0] == "destroy":
        destroy = True

project_name = "lambda-rest-api"
stack_name = "dev-2"

# create or select a stack matching the specified name and project.
# this will set up a workspace with everything necessary to run our inline program
stack = auto.create_or_select_stack(stack_name=stack_name,
                                    project_name=project_name,
                                    program=pulumi_program)

print("successfully initialized stack")

# for inline programs, we must manage plugins ourselves
print("installing plugins...")
stack.workspace.install_plugin("aws", "v4.0.0")
print("plugins installed")

# set stack configuration specifying the AWS region to deploy
print("setting up config")
stack.set_config("aws:region", auto.ConfigValue(value="us-west-2"))
print("config set")

print("refreshing stack...")
stack.refresh(on_output=print)
print("refresh complete")

if destroy:
    print("destroying stack...")
    stack.destroy(on_output=print)
    print("stack destroy complete")
    sys.exit()

print("updating stack...")
up_res = stack.up(on_output=print)
print(f"update summary: \n{json.dumps(up_res.summary.resource_changes, indent=4)}")

