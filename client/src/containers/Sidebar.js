import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';
import decode from 'jwt-decode';

import Channels from '../components/Channels';
import Teams from '../components/Teams';
import AddChannelModal from '../components/AddChannelModal';
import InvitePeopleModal from '../components/InvitePeopleModal';

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
    const { teams, team, username } = this.props;
    const { openInvitePeopleModal, openAddChannelModal } = this.state;

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
        isOwner={team.admin}
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
