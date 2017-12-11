import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Comment } from 'semantic-ui-react';

import Messages from '../components/Messages';

const newChannelMessageSubscription = gql`
  subscription($channelId: Int!) {
    newChannelMessage(channelId: $channelId) {
      id
      text
      user {
        username
      }
      createdAt
    }
  }
`;

class MessageContainer extends Component {
  componentWillMount() {
    this.unsubscribe = this.subscribe(this.props.channelId);
  }

  subscribe = (channelId) => {
    this.props.data.subscribeToMore({
      document: newChannelMessageSubscription,
      variables: {
        channelId: channelId
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          ...prev,
          messages: [...prev.messages, subscriptionData.data.newChannelMessage]
        };
      }
    });
  }

  componentWillReceiveProps({ channelId }) {
    console.log('props:', channelId);
    if (this.props.channelId !== channelId) {
      if (this.unsubscribe) this.unsubscribe();
      this.unsubscribe = this.subscribe(channelId);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    const { data: { loading, messages } } = this.props;
    return (
      loading ? null : (
        <Messages>
          <Comment.Group>
            {messages.map(m => (
              <Comment key={`message-${m.id}`}>
                <Comment.Avatar src='/assets/images/avatar/elliot.jpg' />
                <Comment.Content>
                  <Comment.Author as='a'>{m.user.username}</Comment.Author>
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

const messagesQuery = gql`
  query($channelId: Int!) {
    messages(channelId: $channelId) {
      id
      text
      user {
        username
      }
      createdAt
    }
  }
`;

export default graphql(messagesQuery, {
  variables: props => ({
    channelId: props.channelId
  }),
  options: {
    fetchPolicy: 'network-only'
  }
})(MessageContainer);
