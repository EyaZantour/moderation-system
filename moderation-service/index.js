const express = require('express');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// === MongoDB ===
mongoose.connect('mongodb://localhost:27017/moderation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error(' MongoDB connection error:', err);
});

const Message = mongoose.model('Message', new mongoose.Schema({
  content: String,
  classification: String
}));

// === Kafka ===
const kafka = new Kafka({
  clientId: 'moderation',
  brokers: ['localhost:9092']
});
const consumer = kafka.consumer({ groupId: 'moderation-group' });

// === gRPC ===
const PROTO_PATH = path.resolve(__dirname, '../proto/classifier.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const classifierProto = grpc.loadPackageDefinition(packageDefinition).classifier;

const grpcClient = new classifierProto.Classifier(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// === Kafka Consumer Run ===
async function startKafkaConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'moderation-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const content = message.value.toString();
      grpcClient.Classify({ text: content }, async (err, res) => {
        if (err) {
          console.error('❌ gRPC error:', err.message);
          return;
        }

        await new Message({
          content,
          classification: res.category
        }).save();

        console.log(`✅ Saved "${content}" as ${res.category}`);
      });
    }
  });
}
startKafkaConsumer().catch(console.error);

// === Express API ===
const app = express();
app.use(express.json());

app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).send({ error: 'Failed to fetch messages' });
  }
});

app.listen(4002, () => {
  console.log('Moderation service listening on port 4002');
});
