import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Comment, Button } from 'semantic-ui-react';

import RenderText from '../components/RenderText';
import FileUpload from '../components/FileUpload';

const newChannelMessageSubscription = gql`
  subscription($channelId: Int!) {
    newChannelMessage(channelId: $channelId) {
      id
      text
      user {
        username
      }
      url
      filetype
      createdAt
    }
  }
`;

const Message = ({ message: { url, text, filetype } }) => {
  if (url) {
    if (filetype.startsWith('image/')) {
      return <div><img src={url} style={{maxWidth: '100%'}}/></div>;
    } else if (filetype.startsWith('text/')) {
      // else if (filetype === 'text/plain')
      return <RenderText url={url}/>
    } else if (filetype.startsWith('audio/')) {
      return (
        <div>
          <audio controls>
            <source src={url} type={filetype}/>
          </audio>
        </div>
      );
    }
  }
  return <Comment.Text>{text}</Comment.Text>
}

class MessageContainer extends Component {

  state = {
    hasMoreItems: true
  }

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
          messages: [subscriptionData.data.newChannelMessage, ...prev.messages]
        };
      }
    });
  }

  componentWillReceiveProps({ data: { messages }, channelId }) {
    // console.log('props:', channelId);
    if (this.props.channelId !== channelId) {
      if (this.unsubscribe) this.unsubscribe();
      this.unsubscribe = this.subscribe(channelId);
    }
    if (this.scroller && this.scroller.scrollTop < 100 && this.props.data.messages && messages && this.props.data.messages.length !== messages.length) {
      const heightBeforeRender = this.scroller.scrollHeight;
      setTimeout(() => {
        this.scroller.scrollTop = this.scroller.scrollHeight - heightBeforeRender;
      }, 100);

    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  handleScroll = () => {
    const { data: { messages, fetchMore }, channelId } = this.props;
    if (this.scroller && this.scroller.scrollTop < 100 && this.state.hasMoreItems && messages.length) {
      // console.log(this.scroller.scrollTop);
      fetchMore({
        variables: {
          channelId,
          curosr: messages[messages.length - 1]
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }

          if (fetchMoreResult.messages.length < 10) {
            this.setState({ hasMoreItems: false });
          }
          return {
            ...previousResult,
            messages: [...previousResult.messages, ...fetchMoreResult.messages]
          };
        }
      });
    }
  }

  render() {
    const { data: { loading, messages, fetchMore }, channelId } = this.props;
    return (
      loading ? null : (
        <div style={{
          gridColumn: 3,
          gridRow: 2,
          paddingLeft: '20px',
          paddingRight: '20px',
          overflowY: 'auto'
        }} ref={(scroller) => {this.scroller = scroller;}} onScroll={this.handleScroll}>
        <FileUpload disableClick channelId={channelId} style={{
          flexDirection: 'column-reverse',
          display: 'flex'

        }}>
          <Comment.Group>
            {this.state.hasMoreItems && messages.length >= 10 && <Button onClick={() => {
              fetchMore({
                variables: {
                  channelId,
                  curosr: messages[messages.length - 1]
                },
                updateQuery: (previousResult, { fetchMoreResult }) => {
                  if (!fetchMoreResult) {
                    return previousResult;
                  }

                  if (fetchMoreResult.messages.length < 10) {
                    this.setState({ hasMoreItems: false });
                  }
                  return {
                    ...previousResult,
                    messages: [...previousResult.messages, ...fetchMoreResult.messages]
                  };
                  // return Object.assign({}, previousResult, {
                  //   feed: [...previousResult.feed, ...fetchMoreResult.feed]
                  // })
                }
              });
            }}>Load more</Button>}
            {messages && [...messages].reverse().map(m => (
              <Comment key={`message-${m.id}`}>
                <Comment.Avatar src='/assets/images/avatar/elliot.jpg' />
                <Comment.Content>
                  <Comment.Author as='a'>{m.user.username}</Comment.Author>
                  <Comment.Metadata>
                    <div>{m.createdAt}</div>
                  </Comment.Metadata>
                  <Message message={m}/>
                  <Comment.Actions>
                    <Comment.Action>Reply</Comment.Action>
                  </Comment.Actions>
                </Comment.Content>
              </Comment>
            ))}
          </Comment.Group>
        </FileUpload>
        </div>
    ))
  }
}

const messagesQuery = gql`
  query($cursor: String, $channelId: Int!) {
    messages(cursor: $cursor, channelId: $channelId) {
      id
      text
      user {
        username
      }
      url
      filetype
      createdAt
    }
  }
`;

export default graphql(messagesQuery, {
  options: props => ({
    variables: {
      channelId: props.channelId
    },
    fetchPolicy: 'network-only'
  })
})(MessageContainer);
