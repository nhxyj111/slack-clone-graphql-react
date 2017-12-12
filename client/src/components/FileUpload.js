import React from 'react';
import Dropzone from 'react-dropzone';

const FileUpload = ({ children, disableClick }) => (
  <Dropzone className="ignore"
    disableClick={disableClick}
    onDrop={(file) => console.log(file)}
  >
    {children}
  </Dropzone>
);

export default FileUpload;
