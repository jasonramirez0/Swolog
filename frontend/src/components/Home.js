import { useState, useContext } from 'react'
import { useErrorMessageValue } from '../ErrorMessageContext'
import LoginForm from './LoginForm'
import Header from './Header'
import Notification from './Notification'
import './Home.css'

const Home = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    return (
      <div className="home">
          <Header />
          <div className="login-container">
            <h1 className="sign-in"> Sign In </h1>
            <LoginForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
            />
            <Notification />
          </div>
    </div>
  )
}

export default Home
