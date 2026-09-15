/* ===== IMPORTS ===== */
import { useState, useRef, useEffect } from "react";

export default function CustomSelect({ users, selectedUserId, setSelectedUserId }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selectedUser = users.find(u => u.UserID === selectedUserId);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div 
            ref={wrapperRef}
            style={{
                position: "relative",
                width: "fit-content",
                marginBottom: "30px",
                fontFamily: "Rubik"
            }}
        >
            <div
                onClick={() => setOpen(!open)}
                style={{
                    padding: "8px 12px",
                    background: "#1a1f3a",
                    color: "#ccc",
                    border: "1px solid #444",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    userSelect: "none",
                    minWidth: "200px"
                }}
            >
                {selectedUser ? selectedUser.Username : "Select a user"}
            </div>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        width: "100%",
                        background: "#1a1f3a",
                        border: "1px solid #444",
                        borderRadius: "6px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000
                    }}
                >
                    {users.map(user => (
                        <div
                            key={user.UserID}
                            onClick={() => {
                                setSelectedUserId(user.UserID);
                                setOpen(false);
                            }}
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                color: "#ccc",
                                fontSize: "1rem"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#2a2f5a"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            {user.Username}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}