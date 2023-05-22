import { useState, useContext } from 'react'
import ErrorMessageContext from '../ErrorMessageContext'
import registrationServices from '../services/register'
import Header from './Header'
import Notification from './Notification'
import './RegistrationPage.css'

const RegistrationPage = () => {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, errorMessageDispatch] = useContext(ErrorMessageContext)
    
    const handleRegistration = async (event) => {
      event.preventDefault()

      //Checks that all fields are entered
      if (username.trim().length === 0 || name.trim().length === 0 || password.trim().length === 0) {
        errorMessageDispatch( {type: "SET_ERROR", message: "all fields are required"} )
        return
      }
      else {
        try {
          const user = await registrationServices.register({ username, name, password })
          console.log('user registered successfully')
        } catch (exception) {
          errorMessageDispatch( {type: "SET_ERROR", message: "username already in use"} )
          console.log('error registering user')   
        }
      }
    }

    return (
      <div className="registration-page">
        <Header />
        <div className="page-container">
          <h1 className="header-title">Start Swologging</h1>
          <div className="registration-form-container">
            <form onSubmit={handleRegistration}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  value={name}
                  name="name"
                  onChange={({ target }) => setName(target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  value={username}
                  name="username"
                  onChange={({ target }) => setUsername(target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="text"
                  value={password}
                  name="password"
                  onChange={({ target }) => setPassword(target.value)}
                />
              </div>
              <button type="submit">Register</button>
            </form>
          </div>
          <Notification />
        </div>
	    </div>
  )
}
export default RegistrationPage
    
