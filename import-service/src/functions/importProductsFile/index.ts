import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import/',
        cors: true,
        request: {
          parameters: {
            querystrings: {
              name: true,
            },
          },
        },
        authorizer: {
          name: 'basicAuthorizer',
          type: 'token',
          arn: '${self:custom.authorizerArn}',
          resultTtlInSeconds: 0,
          identitySource: 'method.request.header.Authorization',
        },
      },
    },
  ],
};
