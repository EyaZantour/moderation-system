const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');

mongoose.connect('mongodb://localhost:27017/content');

const Message = mongoose.model('Message', new mongoose.Schema({
  content: String,
}));

const kafka = new Kafka({ clientId: 'content', brokers: ['localhost:9092'] });
const producer = kafka.producer();

const app = express();
app.use(bodyParser.json());

(async () => {
  await producer.connect();
})();

app.post('/content', async (req, res) => {
  const { content } = req.body;
  await new Message({ content }).save();
  await producer.send({
    topic: 'moderation-topic',
    messages: [{ value: content }],
  });
  res.send({ status: 'Content sent to moderation' });
});

app.listen(4001, () => console.log('Content Service on port 4001'));
