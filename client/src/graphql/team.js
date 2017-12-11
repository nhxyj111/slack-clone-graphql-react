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
      channels {
        id
        name
      }
    }
  }
}
`;
