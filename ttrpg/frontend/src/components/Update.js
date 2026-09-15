/* ===== IMPORTS ===== */
import { useEffect, useState } from 'react';
import CustomSelect from './CustomSelect';

/* ===== RANK FORMULA ===== */
function expToRank(exp) {
    const thresholds = [0, 150, 300, 450, 600, 700, 800, 900, 950, 1000];
    if (exp >= 1000) return 10 + Math.floor(Math.log(exp / 1000) * 6);
    for (let i = thresholds.length - 1; i >= 0; i--) {
        if (exp >= thresholds[i]) return i + 1;
    }
    return 1;
}

/* ===== FIELD BLOCK ===== */
function FieldBlock({ label, accent, children }) {
    return (
        <div>
            <div 
                style={{
                    fontSize: '0.8rem',
                    opacity: 0.6,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: accent || '#ccc',
                    textShadow: '4px 4px 4px rgba(0,0,0,0.25)'
                }}
            >
                {label}
            </div>
            {children}
        </div>
    );
}

/* ===== SUBMIT BUTTON ===== */
function SubmitButton({ onClick, color, label }) {
    return (
        <div 
            style={{ 
                display: "flex", 
                justifyContent: "center", 
                marginTop: "5px" 
            }}
        >
            <button
                onClick={onClick}
                style={{
                    padding: "12px 32px",
                    background: "transparent",
                    border: `1px solid ${color}`,
                    borderRadius: "8px",
                    color: color,
                    cursor: "pointer",
                    fontFamily: "Rubik",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${color}22`}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
                {label}
            </button>
        </div>
    );
}

/* ===== STAT SELECT CARD ===== */
function StatSelectCard({ label, color, data, idKey, nameKey, value, setter }) {
    const selected = data.find(d => String(d[idKey]) === String(value));
    return (
        <div 
            style={{
                background: "#1a1f3a",
                border: `1px solid ${selected ? color + "55" : "#2a3a5a"}`,
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                transition: "border-color 0.2s"
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
                {label}
            </div>
            <div 
                style={{
                    fontSize: selected ? "1.6rem" : "1rem",
                    fontWeight: "bold",
                    color: selected ? color : "rgba(255,255,255,0.2)",
                    marginBottom: "10px",
                    minHeight: "2rem",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    transition: "color 0.2s"
                }}
            >
                {selected ? selected[nameKey] : "—"}
            </div>
            <select
                style={{
                    width: "100%", 
                    padding: "6px 8px", 
                    borderRadius: "6px",
                    border: `1px solid ${selected ? color + "88" : "#2a3a5a"}`,
                    background: "#12172b",
                    color: selected ? color : "#ccc",
                    fontSize: "0.75rem", 
                    fontFamily: "Rubik"
                }}
                value={value}
                onChange={e => setter(e.target.value)}
            >
                <option value="" style={{ color: "#ccc" }}>
                    Select {label.toLowerCase()}...
                </option>
                {data.map(item => (
                    <option key={item[idKey]} value={item[idKey]} style={{ color: "#ccc" }}>
                        {item[nameKey]}
                    </option>
                ))}
            </select>
        </div>
    );
}

/* ===== PROFILE SELECT CARD ===== */
function ProfileSelectCard({ profiles, selectedProfileId, setSelectedProfileId }) {
    if (!profiles.length) return (
        <div 
            style={{
                padding: "15px", 
                background: "#12172b", 
                borderRadius: "6px",
                opacity: 0.5, 
                fontSize: "0.85rem", 
                textAlign: "center"
            }}
        >
            No profiles found for this user
        </div>
    );

    return (
        <div 
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "10px"
            }}
        >
            {profiles.map(p => {
                const isSelected = String(p.PlayerID) === String(selectedProfileId);
                return (
                    <div
                        key={p.PlayerID}
                        onClick={() => setSelectedProfileId(p.PlayerID)}
                        style={{
                            padding: "14px",
                            background: isSelected ? "#12172b" : "transparent",
                            border: `1px solid ${isSelected ? "#65c7f7" : "#2a3a5a"}`,
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "border-color 0.2s, background 0.2s"
                        }}
                    >
                        <div 
                            style={{
                                fontSize: "1rem", 
                                fontWeight: "bold",
                                color: isSelected ? "#65c7f7" : "#888",
                                marginBottom: "4px"
                            }}
                        >
                            {p.PlayerName}
                        </div>
                        <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                            Rank {p.Rank} • ID {p.PlayerID}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ===== MAIN COMPONENT ===== */
function Update() {
    /* ===== LOOKUP DATA ===== */
    const [users, setUsers] = useState([]);
    const [factions, setFactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [roles, setRoles] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ===== SELECTION ===== */
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [profilesLoading, setProfilesLoading] = useState(false);

    /* ===== EDITABLE FIELDS ===== */
    const [playerName, setPlayerName] = useState("");
    const [factionId, setFactionId] = useState("");
    const [useNewFaction, setUseNewFaction] = useState(false);
    const [newFactionName, setNewFactionName] = useState("");
    const [shipName, setShipName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [statusId, setStatusId] = useState("");
    const [experience, setExperience] = useState(0);

    /* ===== MESSAGE ===== */
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const rank = expToRank(Number(experience));

    /* ===== FETCH LOOKUPS ===== */
    useEffect(() => {
        Promise.all([
            fetch("http://127.0.0.1:5000/users").then(r => r.json()),
            fetch("http://127.0.0.1:5000/factions").then(r => r.json()),
            fetch("http://127.0.0.1:5000/categories").then(r => r.json()),
            fetch("http://127.0.0.1:5000/roles").then(r => r.json()),
            fetch("http://127.0.0.1:5000/statuses").then(r => r.json()),
        ])
        .then(([u, f, c, r, st]) => {
            setUsers(u); 
            setFactions(f); 
            setCategories(c); 
            setRoles(r); 
            setStatuses(st);
            if (u.length) setSelectedUserId(u[0].UserID);
            setLoading(false);
        })
        .catch(err => { 
            console.error(err); 
            setLoading(false); 
        });
    }, []);

    /* ===== FETCH PROFILES WHEN USER CHANGES ===== */
    useEffect(() => {
        if (!selectedUserId) return;
        setSelectedProfileId(null);
        setProfiles([]);
        setProfilesLoading(true);

        fetch(`http://127.0.0.1:5000/user/${selectedUserId}/partial`)
            .then(r => r.json())
            .then(data => {
                setProfiles(data.Profiles || []);
                setProfilesLoading(false);
            })
            .catch(err => { 
                console.error(err); 
                setProfilesLoading(false); 
            });
    }, [selectedUserId]);

    /* ===== PREFILLED WHEN PROFILE SELECTED ===== */
    useEffect(() => {
        if (!selectedProfileId) return;
        setMessage("");

        fetch(`http://127.0.0.1:5000/user/${selectedUserId}/full`)
            .then(r => r.json())
            .then(data => {
                const profile = data.Profiles.find(p => p.PlayerID === selectedProfileId);
                if (!profile) return;

                setPlayerName(profile.PlayerName || "");
                setFactionId(profile.FactionID ? String(profile.FactionID) : "");
                setShipName(profile.Spaceship?.ShipName || "");
                setCategoryId(profile.CategoryID ? String(profile.CategoryID) : "");
                setRoleId(profile.RoleID ? String(profile.RoleID) : "");
                setStatusId(profile.StatusID ? String(profile.StatusID) : "");
                setExperience(profile.Experience || 0);
                setUseNewFaction(false);
                setNewFactionName("");
            })
            .catch(err => console.error(err));
    }, [selectedProfileId]);

    /* ===== SUBMIT UPDATE ===== */
    const handleUpdate = async () => {
        if (!selectedProfileId) {
            setMessage("Please select a profile to update"); 
            setMessageType("error"); 
            return;
        }

        try {
            let factionValue = factionId;

            if (useNewFaction && newFactionName) {
                const resFaction = await fetch("http://127.0.0.1:5000/factions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ FactionName: newFactionName })
                });
                if (!resFaction.ok) throw new Error("Faction creation failed");
                factionValue = (await resFaction.json()).FactionID;
            }

            let shipId;
            const shipRes = await fetch("http://127.0.0.1:5000/profiles/" + selectedProfileId, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    PlayerName: playerName,
                    FactionID: factionValue,
                    ShipID: shipName,
                    CategoryID: categoryId,
                    RoleID: roleId,
                    StatusID: statusId,
                    Experience: Number(experience),
                    Rank: rank
                })
            });

            if (!shipRes.ok) throw new Error();

            setMessage(`Profile updated • Rank ${rank}`);
            setMessageType("success");

            const refreshed = await fetch(`http://127.0.0.1:5000/user/${selectedUserId}/partial`).then(r => r.json());
            setProfiles(refreshed.Profiles || []);

        } catch {
            setMessage("Error updating profile");
            setMessageType("error");
        }
    };

    if (loading) return <div style={pageStyle}>Loading...</div>;

    return (
        <div style={pageStyle}>
            <h1 
                style={{
                    marginBottom: "20px", 
                    display: "flex", 
                    justifyContent: "center",
                    textShadow: "4px 4px 4px rgba(0,0,0,0.25)"
                }}
            >
                UPDATE A PROFILE
            </h1>

            {/* MAIN CARD */}
            <div 
                style={{
                    background: "linear-gradient(135deg, #1a2f5a 0%, #16213e 100%)",
                    border: "1px solid #2a4a8a",
                    borderRadius: "12px",
                    padding: "25px",
                    maxWidth: "1200px",
                    margin: "0 auto"
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
                        letterSpacing: "1px"
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: "1.8rem", color: "#ccc" }}>
                        {selectedProfileId
                            ? profiles.find(p => p.PlayerID === selectedProfileId)?.PlayerName || "Edit Profile"
                            : "Select Profile"
                        }
                    </h3>
                    <div style={{ fontSize: "1.2rem", opacity: 0.7 }}>Player Entity</div>
                </div>

                {/* STEP 1 */}
                <div style={{ marginBottom: "25px" }}>
                    <div 
                        style={{
                            fontSize: "0.8rem", 
                            opacity: 0.6, 
                            marginBottom: "12px",
                            textTransform: "uppercase", 
                            letterSpacing: "1px", 
                            color: "#65c7f7"
                        }}
                    >
                        STEP 1 • SELECT USER
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <CustomSelect
                            users={users}
                            selectedUserId={selectedUserId}
                            setSelectedUserId={setSelectedUserId}
                        />
                    </div>
                </div>

                {/* STEP 2 */}
                <div style={{ marginBottom: "30px" }}>
                    <div 
                        style={{
                            fontSize: "0.8rem", 
                            opacity: 0.6, 
                            marginBottom: "12px",
                            textTransform: "uppercase", 
                            letterSpacing: "1px", 
                            color: "#65c7f7"
                        }}
                    >
                        STEP 2 • SELECT PROFILE
                    </div>
                    {profilesLoading
                        ? <div style={{ opacity: 0.4, fontSize: "0.85rem" }}>
                            Loading profiles...
                          </div>
                        : <ProfileSelectCard
                            profiles={profiles}
                            selectedProfileId={selectedProfileId}
                            setSelectedProfileId={setSelectedProfileId}
                          />
                    }
                </div>

                {/* EDIT FIELDS */}
                {selectedProfileId && (
                    <>
                        {/* DIVIDER */}
                        <div style={{ borderTop: "1px solid #2a4a8a", marginBottom: "25px" }} />

                        {/* ROW 1 */}
                        <div style={{ marginBottom: "25px" }}>
                            <FieldBlock label="PLAYER NAME" accent="#65c7f7">
                                <input
                                    style={inputStyle}
                                    placeholder="Player name"
                                    value={playerName}
                                    onChange={e => setPlayerName(e.target.value)}
                                />
                            </FieldBlock>
                        </div>

                        {/* ROW 2 */}
                        <div 
                            style={{ 
                                display: "grid", 
                                gridTemplateColumns: "1fr 1fr", 
                                gap: "20px", 
                                marginBottom: "25px" 
                            }}
                        >
                            <FieldBlock label="FACTION" accent="#65c7f7">
                                {useNewFaction ? (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                                            placeholder="New faction name"
                                            value={newFactionName}
                                            onChange={e => setNewFactionName(e.target.value)}
                                        />
                                        <button onClick={() => setUseNewFaction(false)} style={cancelBtnStyle}>
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <select style={inputStyle} value={factionId} onChange={e => {
                                        if (e.target.value === "new") setUseNewFaction(true);
                                        else setFactionId(e.target.value);
                                    }}>
                                        <option value="">Select Faction...</option>
                                        {factions.map(f => (
                                            <option key={f.FactionID} value={f.FactionID}>
                                                {f.FactionName}
                                            </option>
                                        ))}
                                        <option value="new">Create New Faction</option>
                                    </select>
                                )}
                            </FieldBlock>

                            <FieldBlock label="SHIP NAME" accent="#ff9800">
                                <input
                                    style={{ ...inputStyle, color: "#ff9800" }}
                                    placeholder="Ship name"
                                    value={shipName}
                                    onChange={e => setShipName(e.target.value)}
                                />
                            </FieldBlock>
                        </div>

                        {/* ROW 3 */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
                            <StatSelectCard 
                                label="CATEGORY" 
                                color="#52f3ff"
                                data={categories} 
                                idKey="CategoryID" 
                                nameKey="CategoryName"
                                value={categoryId} 
                                setter={setCategoryId} 
                            />
                            
                            <StatSelectCard 
                                label="ROLE" 
                                color="#ccc"
                                data={roles} 
                                idKey="RoleID" 
                                nameKey="RoleName"
                                value={roleId} 
                                setter={setRoleId} 
                            />
                           
                            <StatSelectCard 
                                label="STATUS" 
                                color="#ccc"
                                data={statuses} 
                                idKey="StatusID" 
                                nameKey="StatusName"
                                value={statusId} 
                                setter={setStatusId} 
                            />
                        </div>

                        {/* ROW 4 — Experience + Rank */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                            <FieldBlock label="EXPERIENCE" accent="#ef5350">
                                <input
                                    style={{ ...inputStyle, color: "#ef5350" }}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={experience}
                                    onChange={e => setExperience(e.target.value)}
                                />
                            </FieldBlock>

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
                                    DERIVED RANK
                                </div>
                                <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: "#ffd700" }}>
                                    {rank}
                                </div>
                                <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                                    automatically calculated from exp
                                </div>
                            </div>
                        </div>

                        <SubmitButton onClick={handleUpdate} color="#65c7f7" label="UPDATE PROFILE ENTITY" />
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
                            letterSpacing: "1px"
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

const inputStyle = {
    width: "100%", 
    padding: "10px", 
    borderRadius: "6px",
    border: "1px solid #2a3a5a", 
    background: "#12172b",
    color: "#ccc", 
    fontFamily: "Rubik", fontSize: "0.9rem",
    boxSizing: "border-box", 
    marginBottom: "15px"
};

const cancelBtnStyle = {
    padding: "10px 12px", 
    background: "#12172b",
    border: "1px solid #2a3a5a", 
    borderRadius: "6px",
    color: "#ef5350", 
    cursor: "pointer", 
    fontFamily: "Rubik"
};

export default Update;