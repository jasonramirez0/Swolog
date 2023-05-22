import './Notification.css'
import ErrorMessageContext from '../ErrorMessageContext'
import { useContext } from 'react'

// Defines Notification function handler used for entire app
const Notification = () => {
    const [message, errorMessageDispatch] = useContext(ErrorMessageContext)
    setTimeout(() => {
        errorMessageDispatch( {type: "CLEAR_ERROR"} )
    }, 5000)
	return message === null ? null : <div className='error'> {message} </div>
}

export default Notification