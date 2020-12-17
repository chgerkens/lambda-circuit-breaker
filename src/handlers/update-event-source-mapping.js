const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const queueArn = process.env.QUEUE_ARN;
const functionName = process.env.FUNCTION_NAME;

exports.handler = async (event) => {
    console.log(event);
    const listResponse = await lambda.listEventSourceMappings({
        EventSourceArn: queueArn,
        FunctionName: functionName
    }).promise();

    if (listResponse.EventSourceMappings && listResponse.EventSourceMappings.length > 0) {
        const eventSourceMapping = listResponse.EventSourceMappings[0];
        console.log(`Set event source mapping ${eventSourceMapping.UUID} enabled property to ${event.enabled}...`);
        await lambda.updateEventSourceMapping({
            UUID: eventSourceMapping.UUID,
            Enabled: event.enabled
        }).promise();
        return "ok";
    } else {
        console.log(`No / multiple event source for EventSourceArn ${queueArn} and funcation name ${functionName} found.`);
        return "failed";
    }
}