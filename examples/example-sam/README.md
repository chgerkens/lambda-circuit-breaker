# AWS SAM example application

Example on how to add the [Lambda Circuit Breaker Solution](../../README.md) to an AWS SAM application.

It creates the following AWS resource (incl. required IAM roles and policies): 
- **SQS Queue**
- **SQS Dead-Letter Queue**
- **Lambda Function** "FaultyFunction", that fails "on-demand" (controlled via message body or SSM parameter configuration)
- **Nested Circuit Breaker SAM Appplication**

## Deploy the Example

### AWS SAM CLI

To use the AWS SAM CLI, you need the following tools:

* AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
* Node.js - [Install Node.js 12](https://nodejs.org/en/), including the npm package management tool.

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided
```

The first command will build the source of the application. The second command will package and deploy your application to AWS, with a series of prompts:

* **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your target lambda function.
* **AWS Region**: The AWS region you want to deploy your app to.
* **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
* **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modified IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
* **Save arguments to samconfig.toml**: If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to your application.

Open the [**Applications**](https://console.aws.amazon.com/lambda/home#/applications) page of the Lambda console, and choose your application. When the deployment completes, view the application resources on the **Overview** tab.

Send more then 10 SQS message within 10 seconds to the created queue  (via web console or AWS CLI) will activate the circuit breaker.

## Cleanup

To delete the sample application and the bucket that you created, use the AWS CLI.

```bash
my-application$ aws cloudformation delete-stack --stack-name sam-app
my-application$ aws s3 rb s3://BUCKET_NAME
```

**Attention**: If you don't clean the application, make sure that SQS queues are empty and that
 there are no running step function executions active.