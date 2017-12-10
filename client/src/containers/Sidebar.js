import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';
import decode from 'jwt-decode';

import Channels from '../components/Channels';
import Teams from '../components/Teams';
import AddChannelModal from '../components/AddChannelModal';
import InvitePeopleModal from '../components/InvitePeopleModal';
import { allTeamsQuery } from '../graphql/team';

class Sidebar extends Component {
  state = {
    openAddChannelModal: false,
    openInvitePeopleModal: false
  }

  toggleAddChannelModal = (e) => {
    if (e) e.preventDefault();
    this.setState(state => ({ openAddChannelModal: !state.openAddChannelModal }));
  }

  toggleInvitePeopleModal = (e) => {
    if (e) e.preventDefault();
    this.setState(state => ({ openInvitePeopleModal: !state.openInvitePeopleModal }));
  }

  render() {
    const { teams, team } = this.props;
    const { openInvitePeopleModal, openAddChannelModal } = this.state;
    let isOwner = false;
    // if (loading) {
    //   return null;
    // }
    // const teamIdx = currentTeamId ? findIndex(allTeams, ['id', parseInt(currentTeamId, 10)]) : 0;
    // const team = allTeams[teamIdx];
    let username = '';
    try {
      const token = localStorage.getItem('token');
      const { user } = decode(token);
      username = user.username;
      isOwner = user.id === team.owner;
    } catch(err) {

    }
    return [
      <Teams
        key="team-sidebar"
        teams={teams.map(t => ({
          id: t.id,
          letter: t.name.charAt(0).toUpperCase()
        }))}
      />,
      <Channels
        key="channel-sidebar"
        teamName={team.name}
        username={username}
        teamId={team.id}
        isOwner={isOwner}
        channels={team.channels}
        users={[{id: 1, name: "slackbot"}, {id: 2, name: 'fbbooot'}]}
        onAddChannelClick={this.toggleAddChannelModal}
        onInvitePeopleClick={this.toggleInvitePeopleModal}
      />,
      <AddChannelModal
        open={openAddChannelModal}
        key="sidebar-add-channel-modal"
        onClose={this.toggleAddChannelModal}
        teamId={team.id}
      />,
      <InvitePeopleModal
        open={openInvitePeopleModal}
        key="sidebar-invite-people-modal"
        onClose={this.toggleInvitePeopleModal}
        teamId={team.id}
      />
    ];
  }
}

export default Sidebar;
