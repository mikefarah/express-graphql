const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const DataLoader = require('dataloader');

// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// The GraphQL schema in string form
const typeDefs = `
  type Query { book(bookId: String): Book }
  type Book { title: String, author: String }
`;

// The resolvers
const resolvers = {
  Query: {
    book: (parent, args, context) => context.bookLoader.load(args.bookId),
  },
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress((req) => {
  const bookLoader = new DataLoader((seriesIds) => {
    console.log('loadign books for ', seriesIds)
    return Promise.resolve(seriesIds.map(x => books[0]))
  });
  return { schema, context: {bookLoader} }
}));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3000, () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});