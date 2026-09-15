/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import CustomSelect from "./CustomSelect";

/* ===== DISPLAY ===== */
function Read() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch all users
    useEffect(() => {
        fetch("http://127.0.0.1:5000/users")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                if (data.length > 0) setSelectedUserId(data[0].UserID);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching users:", err);
                setLoading(false);
            });
    }, []);

    // Fetch selected user details
    useEffect(() => {
        if (!selectedUserId) return;

        fetch(`http://127.0.0.1:5000/user/${selectedUserId}/full`)
            .then((res) => res.json())
            .then((data) => setUserData(data))
            .catch((err) => console.error("Error fetching full user:", err));
    }, [selectedUserId]);

    if (loading) return <div style={{ padding: "20px", color: "#ccc" }}>Loading users...</div>;
    if (users.length === 0) return <div style={{ padding: "20px", color: "#ccc" }}>No users found...</div>;

    return (
        <div style={{ padding: "20px", color: "#ccc", fontFamily: "Rubik", background: "#0a0e27", boxSizing: "border-box", minWidth: "100vw", minHeight: "100vh" }}>
            <h1 style={{ marginBottom: "20px", display: 'flex', justifyContent: 'center' }}>SELECT A USER</h1>

            {/* USER DROPDOWN */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px"
                }}
            >
                <CustomSelect
                    users={users}
                    selectedUserId={selectedUserId}
                    setSelectedUserId={setSelectedUserId}
                />
            </div>

            {/* FULL USER DATA */}
            {userData && (
                <div>
                    {/* ACCOUNT INFO HEADER */}
                    <div
                        style={{
                            marginBottom: "30px",
                            borderBottom: "1px solid #333",
                            paddingBottom: "20px"
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.5rem",
                                marginBottom: "5px",
                                color: "#ccc",
                                display: 'flex', 
                                justifyContent: 'center'
                            }}
                        >
                            {userData?.User?.Username}
                        </h2>
                        <div
                            style={{
                                opacity: 0.6,
                                fontSize: "0.9rem",
                                display: 'flex', 
                                justifyContent: 'center'
                            }}
                        >
                            {userData.User.Email} • Joined {new Date(userData.User.CreationDate).toLocaleDateString()}
                        </div>
                    </div>

                    {/* PROFILES */}
                    {userData.Profiles.map((profile) => (
                        <div
                            key={profile.PlayerID}
                            style={{
                                marginBottom: "40px"
                            }}
                        >
                            {/* PROFILE HEADER CARD */}
                            <div
                                style={{
                                    background: "linear-gradient(135deg, #1a2f5a 0%, #16213e 100%)",
                                    border: "1px solid #2a4a8a",
                                    borderRadius: "12px",
                                    padding: "25px",
                                    marginBottom: "25px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "start",
                                        marginBottom: "20px"
                                    }}
                                >
                                    {/* LEFT */}
                                    <div>
                                        <h3
                                            style={{
                                                fontSize: "1.8rem",
                                                margin: "0 0 5px 0",
                                                color: "#ccc"
                                            }}
                                        >
                                            {profile.PlayerName}
                                        </h3>
                                    </div>

                                    {/* RIGHT */}
                                    <div
                                        style={{
                                            fontSize: "0.9rem",
                                            opacity: 0.7,
                                            textAlign: "right"
                                        }}
                                    >
                                        {profile.Role?.RoleName || "Unknown Role"} • {profile.Status?.StatusName || "Unknown Status"}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start"
                                    }}
                                >
                                    <div
                                        style={{
                                            textAlign: "left"
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "0.85rem",
                                                opacity: 0.7,
                                                marginBottom: "5px",
                                                textTransform: "uppercase",
                                                letterSpacing: "1px"
                                            }}
                                        >
                                            CREATION & LOGIN
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#65c7f7"
                                            }}
                                        >
                                            Created • {profile.CreationDate ? new Date(profile.CreationDate).toLocaleDateString() : "N/A"}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#65c7f7",
                                            }}
                                        >
                                            Last Login • {profile.LastLogin ? new Date(profile.LastLogin).toLocaleDateString() : "N/A"}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            textAlign: "right"
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "0.85rem",
                                                opacity: 0.7,
                                                marginBottom: "5px",
                                                textTransform: "uppercase",
                                                letterSpacing: "1px"
                                            }}
                                        >
                                            FACTION
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "1.1rem",
                                                color: "#65c7f7"
                                            }}
                                        >
                                            {profile.Faction?.FactionName || "-"}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#65c7f7",
                                                opacity: 0.7
                                            }}
                                        >
                                            {profile.Faction?.Planet || "Unknown Planet"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SHIP & CATEGORY */}
                            
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                    gap: "15px",
                                    marginBottom: "25px"
                                }}
                            >
                                {/* SHIP CARD */}
                                <div
                                    style={{
                                        background: "#1a1f3a",
                                        border: "1px solid #2a3a5a",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        textAlign: "center"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            opacity: 0.6,
                                            marginBottom: "8px",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px"
                                        }}
                                    >
                                        SHIP • {profile.Spaceship?.ShipDestroyed === 1 ? "DESTROYED" : "BUILT"}
                                    </div>
                                    <div
                                        style={{
                                            marginBottom: "6px",
                                            fontSize: "2.2rem",
                                            color: "#ff9800",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        {profile.Spaceship?.ShipName || "-"}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.75rem",
                                            opacity: 0.6,
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: "30px"
                                        }}
                                    >
                                        <span>LVL • {profile.Spaceship.Level}</span>
                                        <span>HP • {profile.Spaceship?.HealthPoints}</span>
                                        <span>ATK • {profile.Spaceship?.AttackPower}</span>
                                        <span>DEF • {profile.Spaceship?.DefencePower}</span>
                                        
                                    </div>
                                </div>

                                {/* CATEGORY CARD */}
                                <div
                                    style={{
                                        background: "#1a1f3a",
                                        border: "1px solid #2a3a5a",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        textAlign: "center"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            opacity: 0.6,
                                            marginBottom: "8px",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px"
                                        }}
                                    >
                                        CATEGORY
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "2.2rem",
                                            fontWeight: "bold",
                                            color: "#52f3ff"
                                        }}
                                    >
                                        {profile.Category?.CategoryName || "-"}
                                    </div>
                                </div>
                            </div>

                            {/* STAT CARDS */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                    gap: "15px",
                                    marginBottom: "25px"
                                }}
                            >
                                {/* RANK CARD */}
                                <div
                                    style={{
                                        background: "#1a1f3a",
                                        border: "1px solid #2a3a5a",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        textAlign: "center"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            opacity: 0.6,
                                            marginBottom: "8px",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px"
                                        }}
                                    >
                                        RANK
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "2.2rem",
                                            fontWeight: "bold",
                                            color: "#ffd700"
                                        }}
                                    >
                                        {profile.Rank}
                                    </div>
                                </div>

                                {/* EXP CARD */}
                                <div
                                    style={{
                                        background: "#1a1f3a",
                                        border: "1px solid #2a3a5a",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        textAlign: "center"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            opacity: 0.6,
                                            marginBottom: "8px",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px"
                                        }}
                                    >
                                        EXPERIENCE
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "2.2rem",
                                            fontWeight: "bold",
                                            color: "#ef5350"
                                        }}
                                    >
                                        {profile.Experience?.toLocaleString()}
                                    </div>
                                </div>

                                {/* GAMES PLAYED CARD */}
                                <div
                                    style={{
                                        background: "#1a1f3a",
                                        border: "1px solid #2a3a5a",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        textAlign: "center"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            opacity: 0.6,
                                            marginBottom: "8px",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px"
                                        }}
                                    >
                                        GAMES PLAYED
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "2.2rem",
                                            fontWeight: "bold",
                                            color: "#7cb342"
                                        }}
                                    >
                                        {profile.Games?.length || 0}
                                    </div>
                                </div>

                                {/* QUESTS CARD */}
                                <div
                                    style={{
                                        background: "#1a1f3a",
                                        border: "1px solid #2a3a5a",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        textAlign: "center"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            opacity: 0.6,
                                            marginBottom: "8px",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px"
                                        }}
                                    >
                                        QUESTS
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "2.2rem",
                                            fontWeight: "bold",
                                            color: "#ab47bc"
                                        }}
                                    >
                                        {profile.Quests?.length || 0}
                                    </div>
                                </div>
                            </div>

                            {/* GAMES & QUESTS SECTIONS */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "20px"
                                }}
                            >
                                {/* GAMES SECTION */}
                                <div>
                                    <h4
                                        style={{
                                            fontSize: "1.1rem",
                                            marginBottom: "15px",
                                            borderBottom: "2px solid #3a4a8a",
                                            paddingBottom: "10px",
                                            color: "#ccc"
                                        }}
                                    >
                                        RECENT GAMES
                                    </h4>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                            gap: "15px",
                                            marginBottom: "25px"
                                        }}
                                    >
                                        {/* GAMES PLAYED */}
                                        <div
                                            style={{
                                                background: "#1a1d3a",
                                                border: "1px solid #2a3a5a",
                                                borderRadius: "8px",
                                                padding: "20px",
                                                textAlign: "center"
                                            }}
                                        >
                                            {/* GAMES LIST */}
                                            {profile.Games && profile.Games.length > 0 ? (
                                                profile.Games?.slice(0, 5).map((game, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            padding: "10px",
                                                            marginBottom: "8px",
                                                            background: "#12172b",
                                                            borderRadius: "6px",
                                                            fontSize: "0.85rem",
                                                            display: "flex",
                                                            justifyContent: "space-between"
                                                        }}
                                                    >
                                                        <div>
                                                            <div
                                                                style={{
                                                                    color: "#ccc"
                                                                }}
                                                            >
                                                                {new Date(game.GameDate).toLocaleDateString()}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    opacity: 0.6,
                                                                    fontSize: "0.75rem"
                                                                }}
                                                            >
                                                                Duration: {game.Duration} mins
                                                            </div>
                                                        </div>

                                                        <div
                                                            style={{
                                                                textAlign: "right"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    color: "#7cb342"
                                                                }}
                                                            >
                                                                Score: {game.Score}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    fontSize: "0.75rem",
                                                                    opacity: 0.7
                                                                }}
                                                            >
                                                                {game.StatusID === 1 ? "In Progress" : game.StatusID === 2 ? "Completed" : "Abandoned"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                
                                                ))
                                            ) : (
                                                <div
                                                    style={{
                                                        padding: "15px",
                                                        background: "#12172b",
                                                        borderRadius: "6px",
                                                        opacity: 0.6,
                                                        fontSize: "0.85rem"
                                                    }}
                                                >
                                                    No games recorded
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* QUESTS SECTION */}
                                <div>
                                    <h4
                                        style={{
                                            fontSize: "1.1rem",
                                            marginBottom: "15px",
                                            borderBottom: "2px solid #3a4a8a",
                                            paddingBottom: "10px",
                                            color: "#ccc"
                                        }}
                                    >
                                        QUESTS
                                    </h4>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                            gap: "15px",
                                            marginBottom: "25px"
                                        }}
                                    >
                                        {/* QUESTS */}
                                        <div
                                            style={{
                                                background: "#1a1d3a",
                                                border: "1px solid #2a3a5a",
                                                borderRadius: "8px",
                                                padding: "20px",
                                                textAlign: "center"
                                            }}
                                        >
                                            {/* QUESTS LISTS */}
                                            {profile.Quests && profile.Quests.length > 0 ? (
                                                profile.Quests?.slice(0, 5).map((quest, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            padding: "10px",
                                                            marginBottom: "8px",
                                                            background: "#12172b",
                                                            borderRadius: "6px",
                                                            fontSize: "0.85rem",
                                                            display: "flex",
                                                            justifyContent: "space-between"
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                textAlign: "left"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    color: "#ccc"
                                                                }}
                                                            >
                                                                {quest.QuestName}
                                                            </div>
                                                        </div>

                                                        <div
                                                            style={{
                                                                textAlign: "right"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    color: "#ab47bc"
                                                                }}
                                                            >
                                                                {quest?.DifficultyName || "Unknown Difficulty"}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: "0.75rem",
                                                                    opacity: 0.7
                                                                }}
                                                            >
                                                                {quest?.AreaName || "Unknown Area"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div
                                                    style={{
                                                        padding: "15px",
                                                        background: "#12172b",
                                                        borderRadius: "6px",
                                                        opacity: 0.6,
                                                        fontSize: "0.85rem"
                                                    }}
                                                >
                                                    No quests found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DIVIDER */}
                            <div
                                style={{
                                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                                    margin: "40px 0"
                                }}
                            ></div>



                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Read;