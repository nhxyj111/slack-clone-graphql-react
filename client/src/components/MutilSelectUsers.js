import React from 'react';
import { graphql } from 'react-apollo';
import { Dropdown } from 'semantic-ui-react';

import { getTeamMembersQuery } from '../graphql/team';

const MutilSelectUsers = ({
  data: { loading, getTeamMembers },
  value,
  handleChange,
  placeholder,
  currentUserId}) => loading ? null : (
  <Dropdown
    fluid multiple search selection
    options={getTeamMembers.filter(tm => tm.id !== currentUserId).map(tm => ({
      key: tm.id,
      value: tm.id,
      text: tm.username
    }))}
    onChange={handleChange}
    value={value}
    placeholder={placeholder}

  />
);

export default graphql(getTeamMembersQuery, {
  options: ({ teamId }) => ({
    variables: { teamId }
  })
})(MutilSelectUsers);
