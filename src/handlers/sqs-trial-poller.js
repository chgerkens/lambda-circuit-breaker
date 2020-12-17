const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const lambda = new AWS.Lambda({
    maxRetries: 0 // Avoid retries if target lambda function is timed out.
});

const queueName = process.env.QUEUE_NAME;
const functionName = process.env.FUNCTION_NAME;

exports.handler = async () => {
    console.log(`Resolve URL of queue with name ${queueName}...`);
    const queueUrlResult = await sqs.getQueueUrl({QueueName: queueName}).promise();
    const queueUrl = queueUrlResult.QueueUrl;

    console.log(`Poll queue ${queueUrl} for message...`);
    const data = await sqs.receiveMessage({
        QueueUrl: queueUrl,
        AttributeNames: ["All"]
    }).promise();

    if(data.Messages && data.Messages.length > 0) {
        console.log(`Message received. Invoking lambda function ${functionName} with SQS event...`);
        const sqsMessage = data.Messages[0];
        const sqsEvent = { Records: [{
            messageId: sqsMessage.MessageId,
            receiptHandle: sqsMessage.ReceiptHandle,
            body: sqsMessage.Body,
            md5OfBody: sqsMessage.MD5OfBody,
            attributes: sqsMessage.Attributes,
            messageAttributes: sqsMessage.MessageAttributes || {},
            eventSource: "aws:sqs",
            queueArn: data.QueueArn
        }]};
        try {
            const lambdaInvokeResult = await lambda.invoke({
                FunctionName: functionName,
                Payload: JSON.stringify(sqsEvent)
            }).promise();
            console.log("Invocation result: " + JSON.stringify(lambdaInvokeResult));
            if (lambdaInvokeResult.FunctionError) {
                console.log("Invocation with function error.");
                return "failed";
            }
            console.log("Invocation succeeded.");
        } catch (e) {
            console.log("Invocation failed: " + JSON.stringify(e));
            return "failed";
        }

        console.log(`Deleting message ${sqsMessage.MessageId} from queue...`);
        const deleteMessageResult = await sqs.deleteMessage({
            QueueUrl: queueUrl,
            ReceiptHandle: sqsMessage.ReceiptHandle
        }).promise();
        console.log("Message deleted. Result: " + JSON.stringify(deleteMessageResult));
        return "passed";
    } else {
        console.log("No messages available.");
        return "no-message-available";
    }

}