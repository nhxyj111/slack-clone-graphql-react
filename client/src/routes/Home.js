import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const Home = ({ data: { loading, allUsers }}) => loading ? null : (
  <div>
    { allUsers.map(u => <h1 key={u.id}>{u.email}</h1>) }
  </div>
);

const allUsersQuery = gql`
  {
    allUsers {
      id
      email
    }
  }
`;

export default graphql(allUsersQuery)(Home);
