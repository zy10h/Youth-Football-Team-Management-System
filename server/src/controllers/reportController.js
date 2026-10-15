const { randomUUID } = require('node:crypto');

const {
  SQSClient,
  SendMessageCommand
} = require('@aws-sdk/client-sqs');

const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand
} = require('@aws-sdk/client-dynamodb');

const Player = require('../models/Player');
const Team = require('../models/Team');
const Coach = require('../models/Coach');

const REGION = process.env.AWS_REGION || 'ap-southeast-2';

const TABLE_NAME =
  process.env.REPORT_TABLE_NAME || 'n12291773-a3-report-jobs';

const QUEUE_URL = process.env.REPORT_QUEUE_URL;

const dynamodb = new DynamoDBClient({ region: REGION });
const sqs = new SQSClient({ region: REGION });

// Calculate age from date of birth instead of relying on stored age.
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return -1;

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return -1;

  const today = new Date();

  let age =
    today.getUTCFullYear() - birthDate.getUTCFullYear();

  const birthdayPassed =
    today.getUTCMonth() > birthDate.getUTCMonth() ||
    (
      today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() >= birthDate.getUTCDate()
    );

  if (!birthdayPassed) age--;

  return age >= 0 ? age : -1;
}

// POST /api/reports
async function createReport(req, res) {
  const ownerId = req.user?.id
    ? String(req.user.id)
    : null;

  if (!ownerId) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  if (!QUEUE_URL) {
    return res.status(503).json({
      message: 'Report queue is not configured'
    });
  }

  const jobId = randomUUID();
  const now = new Date().toISOString();

  let jobCreated = false;
  let messageSent = false;

  try {
    // Read only the information required for the report.
    const [players, teamsCount, coachesCount] =
      await Promise.all([
        Player.find(
          {},
          {
            dateOfBirth: 1,
            preferredPosition: 1,
            _id: 0
          }
        ).lean(),

        Team.countDocuments(),

        Coach.countDocuments()
      ]);

    // Do not send names or guardian contact information to SQS.
    const snapshot = {
      players: players.map(player => ({
        age: calculateAge(player.dateOfBirth),
        preferredPosition:
          player.preferredPosition || 'Unknown'
      })),
      teamsCount,
      coachesCount
    };

    const messageBody = JSON.stringify({
      jobId,
      snapshot
    });

    // Keep the message comfortably below SQS size limits.
    if (Buffer.byteLength(messageBody, 'utf8') > 200000) {
      return res.status(413).json({
        message: 'Report data is too large'
      });
    }

    // Create the job record before sending the message.
    await dynamodb.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          jobId: { S: jobId },
          ownerId: { S: ownerId },
          status: { S: 'QUEUED' },
          createdAt: { S: now },
          updatedAt: { S: now }
        },
        ConditionExpression: 'attribute_not_exists(jobId)'
      })
    );

    jobCreated = true;

    // Send the job to SQS.
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: messageBody
      })
    );

    messageSent = true;

    // Return immediately without waiting for Lambda.
    return res.status(202).json({
      jobId,
      status: 'QUEUED',
      message: 'Report job submitted successfully'
    });

  } catch (error) {
    console.error('Failed to create report:', error);

    // If sending to SQS fails, mark the job as failed.
    if (jobCreated && !messageSent) {
      try {
        await dynamodb.send(
          new UpdateItemCommand({
            TableName: TABLE_NAME,
            Key: {
              jobId: { S: jobId }
            },
            UpdateExpression:
              'SET #status = :status, updatedAt = :time',
            ExpressionAttributeNames: {
              '#status': 'status'
            },
            ExpressionAttributeValues: {
              ':status': { S: 'FAILED' },
              ':time': { S: new Date().toISOString() }
            }
          })
        );
      } catch (updateError) {
        console.error(
          'Failed to update report status:',
          updateError
        );
      }
    }

    return res.status(500).json({
      message: 'Failed to submit report'
    });
  }
}

// GET /api/reports/:jobId
async function getReport(req, res) {
  try {
    const ownerId = req.user?.id
      ? String(req.user.id)
      : null;

    if (!ownerId) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const { jobId } = req.params;

    const response = await dynamodb.send(
      new GetItemCommand({
        TableName: TABLE_NAME,
        Key: {
          jobId: { S: jobId }
        },
        ConsistentRead: true
      })
    );

    const item = response.Item;

    // Do not reveal another user's report.
    if (!item || item.ownerId?.S !== ownerId) {
      return res.status(404).json({
        message: 'Report not found'
      });
    }

    return res.json({
      jobId,
      status: item.status?.S || 'UNKNOWN',
      createdAt: item.createdAt?.S || null,
      updatedAt: item.updatedAt?.S || null,
      result: item.result?.S
        ? JSON.parse(item.result.S)
        : null
    });

  } catch (error) {
    console.error('Failed to get report:', error);

    return res.status(500).json({
      message: 'Failed to retrieve report'
    });
  }
}

module.exports = {
  createReport,
  getReport
};