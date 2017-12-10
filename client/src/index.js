import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';

import registerServiceWorker from './registerServiceWorker';

// import { ApolloClient } from 'apollo-client';
// import { createHttpLink } from 'apollo-link-http';
// import { InMemoryCache } from 'apollo-cache-inmemory';
// import { ApolloProvider } from 'react-apollo';
// import { setContext } from 'apollo-link-context';


import 'semantic-ui-css/semantic.min.css';

import Routes from './routes';
import client from './apollo';


// const httpLink = createHttpLink({
//   uri: 'http://localhost:8080/graphql'
// });

// const authLink = setContext((_, { headers }) => {
//   const token = localStorage.getItem('token');
//   const refreshToken = localStorage.getItem('refreshToken');
//   return {
//     headers: {
//       ...headers,
//       'x-token': token,
//       'x-refresh-token': refreshToken
//     }
//   }
// });

// const client = new ApolloClient({
//   link: authLink.concat(httpLink),
//   // link: createHttpLink({ uri: 'http://localhost:8080/graphql' }),
//   cache: new InMemoryCache()
// });


const App = (
  <ApolloProvider client={client}>
    <Routes />
  </ApolloProvider>
);

ReactDOM.render(App, document.getElementById('root'));
registerServiceWorker();
