import React from 'react';
import { graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';
import { Redirect } from 'react-router-dom';

import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import Messages from '../components/Messages';
import SendMessage from '../components/SendMessage';
import MessageContainer from '../containers/MessageContainer';

import SideBar from '../containers/Sidebar';
import { meQuery } from '../graphql/team';

const ViewTeam = ({ data: { loading, me }, match: { params: { teamId, channelId } } }) => {
  if (loading) return null;
  const { teams, username } = me;

  if (!teams.length) {
    return <Redirect to="/create-team"/>;
  }
  let teamIdInteger = parseInt(teamId, 10);

  const teamIdx = teamIdInteger ? findIndex(teams, ['id', teamIdInteger]) : 0;
  const team = teamIdx === -1 ? teams[0] : teams[teamIdx];

  let channelIdInteger = parseInt(channelId, 10);
  const channelIdx = channelIdInteger ? findIndex(team.channels, ['id', channelIdInteger]) : 0;
  const channel = channelIdx === -1 ?  team.channels[0] : team.channels[channelIdx];
  return (
    <AppLayout>
      <SideBar teams={teams} team={team} username={username}/>
      {channel && <Header channelName={channel.name}/>}

      {channel && (
        <MessageContainer channelId={channel.id}/>
      )}

      {channel && <SendMessage channelName={channel.name} channelId={channel.id}/>}
    </AppLayout>
  );
};

export default graphql(meQuery, {
  options: 'network-only'
})(ViewTeam);
