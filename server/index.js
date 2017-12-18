import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { PubSub } from 'graphql-subscriptions';
import formidable from 'formidable';

// import typeDefs from './schema';
// import resolvers from './resolvers';
import models from './models';
import { refreshTokens } from './auth';

const types = fileLoader(path.join(__dirname, './schema'));
const typeDefs = mergeTypes(types);
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

const SECRET = 'xxxxyyyyzzzz';
const SECRET2 = 'xxxxyyyyzzzz2';

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();

app.use(cors('*'));

const addUser = async (req, res, next) => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      const { user } = jwt.verify(token, SECRET);
      req.user = user;
    } catch (err) {
      const refreshToken = req.headers['x-refresh-token'];
      const newTokens = await refreshTokens(
        token,
        refreshToken,
        models,
        SECRET,
        SECRET2
      );
      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }
  next();
};

const uploadDir = 'files';

const fileMiddleware = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  const form = formidable.IncomingForm({
    uploadDir,
  });

  form.parse(req, (error, { operations }, files) => {
    if (error) {
      console.log(error);
    }

    const document = JSON.parse(operations);

    if (Object.keys(files).length) {
      const { file: { type, path: filePath } } = files;
      console.log(type);
      console.log(filePath);
      document.variables.file = {
        type,
        path: filePath,
      };
    }

    req.body = document;
    next();
  });
};


app.use(addUser);

app.use('/graphql',
  bodyParser.json(),
  fileMiddleware,
  graphqlExpress((req) => ({
    schema,
    context: {
      models,
      user: req.user,
      SECRET,
      SECRET2
    }
  }))
);



app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: 'ws://127.0.0.1:8080/subscriptions'
}));

app.use('/files', express.static('files'))

const server = createServer(app);

models.sequelize.sync().then(() => {
  server.listen(8080, () => {
    new SubscriptionServer({
      execute,
      subscribe,
      schema,
      onConnect: async ({ token, refreshToken }, webSocket) => {
        if (token && refreshToken) {
          try {
            const { user } = jwt.verify(token, SECRET);
            return { user, models }
          } catch (err) {
            const refreshToken = req.headers['x-refresh-token'];
            const newTokens = await refreshTokens(
              token,
              refreshToken,
              models,
              SECRET,
              SECRET2
            );
            return { user: newTokens.user, models }
          }
          // if (!user) throw new Error('Invalid auth tokens');

          // const member = models.Member.findOne({ where: { teamId: 1, userId: user.id } });
          // if (!member) throw new Error('Missing auth tokens');

          return { models };
        }
        // throw new Error('Missing auth tokens');
        return { models };
      }
    }, {
      server,
      path: '/subscriptions',
    });
  });
});


