import React from 'react';
import { Button, Form, Modal, Input, Checkbox } from 'semantic-ui-react';
import { withFormik } from 'formik';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import findIndex from 'lodash/findIndex';

import { meQuery } from '../graphql/team';
import MutilSelectUsers from './MutilSelectUsers';

const AddChannelModal = ({
  open,
  onClose,
  teamId,
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  resetForm,
  setFieldValue,
  currentUserId
}) => (
  <Modal open={open} onClose={(e) => {
    resetForm();
    onClose(e);
  }}>
    <Modal.Header>Add Channel</Modal.Header>
    <Modal.Content>
      <Form>
        <Form.Field>
        <Input
          value={values.name}
          name="name" fluid placeholder='Channel name'
          onChange={handleChange}
          onBlur={handleBlur}
        />
        </Form.Field>
        <Form.Field>
          <Checkbox label="Private"
            toggle
            value={!values.public}
            name="public"
            onChange={(e, {checked}) => setFieldValue('public', !checked)} />
        </Form.Field>

        <Form.Field>
          {values.public ? null :
          <MutilSelectUsers
            currentUserId={currentUserId}
            value={values.members}
            handleChange={(e, {value}) => {
              console.log(value);
              setFieldValue('members', value);
            }}
            teamId={teamId}
            placeholder="select members to invite"
          />
          }
        </Form.Field>

        <Form.Group widths="equal">
          <Button disabled={isSubmitting} fluid onClick={(e) => {
            resetForm();
            onClose(e);
          }}>Cancel</Button>
          <Button disabled={isSubmitting} fluid onClick={handleSubmit}>Create Channel</Button>
        </Form.Group>
      </Form>
    </Modal.Content>
  </Modal>
);

const createChannelMutation = gql`
  mutation($teamId: Int!, $name: String!, $public: Boolean, $members: [Int!]) {
    createChannel(teamId: $teamId, name: $name, public: $public, members: $members) {
      ok
      channel {
        id
        name
        dm
      }
    }
  }
`;

export default compose(
graphql(createChannelMutation),
withFormik({
  mapPropsToValues: () => ({ name: '', public: true, members: [] }),
  // Add a custom validation function (this can be async too!)
  // validate: (values, props) => {
  //   const errors = {};
  //   if (!values.email) {
  //     errors.email = 'Required';
  //   } else if (
  //     !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
  //   ) {
  //     errors.email = 'Invalid email address';
  //   }
  //   return errors;
  // },
  // Submission handler
  handleSubmit: async (
    values,
    {
      props: { onClose, teamId, mutate },
      setSubmitting,
      setErrors /* setValues, setStatus, and other goodies */,
    }
  ) => {
    await mutate({
      variables: {
        teamId,
        name: values.name,
        public: values.public,
        members: values.members
      },
      optimisticResponse: {
        createChannel: {
          __typename: 'Mutation',
          ok: true,
          channel: {
            __typename: 'Channel',
            id: -1,
            name: values.name,
            dm: false
          }
        }
      },
      update: (store, { data: { createChannel } }) => {
        // console.log(createChannel);
        const { ok, channel } = createChannel;
        if (!ok) return;
        const data = store.readQuery({ query: meQuery });
        const teamIdx = findIndex(data.me.teams, ['id', teamId]);
        data.me.teams[teamIdx].channels.push(channel);
        store.writeQuery({ query: meQuery, data });
      }
    });
    onClose();
    setSubmitting(false);

  },
})
)(AddChannelModal);
