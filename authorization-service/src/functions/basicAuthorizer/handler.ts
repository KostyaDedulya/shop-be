import 'source-map-support/register';

import { Callback, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import { middyfy } from '@libs/lambda';

const basicAuthorizer = async (event: APIGatewayTokenAuthorizerEvent, _, cb: Callback) => {
  console.log(`Event: ${JSON.stringify(event)}`);

  if (event.type !== 'TOKEN') cb('Unauthorized');

  try {
    const { authorizationToken, methodArn } = event;
    const encodedCreds = authorizationToken.split(' ')[1];
    const buffer = Buffer.from(encodedCreds, 'base64');
    const creds = buffer.toString('utf-8').split(':');
    const [username, password] = creds;

    console.log(`Username: ${username}, password: ${password}`);

    const savedPassword = process.env.PASSWORD;
    const permission = !savedPassword || savedPassword != password ? 'Deny' : 'Allow';

    const policy = generatePolicy(encodedCreds, methodArn, permission);

    cb(null, policy);
  } catch (e) {
    cb('Unauthorized');
  }

  cb(null, 'Allow');
};

const generatePolicy = (principalId, resource, effect = 'Allow') => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};

export const main = middyfy(basicAuthorizer);
