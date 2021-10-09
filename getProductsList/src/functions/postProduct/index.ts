import { handlerPath } from '@libs/handlerResolver';

const schema = {
  type: "object",
  properties: {
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    price: {
      type: 'number'
    },
    count: {
      type: 'number'
    },
  },
  required: ['title', 'description', 'price', 'count']
}

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'products/',
        cors: true,
        request: {
          schemas: {
            'application/json': schema
          }
        }
      },
    },
  ],
};
