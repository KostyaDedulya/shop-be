import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductById';
import postProduct from '@functions/postProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const serverlessConfiguration: AWS = {
  service: 'getproductslist',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: '${env:PG_HOST}',
      PG_PORT: '${env:PG_PORT}',
      PG_DATABASE: '${env:PG_DATABASE}',
      PG_USERNAME: '${env:PG_USERNAME}',
      PG_PASSWORD: '${env:PG_PASSWORD}',
      TOPIC_ARN: {
        Ref: 'createProductTopic',
      },
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: {
          Ref: 'createProductTopic',
        },
      },
    ],
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic',
        },
      },
      productSub: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: '${env:EMAIL_PRODUCT}',
          Protocol: 'email',
          TopicArn: {
            Ref: 'createProductTopic',
          },
        },
      },
      expensiveProductSub: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: '${env:EMAIL_EXPENSIVE_PRODUCT}',
          Protocol: 'email',
          TopicArn: {
            Ref: 'createProductTopic',
          },
          FilterPolicy: {
            price: [{ numeric: ['>', 40] }],
          },
        },
      },
    },
    Outputs: {
      catalogItemsQueueURL: {
        Value: {
          Ref: 'catalogItemsQueue',
        },
        Export: {
          Name: 'catalogItemsQueueURL',
        },
      },
      catalogItemsQueueArn: {
        Value: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
        Export: {
          Name: 'catalogItemsQueueArn',
        },
      },
    },
  },
  useDotenv: true,
  // import the function via paths
  functions: { getProductsList, getProductsById, postProduct, catalogBatchProcess },
};

module.exports = serverlessConfiguration;
