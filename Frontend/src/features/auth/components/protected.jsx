import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return null
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    return children
}

export default Protected