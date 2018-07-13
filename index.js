const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const DataLoader = require('dataloader');

// Some fake data
const books = {
  harry: {
    title: "Harry Potter and the Sorcerer's stone",
    authorId: 'rowling',
  },
  harry2: {
    title: "Harry Potter and the Seven dwarfs",
    authorId: 'rowling',
  },
  jurassic: {
    title: 'Jurassic Park',
    authorId: 'crichton',
  },
};

const authors = {
  rowling: {name: 'J.K. Rowling'},
  crichton: {name: 'Michael Crichton'},
}

// The GraphQL schema in string form
const typeDefs = `
  type Query { book(bookId: String!): Book }
  type Book { title: String, author: Person }
  type Person { name: String }
`;

// The resolvers
const resolvers = {
  Query: {
    book: (parent, args, context) => context.bookLoader.load(args.bookId),
  },
  Book: {
    author: (parent, args, context) => context.authorLoader.load(parent.authorId),
  }
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Initialize the app
const app = express();
app.use(cors())

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress((req) => {
  const bookLoader = new DataLoader(bookIds => {
    console.log('loading books:', bookIds)
    return Promise.resolve(bookIds.map(id => books[id]))
  });
  const authorLoader = new DataLoader(authorIds => {
    console.log('loading authors:', authorIds)
    return Promise.resolve(authorIds.map(id => authors[id]))
  })
  return { schema, context: {bookLoader, authorLoader} }
}));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3001, () => {
  console.log('Go to http://localhost:3001/graphiql to run queries!');
});