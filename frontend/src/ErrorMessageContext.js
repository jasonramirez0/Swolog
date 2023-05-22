import { createContext, useContext, useReducer } from 'react'

//Creates Context Provider for managing error messages for the entire app

const errorMessageReducer = (state, action) => {
    switch (action.type) {
        case "SET_ERROR":
            return action.message
        case "CLEAR_ERROR":
            return null
        default:
            return state

    }
}

const ErrorMessageContext = createContext()

export const ErrorMessageContextProvider = (props) => {
    const [errorMessage, errorMessageDispatch] = useReducer(errorMessageReducer, null)

    return (
        <ErrorMessageContext.Provider value ={ [errorMessage, errorMessageDispatch] }>
            {props.children}
        </ErrorMessageContext.Provider>
    )
}

export const useErrorMessageValue = () => {
    const errorMessageAndDispatch = useContext(ErrorMessageContext)
    return errorMessageAndDispatch[0]
}

export const useErrorMessageDispatch = () => {
    const errorMessageAndDispatch = useContext(ErrorMessageContext)
    return errorMessageAndDispatch[1]
}

export default ErrorMessageContext