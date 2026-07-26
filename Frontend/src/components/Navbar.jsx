import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import "./Navbar.scss";


const Navbar = () => {
    const navigate = useNavigate();
    const { handleLogout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const logout = async () => {
        try {
            setShowLogoutModal(false);
            await handleLogout();
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <nav className='landing-nav'>
                <div className='landing-nav__brand'
                    onClick={() => navigate("/")}>
                    Interview Prep <span className='highlight'>AI</span>
                </div>
                <div className='landing-nav__links'>
                    <button
                        className='nav-link'
                        onClick={() => setShowLogoutModal(true)}
                    >
                        <i className="ti ti-logout"></i>
                        Logout
                    </button>
                </div>
            </nav>
            <ConfirmationModal
                isOpen={showLogoutModal}
                title="Logout?"
                message="Are you sure you want to logout?"
                warning={null}
                confirmText="Logout"
                onConfirm={logout}
                onClose={() => setShowLogoutModal(false)}
            />
        </>

    );
};

export default Navbar;