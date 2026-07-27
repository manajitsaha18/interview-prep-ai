import "./Navbar.scss";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import ConfirmationModal from "../ConfirmationModal";

const Navbar = () => {
    const navigate = useNavigate();

    const { user, handleLogout } = useAuth();

    const [showMenu, setShowMenu] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setShowMenu(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const scrollToAbout = () => {
        document
            .getElementById("how-it-works")
            ?.scrollIntoView({
                behavior: "smooth",
            });
    };

    return (
        <>
            <nav className="navbar">
                <div
                    className="navbar__brand"
                    onClick={() => navigate("/")}
                >
                    InterviewPrep <span className="highlight">AI</span>
                </div>

                {!user ? (
                    <div className="navbar__links">
                        <button
                            className="nav-link"
                            onClick={scrollToTop}
                        >
                            Home
                        </button>

                        <button
                            className="nav-link"
                            onClick={scrollToAbout}
                        >
                            About
                        </button>

                        <button
                            className="nav-link"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    </div>
                ) : (
                    <div
                        className="navbar__profile"
                        ref={menuRef}
                    >
                        <button
                            className="profile-btn"
                            onClick={() =>
                                setShowMenu((prev) => !prev)
                            }
                        >
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.username}
                                    className="profile-avatar"
                                />
                            ) : (
                                <div className="profile-avatar profile-avatar--fallback">
                                    {user.username
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}
                        </button>

                        {showMenu && (
                            <div className="profile-menu">
                                <div className="profile-menu__header">
                                    <h4>{user.username}</h4>
                                    <p>{user.email}</p>
                                </div>

                                <div className="profile-menu__actions">
                                    <button
                                        className="profile-menu__item"
                                        onClick={() => {
                                            setShowMenu(false);
                                            navigate("/profile");
                                        }}
                                    >
                                        <i className="ti ti-user" />
                                        <span>My Profile</span>
                                    </button>

                                    <button
                                        className="profile-menu__item profile-menu__logout"
                                        onClick={() => {
                                            setShowMenu(false);
                                            setLogoutModalOpen(true);
                                        }}
                                    >
                                        <i className="ti ti-logout-2" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            <ConfirmationModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={async () => {
                    setLogoutModalOpen(false);
                    await handleLogout();
                }}
                title="Logout"
                message="Are you sure you want to logout?"
                warning="You will need to log in again to access your dashboard."
                confirmText="Logout"
                cancelText="Cancel"
            />
        </>
    );
};

export default Navbar;