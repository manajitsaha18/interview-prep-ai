import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    // Wait silently while checking the existing session
    if (loading) {
        return null
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    return children
}

export default Protected