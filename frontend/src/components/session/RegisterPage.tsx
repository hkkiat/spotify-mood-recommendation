import React from 'react'
import { Input, Button, Alert, Row, Col } from 'antd';
import { useMutation } from '@apollo/react-hooks';
import { register } from '../../graphql/mutations/SessionControl'
import { defaultClient } from '../../Client';
import { Register, RegisterVariables } from '../../graphql/mutations/__generated__/register';
import Layout from '../common/layout';
import styles from '../../css/session.module.css';
import { useNavigate } from 'react-router-dom';


interface IProps {
  currentPage: string

}

const RegisterPage = (props: IProps) => {
  const navigate = useNavigate();
  const [submit, {loading}] = useMutation<Register, RegisterVariables>(register, {
    client: defaultClient,
    onCompleted: () => {
      navigate('/moodlog')
    }
  })
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState<string | undefined>(undefined)
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Invalid email')
      return false
    }
    return true
    //return emailRegex.test(email);
  };
  const handleSubmit = async () => {
    try {
      setErrorMsg(undefined)
      if (!email || !password) {
        setErrorMsg('Email and password are required')
        return ;
      }
      if (!validateEmail(email)) {
        return ;
      }
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
    <Layout currentPage={props.currentPage}>

    <div>
      <div>
        <h1>Sign up</h1>
        {errorMsg && <Alert message={errorMsg} />}
        <div className={styles.login}>
          
          <Row gutter={[16, 16]}>
            
          <Col span={24}>
              <Input required={true} disabled={loading} placeholder="Email" onChange={(evt: any) => setEmail(evt.target.value)} />
            </Col>
            <Col span={24}>
              <Input required={true} disabled={loading} placeholder="Password" onChange={(evt: any) => setPassword(evt.target.value)} />
            </Col>
            <Col span={24}>
              <Button onClick={handleSubmit}>
                Sign up
              </Button>
            </Col>
          </Row>
        </div>    
        <div style={{ marginTop: '5px'}}>

          Already have an account? <Button loading={loading} type="link" onClick={() => navigate('/')}>Sign in</Button>
        </div>
      </div>
    </div>
    </Layout>
  )
}

export default RegisterPage