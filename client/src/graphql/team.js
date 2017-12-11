import gql from 'graphql-tag';

export const meQuery = gql`
{
  me {
    id
    username
    email
    teams {
      id
      name
      admin
      channels {
        id
        name
      }
    }
  }
}
`;
