import React, { Component } from 'react';
import { extendObservable } from 'mobx';
import { observer } from 'mobx-react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import {
  Container,
  Header,
  Input,
  Button,
  Message,
  Form
} from 'semantic-ui-react';

class CreateTeam extends Component {
  constructor(props) {
    super(props);
    extendObservable(this, {
      name: '',
      errors: {}
    });
  }

  onChange = e => {
    const { name, value } = e.target;
    this[name] = value;
  }

  onSubmit = async () => {
    this.errors = {};
    const { name  } = this;
    let response = null;
    try {
      response = await this.props.mutate({
        variables: { name }
      });
    } catch (err) {
      this.props.history.push('/login');
      return;
    }

    const { ok, errors, team } = response.data.createTeam;
    if (ok) {
      this.props.history.push(`/view-team/${team.id}`);
    } else {
      const err = {};
      errors.forEach(({ path, message }) => {
        err[`${path}Error`] = message
      });
      this.errors = err;
    }
  }

  render() {
    const { name, errors: { nameError } } = this;
    const errorList = [];
    if (nameError) errorList.push(nameError);
    return (
      <Container text>
        <Header as="h2">Create a team</Header>
        <Form>
          <Form.Field error={!!nameError}>
          <Input
            value={name}
            onChange={this.onChange}
            name="name"
            placeholder="Team Name" fluid />
          </Form.Field>

          <Button onClick={this.onSubmit}>Submit</Button>
        </Form>
        {errorList.length ? (
          <Message
            error
            header='There was some errors with your submission'
            list={errorList}
          />
        ) : null}
      </Container>
    );
  }
}

const createTeamMutation = gql`
  mutation($name: String!) {
    createTeam(name: $name) {
      ok
      team {
        id
      }
      errors {
        path
        message
      }
    }
  }
`

export default graphql(createTeamMutation)(observer(CreateTeam));
