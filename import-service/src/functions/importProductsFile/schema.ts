export default {
  type: 'object',
  properties: {
    url: { type: 'string' },
  },
  required: ['name'],
} as const;
