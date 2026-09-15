/* ===== IMPORTS ===== */
import { useEffect, useState } from 'react';
import CustomSelect from './CustomSelect';

/* ===== CONFIRM MODAL ===== */
function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div 
            style={{
                position: "fixed", 
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                zIndex: 1000
            }}
        >
            <div 
                style={{
                    background: "linear-gradient(135deg, #1a2f5a 0%, #16213e 100%)",
                    border: "1px solid #ef5350",
                    borderRadius: "12px",
                    padding: "30px",
                    maxWidth: "400px",
                    width: "90%",
                    textAlign: "center"
                }}
            >
                <div 
                    style={{
                        fontSize: "0.8rem", 
                        opacity: 0.6, 
                        marginBottom: "16px",
                        textTransform: "uppercase", 
                        letterSpacing: "1px", 
                        color: "#ef5350"
                    }}
                >
                    CONFIRM DELETION
                </div>
                <div 
                    style={{ 
                        fontSize: "1rem", 
                        color: "#ccc", 
                        marginBottom: "25px", 
                        lineHeight: 1.6 
                    }}
                >
                    {message}
                </div>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: "10px 24px", 
                            background: "transparent",
                            border: "1px solid #2a3a5a", 
                            borderRadius: "8px",
                            color: "#ccc", 
                            cursor: "pointer", 
                            fontFamily: "Rubik",
                            fontSize: "0.85rem", 
                            textTransform: "uppercase", 
                            letterSpacing: "1px"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#ffffff11"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: "10px 24px", 
                            background: "transparent",
                            border: "1px solid #ef5350", 
                            borderRadius: "8px",
                            color: "#ef5350", 
                            cursor: "pointer", 
                            fontFamily: "Rubik",
                            fontSize: "0.85rem", 
                            textTransform: "uppercase", 
                            letterSpacing: "1px"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#ef535022"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        DELETE
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ===== MAIN COMPONENT ===== */
function Delete() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profilesLoading, setProfilesLoading] = useState(false);

    const [modal, setModal] = useState(null); // { message, onConfirm }
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    /* ===== FETCH USERS ===== */
    useEffect(() => {
        fetch("http://127.0.0.1:5000/users")
            .then(r => r.json())
            .then(data => {
                setUsers(data);
                if (data.length) setSelectedUserId(data[0].UserID);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    /* ===== FETCH USER + PROFILES WHEN USER CHANGES ===== */
    useEffect(() => {
        if (!selectedUserId) return;
        setUserData(null);
        setMessage("");
        setProfilesLoading(true);

        fetch(`http://127.0.0.1:5000/user/${selectedUserId}/partial`)
            .then(r => r.json())
            .then(data => { setUserData(data); setProfilesLoading(false); })
            .catch(err => { console.error(err); setProfilesLoading(false); });
    }, [selectedUserId]);

    /* ===== DELETE PROFILE ===== */
    const confirmDeleteProfile = (profile) => {
        setModal({
            message: `This will permanently delete the profile "${profile.PlayerName}" including all their game sessions and quest links. This cannot be undone.`,
            onConfirm: async () => {
                setModal(null);
                try {
                    const res = await fetch(`http://127.0.0.1:5000/profiles/${profile.PlayerID}`, {
                        method: "DELETE"
                    });
                    if (!res.ok) throw new Error();

                    setMessage(`Profile "${profile.PlayerName}" deleted`);
                    setMessageType("success");

                    // Refresh
                    const refreshed = await fetch(`http://127.0.0.1:5000/user/${selectedUserId}/partial`).then(r => r.json());
                    setUserData(refreshed);
                } catch {
                    setMessage("Error deleting profile");
                    setMessageType("error");
                }
            }
        });
    };

    /* ===== DELETE USER ===== */
    const confirmDeleteUser = (user) => {
        setModal({
            message: `This will permanently delete the user "${user.Username}". This cannot be undone.`,
            onConfirm: async () => {
                setModal(null);
                try {
                    const res = await fetch(`http://127.0.0.1:5000/users/${user.UserID}`, {
                        method: "DELETE"
                    });
                    if (!res.ok) throw new Error();

                    setMessage(`User "${user.Username}" deleted`);
                    setMessageType("success");

                    // Remove from list and select next user
                    const updated = users.filter(u => u.UserID !== user.UserID);
                    setUsers(updated);
                    setUserData(null);
                    setSelectedUserId(updated.length ? updated[0].UserID : null);
                } catch {
                    setMessage("Error deleting user");
                    setMessageType("error");
                }
            }
        });
    };

    if (loading) return <div style={pageStyle}>Loading...</div>;

    const hasProfiles = userData?.Profiles?.length > 0;

    return (
        <div style={pageStyle}>
            {modal && (
                <ConfirmModal
                    message={modal.message}
                    onConfirm={modal.onConfirm}
                    onCancel={() => setModal(null)}
                />
            )}

            <h1 
                style={{
                    marginBottom: "20px", 
                    display: "flex", 
                    justifyContent: "center",
                    textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                }}
            >
                DELETE AN ENTITY
            </h1>

            {/* MAIN CARD */}
            <div 
                style={{
                    background: "linear-gradient(135deg, #1a2f5a 0%, #16213e 100%)",
                    border: "1px solid #2a4a8a",
                    borderRadius: "12px",
                    padding: "25px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                }}
            >

                {/* CARD HEADER */}
                <div 
                    style={{
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: "25px", 
                        borderBottom: "1px solid #2a4a8a", 
                        paddingBottom: "20px",
                        textTransform: "uppercase", 
                        letterSpacing: "1px",
                        textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: "1.8rem", color: "#ccc" }}>
                        {userData?.User?.Username || "Select User"}
                    </h3>
                    <div style={{ fontSize: "1.2rem", opacity: 0.7, color: "#ef5350" }}>
                        Danger Zone
                    </div>
                </div>

                {/* STEP 1 — SELECT USER */}
                <div style={{ marginBottom: "25px" }}>
                    <div 
                        style={{
                            fontSize: "0.8rem", 
                            opacity: 0.6, 
                            marginBottom: "12px",
                            textTransform: "uppercase", 
                            letterSpacing: "1px", 
                            color: "#65c7f7",
                            textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                        }}
                    >
                        STEP 1 • SELECT USER
                    </div>
                    <CustomSelect
                        users={users}
                        selectedUserId={selectedUserId}
                        setSelectedUserId={id => { 
                            setSelectedUserId(id); 
                            setMessage(""); 
                        }}
                    />
                </div>

                {/* STEP 2 — ACTION */}
                {profilesLoading && (
                    <div style={{ opacity: 0.4, fontSize: "0.85rem" }}>
                        Loading profiles...
                    </div>
                )}

                {userData && !profilesLoading && (
                    <>
                        <div style={{ borderTop: "1px solid #2a4a8a", marginBottom: "25px" }} />

                        {hasProfiles ? (
                            /* ===== HAS PROFILES / DELETE A PROFILE ===== */
                            <>
                                <div 
                                    style={{
                                        fontSize: "0.8rem", 
                                        opacity: 0.6,
                                        marginBottom: "16px",
                                        textTransform: "uppercase", 
                                        letterSpacing: "1px", 
                                        color: "#ef5350",
                                        textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                                    }}
                                >
                                    STEP 2 • SELECT PROFILE TO DELETE
                                </div>

                                <div 
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                        gap: "12px"
                                    }}
                                >
                                    {userData.Profiles.map(p => (
                                        <div 
                                            key={p.PlayerID} 
                                            style={{
                                                background: "#1a1f3a",
                                                border: "1px solid #2a3a5a",
                                                borderRadius: "8px",
                                                padding: "18px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: "12px",
                                                textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                                            }}
                                        >
                                            <div>
                                                <div 
                                                    style={{
                                                        fontSize: "1rem", 
                                                        fontWeight: "bold",
                                                        color: "#ccc", 
                                                        marginBottom: "4px"
                                                    }}
                                                >
                                                    {p.PlayerName}
                                                </div>
                                                <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                                                    Rank {p.Rank} • ID {p.PlayerID}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => confirmDeleteProfile(p)}
                                                style={{
                                                    padding: "8px 16px", 
                                                    background: "transparent",
                                                    border: "1px solid #ef5350", 
                                                    borderRadius: "6px",
                                                    color: "#ef5350", 
                                                    cursor: "pointer",
                                                    fontFamily: "Rubik", 
                                                    fontSize: "0.75rem",
                                                    textTransform: "uppercase", 
                                                    letterSpacing: "0.5px",
                                                    whiteSpace: "nowrap",
                                                    textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#ef535022"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                            >
                                                DELETE
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div 
                                    style={{
                                        marginTop: "20px", 
                                        padding: "12px 16px",
                                        background: "#ef535011", 
                                        border: "1px solid #ef535033",
                                        borderRadius: "8px", 
                                        fontSize: "0.8rem",
                                        color: "#ef5350", 
                                        opacity: 0.7,
                                        textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                                    }}
                                >
                                    User cannot be deleted while they have active profiles. Delete all profiles first to remove the user.
                                </div>
                            </>
                        ) : (
                            /* ===== NO PROFILES / DELETE USER ===== */
                            <>
                                <div 
                                    style={{
                                        fontSize: "0.8rem", 
                                        opacity: 0.6, 
                                        marginBottom: "16px",
                                        textTransform: "uppercase", 
                                        letterSpacing: "1px", 
                                        color: "#ef5350",
                                        textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                                    }}
                                >
                                    STEP 2 • DELETE USER
                                </div>

                                {/* USER SUMMARY CARD */}
                                <div 
                                    style={{
                                        background: "#1a1f3a",
                                        border: "1px solid #ef535044",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        marginBottom: "20px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#ccc", marginBottom: "6px" }}>
                                            {userData.User.Username}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                                            {userData.User.Email}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", opacity: 0.4, marginTop: "4px" }}>
                                            Joined {new Date(userData.User.CreationDate).toLocaleDateString()} • No profiles
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => confirmDeleteUser(userData.User)}
                                        style={{
                                            padding: "10px 24px", 
                                            background: "transparent",
                                            border: "1px solid #ef5350", 
                                            borderRadius: "8px",
                                            color: "#ef5350", 
                                            cursor: "pointer",
                                            fontFamily: "Rubik", 
                                            fontSize: "0.85rem",
                                            textTransform: "uppercase", 
                                            letterSpacing: "1px",
                                            textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#ef535022"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        DELETE USER
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* STATUS MESSAGE */}
                {message && (
                    <div
                        style={{
                            marginTop: "20px", 
                            padding: "12px 16px", 
                            borderRadius: "8px",
                            border: `1px solid ${messageType === "success" ? "#7cb342" : "#ef5350"}`,
                            color: messageType === "success" ? "#7cb342" : "#ef5350",
                            fontSize: "0.85rem", 
                            textAlign: "center",
                            textTransform: "uppercase", 
                            letterSpacing: "1px",
                            textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                        }}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ===== STYLES ===== */
const pageStyle = {
    padding: "20px", 
    color: "#ccc", 
    fontFamily: "Rubik",
    background: "#0a0e27", 
    boxSizing: "border-box",
    minWidth: "100vw", 
    minHeight: "100vh"
};

export default Delete;