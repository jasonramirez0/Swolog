import { useContext } from 'react'
import { Link } from 'react-router-dom'
import loginServices from '../services/login'
import workoutServices from '../services/workouts'
import UserContext from '../UserContext' 
import { useErrorMessageDispatch } from '../ErrorMessageContext' 
import './LoginForm.css'

const LoginForm = ({ username, setUsername, password, setPassword }) => {
  
  const [user, userDispatch] = useContext(UserContext)
  const errorMessageDispatch = useErrorMessageDispatch()

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
        const loggedInUser = await loginServices.login({ username, password })
        window.localStorage.setItem('loggedFitnessAppUser', JSON.stringify(loggedInUser))
        workoutServices.setToken(loggedInUser.token)
        setUsername('')
        setPassword('')
        userDispatch({ type: "LOG IN", user: loggedInUser })
    } catch(exception) {
        errorMessageDispatch( {type: "SET_ERROR", message: "username or password invalid"} )
    }
}

 return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">Login</button>
        <Link to="/register" className="register-link">
          Dont have an account? Register here.
        </Link>
      </form>
      *<label> View sample synthetic user profiles with the following username/password pairs: [username: ejale, password: password], [username: netet, password: password] </label>
    </div>
  )
}

export default LoginForm
