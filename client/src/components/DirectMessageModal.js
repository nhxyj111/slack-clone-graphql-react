import React from 'react';
import { Button, Form, Modal, Input } from 'semantic-ui-react';
// import Downshift from 'downshift'
import { graphql, compose } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { withFormik } from 'formik';
import gql from 'graphql-tag';
import findIndex from 'lodash/findIndex';

// import { getTeamMembersQuery } from '../graphql/team';
import MutilSelectUsers from './MutilSelectUsers';
import { meQuery } from '../graphql/team';
const DirectMessageModal = ({
  open,
  values,
  onClose,
  teamId,
  currentUserId,
  handleSubmit,
  isSubmitting,
  setFieldValue,
  resetForm,
  history
  // data: { loading, getTeamMembers }
}) => (
  <Modal open={open} onClose={onClose}>
    <Modal.Header>Direct Messaging</Modal.Header>
    <Modal.Content>
      <Form>
        <Form.Field>
          <MutilSelectUsers
            currentUserId={currentUserId}
            value={values.members}
            handleChange={(e, {value}) => {
              console.log(value);
              setFieldValue('members', value);
            }}
            teamId={teamId}
            placeholder="select members to message"
          />

{/*

        {!loading && <Downshift
          onChange={selectedUser => {
            history.push(`/view-team/user/${teamId}/${selectedUser.id}`);
            onClose();
          }}
          render={({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            selectedItem,
            highlightedIndex,
          }) => (
            <div>
              <Input {...getInputProps({placeholder: 'Search users'})} fluid/>
              {isOpen ? (
                <div style={{border: '1px solid #ccc'}}>
                  {getTeamMembers
                    .filter(
                      i =>
                        !inputValue ||
                        i.username.toLowerCase().includes(inputValue.toLowerCase()),
                    )
                    .map((item, index) => (
                      <div
                        {...getItemProps({item})}
                        key={item.id}
                        style={{
                          backgroundColor:
                            highlightedIndex === index ? 'gray' : 'white',
                          fontWeight: selectedItem === item ? 'bold' : 'normal',
                        }}
                      >
                        {item.username}
                      </div>
                    ))}
                </div>
              ) : null}
            </div>
          )}
        />}
*/}
        </Form.Field>

        <Form.Group>
          <Button disabled={isSubmitting} fluid onClick={e => {
            resetForm()
            onClose(e);
          }}>Cancel</Button>
          <Button disabled={isSubmitting} fluid onClick={handleSubmit}>Start Messaging</Button>
        </Form.Group>


      </Form>
    </Modal.Content>
  </Modal>
);

const getOrCreateChannelMutation = gql`
  mutation($teamId: Int!, $members: [Int!]!) {
    getOrCreateChannel(teamId: $teamId, members: $members) {
      id
      name
    }
  }
`;

// export default withRouter(graphql(getTeamMembersQuery)(DirectMessageModal));
export default compose(
  withRouter,
  graphql(getOrCreateChannelMutation),
  withFormik({
    mapPropsToValues: () => ({ members: [] }),
    handleSubmit: async (
      { members },
      {
        props: { onClose, teamId, mutate, history },
        setSubmitting,
        resetForm
      }
    ) => {
      const response = await mutate({
        variables: { teamId, members },
        update: (store, { data: { getOrCreateChannel } }) => {
          const { id, name } = getOrCreateChannel;
          const data = store.readQuery({ query: meQuery });
          const teamIdx = findIndex(data.me.teams, ['id', teamId]);
          const notInChannelList = data.me.teams[teamIdx].channels.every(c => c.id !== id);
          if (notInChannelList) {
            data.me.teams[teamIdx].channels.push({ __typename: 'Channel', id, name, dm: true });
            store.writeQuery({ query: meQuery, data });
          }
          history.push(`/view-team/${teamId}/${id}`);
        }
      });
      // console.log(response);
      // onClose();
      // // setSubmitting(false);
      // resetForm();

    }
  })
)(DirectMessageModal);
