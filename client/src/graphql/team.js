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
      directMessageMembers {
        id
        username
      }
      channels {
        id
        name
      }
    }
  }
}
`;
