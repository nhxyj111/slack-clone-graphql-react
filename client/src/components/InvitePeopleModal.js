import React from 'react';
import { Button, Form, Modal, Input } from 'semantic-ui-react';
import { withFormik } from 'formik';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';

import normalizeErrors from '../normalizeErrors';

const InvitePeopleModal = ({
  open,
  onClose,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  touched,
  errors
}) => (
  <Modal open={open} onClose={onClose}>
    <Modal.Header>Add Channel</Modal.Header>
    <Modal.Content>
      <Form>
        <Form.Field>
        <Input
          value={values.email}
          name="email" fluid placeholder="User's email"
          onChange={handleChange}
          onBlur={handleBlur}
        />
        </Form.Field>
        {touched.email && errors.email ? errors.email[0] : null}
        <Form.Group widths="equal">
          <Button disabled={isSubmitting} fluid onClick={onClose}>Cancel</Button>
          <Button disabled={isSubmitting} fluid onClick={handleSubmit}>Add User</Button>
        </Form.Group>
      </Form>
    </Modal.Content>
  </Modal>
);

const addTeamMemberMutation = gql`
  mutation($email: String!, $teamId: Int!) {
    addTeamMember(email: $email, teamId: $teamId) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

export default compose(
graphql(addTeamMemberMutation),
withFormik({
  mapPropsToValues: () => ({ email: '' }),
  handleSubmit: async (
    values,
    {
      props: { onClose, teamId, mutate },
      setSubmitting,
      setErrors
    }
  ) => {
    const response = await mutate({
      variables: { teamId, email: values.email }
    });
    const { ok, errors } = response.data.addTeamMember;
    if (ok) {
      onClose();
      setSubmitting(false);
    } else {
      setSubmitting(false);
      setErrors(normalizeErrors(errors));
    }
  }
})
)(InvitePeopleModal);
