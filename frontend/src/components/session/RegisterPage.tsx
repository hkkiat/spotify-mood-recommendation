import React from 'react'
import { Input, Button, Alert } from 'antd';
import { useMutation } from '@apollo/react-hooks';
import { register } from '../../graphql/mutations/SessionControl'
import { defaultClient } from '../../Client';
import { Register, RegisterVariables } from '../../graphql/mutations/__generated__/register';

const RegisterPage = () => {
  const [submit, {loading}] = useMutation<Register, RegisterVariables>(register, {
    client: defaultClient,
    onCompleted: () => {
      window.location.href = '/home'
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
        <h1>Sign up</h1>
        <Alert message={errorMsg} />
        <Input disabled={loading} placeholder="Email" onChange={(evt: any) => setEmail(evt.target.value)} />
        <Input disabled={loading} placeholder="Password" onChange={(evt: any) => setPassword(evt.target.value)} />
        <Button onClick={handleSubmit}>
          Sign up
        </Button>
        Already have an account? <Button loading={loading} type="link" href='/login'>Sign in</Button>
      </div>
    </div>
  )
}

export default RegisterPage