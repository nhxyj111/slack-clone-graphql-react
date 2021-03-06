import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Comment } from 'semantic-ui-react';

import Messages from '../components/Messages';


const newDirectMessageSubscription = gql`
subscription($teamId: Int!, $userId: Int!) {
  newDirectMessage(teamId: $teamId, userId: $userId) {
    id
    text
    sender {
      username
    }
    createdAt
  }
}
`;

class DirectMessageContainer extends Component {
  componentWillMount() {
    this.unsubscribe = this.subscribe(this.props.teamId, this.props.userId);
  }

  subscribe = (teamId, userId) => {
    this.props.data.subscribeToMore({
      document: newDirectMessageSubscription,
      variables: {
        teamId,
        userId
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          ...prev,
          directMessages: [...prev.directMessages, subscriptionData.data.newDirectMessage]
        };
      }
    });
  }

  componentWillReceiveProps({ teamId, userId }) {
    if (this.props.teamId !== teamId || this.props.userId !== userId) {
      if (this.unsubscribe) this.unsubscribe();
      this.unsubscribe = this.subscribe(teamId, userId);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    const { data: { loading, directMessages } } = this.props;
    console.log(directMessages);
    return (
      loading ? null : (
        <Messages>
          <Comment.Group>
            {directMessages.map(m => (
              <Comment key={`direct-message-${m.id}`}>
                <Comment.Avatar src='/assets/images/avatar/elliot.jpg' />
                <Comment.Content>
                  <Comment.Author as='a'>{m.sender.username}</Comment.Author>
                  <Comment.Metadata>
                    <div>{m.createdAt}</div>
                  </Comment.Metadata>
                  <Comment.Text>{m.text}</Comment.Text>
                  <Comment.Actions>
                    <Comment.Action>Reply</Comment.Action>
                  </Comment.Actions>
                </Comment.Content>
              </Comment>
            ))}
          </Comment.Group>
        </Messages>
    ))
  }
}

const directMessagesQuery = gql`
  query($teamId: Int!, $userId: Int!) {
    directMessages(teamId: $teamId, otherUserId: $userId) {
      id
      text
      sender {
        username
      }
      createdAt
    }
  }
`;

export default graphql(directMessagesQuery, {
  options: props => ({
    variables: {
      teamId: props.teamId,
      userId: props.userId
    },
    fetchPolicy: 'network-only'
  })
})(DirectMessageContainer);
