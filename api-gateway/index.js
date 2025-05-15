const express = require('express');
const axios = require('axios');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLSchema } = require('graphql');

const app = express();
app.use(express.json());

// REST endpoint → forwards to content-service
app.post('/submit', async (req, res) => {
  const { content } = req.body;
  try {
    const response = await axios.post('http://localhost:4001/content', { content });
    res.send({ status: 'Message forwarded via gateway', data: response.data });
  } catch (err) {
    console.error(' Error forwarding to content-service:', err.message);
    res.status(500).send({ error: 'Failed to forward request' });
  }
});

// GraphQL → queries moderation-service
const MessageType = new GraphQLObjectType({
  name: 'Message',
  fields: {
    content: { type: GraphQLString },
    classification: { type: GraphQLString }
  }
});

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    messages: {
      type: new GraphQLList(MessageType),
      resolve: async () => {
        try {
          const res = await axios.get('http://localhost:4002/messages');
          return res.data;
        } catch (error) {
          console.error(' Error fetching messages from moderation-service:', error.message);
          throw new Error('Unable to fetch moderated messages');
        }
      }
    }
  }
});

const schema = new GraphQLSchema({ query: RootQuery });

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.listen(4000, () => console.log('✅ API Gateway running on http://localhost:4000'));
