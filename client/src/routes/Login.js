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

class Login extends Component {
  constructor(props) {
    super(props);
    extendObservable(this, {
      email: '',
      password: '',
      errors: {}
    });
  }

  onChange = e => {
    const { name, value } = e.target;
    this[name] = value;
  }

  onSubmit = async () => {
    this.errors = {};
    const { email, password } = this;
    const response = await this.props.mutate({
      variables: { email, password }
    });
    const { ok, token, refreshToken, errors } = response.data.login;
    if (ok) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      this.props.history.push('/view-team');
    } else {
      const err = {};
      errors.forEach(({ path, message }) => {
        err[`${path}Error`] = message
      });
      this.errors = err;
    }
  }

  render() {
    const { email, password, errors: { emailError, passwordError } } = this;
    const errorList = [];
    if (emailError) errorList.push(emailError);
    if (passwordError) errorList.push(passwordError);
    return (
      <Container text>
        <Header as="h2">Login</Header>
        <Form>
          <Form.Field error={!!emailError}>
          <Input
            value={email}
            onChange={this.onChange}
            name="email"
            placeholder="Email" fluid />
          </Form.Field>
          <Form.Field error={!!passwordError}>
          <Input
            value={password}
            onChange={this.onChange}
            name="password"  placeholder="Password" type="password" fluid />
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

const loginMutation = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email,password: $password) {
      token
      refreshToken
      ok
      errors {
        path
        message
      }
    }
  }
`

export default graphql(loginMutation)(observer(Login));
