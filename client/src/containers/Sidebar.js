import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';
import decode from 'jwt-decode';

import Channels from '../components/Channels';
import Teams from '../components/Teams';
import AddChannelModal from '../components/AddChannelModal';
import InvitePeopleModal from '../components/InvitePeopleModal';
import DirectMessageModal from '../components/DirectMessageModal';

class Sidebar extends Component {
  state = {
    openAddChannelModal: false,
    openInvitePeopleModal: false,
    openDirectMessageModal: false
  }

  toggleDirectMessageModal = (e) => {
    if (e) e.preventDefault();
    this.setState(state => ({ openDirectMessageModal: !state.openDirectMessageModal }));
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
    const { openInvitePeopleModal, openAddChannelModal, openDirectMessageModal } = this.state;

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
        users={team.directMessageMembers}
        onAddChannelClick={this.toggleAddChannelModal}
        onInvitePeopleClick={this.toggleInvitePeopleModal}
        onDirectMessageClick={this.toggleDirectMessageModal}
      />,
      <AddChannelModal
        open={openAddChannelModal}
        key="sidebar-add-channel-modal"
        onClose={this.toggleAddChannelModal}
        teamId={team.id}
      />,
      <DirectMessageModal
        open={openDirectMessageModal}
        key="sidebar-direct-message-modal"
        onClose={this.toggleDirectMessageModal}
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
