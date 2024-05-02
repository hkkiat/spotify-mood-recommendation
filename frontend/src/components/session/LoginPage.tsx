import React from 'react'
import { Input, Button, Alert } from 'antd';
import { Login, LoginVariables } from '../../graphql/mutations/__generated__/login';
import { login } from '../../graphql/mutations/SessionControl';
import { useMutation } from '@apollo/react-hooks';
import { defaultClient } from '../../Client';

const LoginPage = () => {
  const [submit, {loading}] = useMutation<Login, LoginVariables>(login, {
    client: defaultClient,
    onCompleted: () => {
      window.location.href = '/moodlog'
    }
  })

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState('')

  const handleSubmit = async () => {
    try {
      await submit({
        variables: {
          email,
          password
        }
      })
    } catch (error: any) {
      setErrorMsg(error.message)
    }
  }
  return (
    <div>
      <div>
        <h1>Sign in</h1>
        <Alert message={errorMsg} />
        <Input disabled={loading} placeholder="Email" onChange={(evt: any) => setEmail(evt.target.value)} />
        <Input disabled={loading} placeholder="Password" onChange={(evt: any) => setPassword(evt.target.value)} />
        <Button onClick={handleSubmit}>

          Sign in
        </Button>
        Don't have an account? <Button type="link" href='/register'>Sign up</Button>
      </div>
    </div>
  )
}

export default LoginPage