import { useState } from 'react'
import '../auth.form.scss'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin, handleGoogleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleGoogleLoginClick = async () => {
        try {
            await handleGoogleLogin();
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await handleLogin({ email, password });
            navigate("/");
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) {
        return (
            <main>
                <h1>Loading...</h1>
            </main>
        )
    }

    return (
        <main >
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="button primary-button"
                        disabled={loading}
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        className="button secondary-button"
                        onClick={handleGoogleLoginClick}
                        disabled={loading}
                    >
                        Continue with Google
                    </button>
                </form>
                <p className="auth-link">
                    Don't have an account? <Link to={"/register"}>Register</Link>
                </p>
            </div>
        </main>
    )
}

export default Login