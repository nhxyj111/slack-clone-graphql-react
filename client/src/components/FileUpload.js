import React from 'react';
import Dropzone from 'react-dropzone';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const FileUpload = ({ children, disableClick, channelId, mutate, style={} }) => (
  <Dropzone className="ignore"
    style={style}
    disableClick={disableClick}
    onDrop={ async ([file]) => {
      const response = await mutate({
        variables: { channelId, file }
      });
      console.log(response);
    }}
  >
    {children}
  </Dropzone>
);

const createFileMessage = gql`
  mutation($channelId: Int!, $file: File) {
    createMessage(channelId: $channelId, file: $file)
  }
`

export default graphql(createFileMessage)(FileUpload);
