/**
 * A Lambda function that fails "on demand".
 * See https://github.com/gunnargrosch/failure-lambda for "failureLambda" configure options
 * outside this function code (SSM Parameter Store).
 * Beside failure-lambda options, the function will throw an Error when the body of the first message contains "error",
 * will wait 10 seconds for "timeout" or returns just "ok" otherwise.
 */
const failureLambda = require('failure-lambda');

exports.handler = failureLambda(async (event) => {
    console.info(JSON.stringify(event));
    switch (event.Records[0].body) {
        case "error":
            throw new Error("failed");
        case "timeout":
            await new Promise(resolve => setTimeout(resolve, 10000));
            return "timeout request not applied";
        default: return "ok";
    }
});
