import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import findIndex from 'lodash/findIndex';
import { Redirect } from 'react-router-dom';

import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import SendMessage from '../components/SendMessage';
import DirectMessageContainer from '../containers/DirectMessageContainer';

import SideBar from '../containers/Sidebar';
import { meQuery } from '../graphql/team';

const ViewTeam = ({
  mutate,
  data: { loading, me, getUser }, match: { params: { teamId, userId } } }) => {
  if (loading) return null;
  const { teams, username } = me;

  if (!teams.length) {
    return <Redirect to="/create-team"/>;
  }
  let teamIdInteger = parseInt(teamId, 10);

  const teamIdx = teamIdInteger ? findIndex(teams, ['id', teamIdInteger]) : 0;
  const team = teamIdx === -1 ? teams[0] : teams[teamIdx];

  return (
    <AppLayout>
      <SideBar teams={teams} team={team} username={username}/>

      <Header channelName={getUser.username}/>
      <DirectMessageContainer teamId={team.id}  userId={userId}/>

      <SendMessage onSubmit={async (text)=>{
        const response = await mutate({
          variables: { text, receiverId: userId, teamId },
          optimisticResponse: {
            createDirectMessage: true
          },
          update: (store) => {
            const data = store.readQuery({ query: meQuery });
            const teamIdx2 = findIndex(data.me.teams, ['id', team.id]);
            const notAlreadyThere = data.me.teams[teamIdx2].directMessageMembers.every(member => member.id !== parseInt(userId, 10));
            if (notAlreadyThere) {
              data.me.teams[teamIdx2].directMessageMembers.push({
                __typename: 'User',
                id: userId,
                username: 'someone'
              });
            }
            store.writeQuery({ query: meQuery, data });
          }
        });
        console.log(response);
      }} placeholder={userId}/>
    </AppLayout>
  );
};

const directMessageMeQuery = gql`
query($userId: Int!){
  getUser(userId: $userId) {
    username
  }
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

const createDirectMessageMutation = gql`
  mutation($receiverId: Int!, $text: String!, $teamId: Int!) {
    createDirectMessage(receiverId: $receiverId, text: $text, teamId: $teamId)
  }
`;

export default compose(
  graphql(directMessageMeQuery, {
    options: props => ({
      fetchPolicy: 'network-only',
      variables: {
        userId: props.match.params.userId
      }
    })
  }),
  graphql(createDirectMessageMutation),
)(ViewTeam);
