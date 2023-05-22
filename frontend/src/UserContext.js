import { createContext, useReducer, useContext } from 'react'

const userReducer = (state, action) => {
    switch (action.type) {
        case "LOG IN":
            console.log(`action ${JSON.stringify(action.user)}`)
            return action.user
        case "LOG OUT":
            console.log(`action ${JSON.stringify(action)}`)
            return null
        default:
            return state
    }
}

const UserContext = createContext()

export const UserContextProvider = (props) => {
    const [user, userDispatch] = useReducer(userReducer, null)       
    return (
        <UserContext.Provider value={ [user, userDispatch] }>
            {props.children}
        </UserContext.Provider>
    )
}

export const useUserValue = () => {
    const userAndDispatch = useContext(UserContext)
    return userAndDispatch[0]
}

export const useUserDispatch = () => {
    const userAndDispatch = useContext(UserContext)
    return userAndDispatch[1]
}

export default UserContext