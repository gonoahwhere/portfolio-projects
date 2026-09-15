/* ===== IMPORTS ===== */
import { useEffect, useState } from 'react';
import CustomSelect from './CustomSelect';

/* ===== RANK FORMULA ===== */
function expToRank(exp) {
    const thresholds = [0, 150, 300, 450, 600, 700, 800, 900, 950, 1000];
    if (exp >= 1000) {
        return 10 + Math.floor(Math.log(exp / 1000) * 6);
    }
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
                    textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
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
        <div style={{ display: "flex", justifyContent: "center", marginTop: "5px" }}>
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
                    textShadow: "4px 4px 4px rgba(0, 0, 0, 0.25)"
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
                transition: "border-color 0.2s",
                textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
            }}
        >
            <div 
                style={{
                    fontSize: "0.8rem",
                    opacity: 0.6,
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
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
                    transition: "color 0.2s",
                    textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
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
                    fontFamily: "Rubik",
                    textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
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

/* ===== GAME ENTRY ROW ===== */
function GameEntryRow({ game, index, onChange, onRemove, gameStatuses }) {
    const statusId = Number(game.statusId);
    const isAbandoned = statusId === 3;
    const scoreMin = statusId === 1 ? 1 : statusId === 2 ? 51 : 0;
    const scoreMax = statusId === 1 ? 50 : statusId === 2 ? 100 : 0;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px 120px 36px",
                gap: "8px",
                alignItems: "center",
                padding: "10px",
                background: "#12172b",
                borderRadius: "6px",
                marginBottom: "8px",
                textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
            }}
        >
            <input
                type="date"
                style={{ ...inputStyle, marginBottom: 0 }}
                value={game.date}
                onChange={e => onChange(index, "date", e.target.value)}
            />
            <input
                type="number"
                min="1"
                placeholder="Mins"
                style={{ ...inputStyle, marginBottom: 0 }}
                value={game.duration}
                onChange={e => onChange(index, "duration", e.target.value)}
            />
            <input
                type="number"
                min={scoreMin}
                max={scoreMax}
                style={{
                    ...inputStyle,
                    marginBottom: 0,
                    opacity: isAbandoned ? 0.35 : 1,
                    cursor: isAbandoned ? "not-allowed" : "text",
                    color: isAbandoned ? "#ccc" : inputStyle.color
                }}
                value={game.score}
                readOnly={isAbandoned}
                onChange={e => {
                    if (isAbandoned) return;
                    const clamped = Math.min(scoreMax, Math.max(scoreMin, Number(e.target.value)));
                    onChange(index, "score", clamped);
                }}
            />
            <select
                style={{ ...inputStyle, marginBottom: 0 }}
                value={game.statusId}
                onChange={e => onChange(index, "statusId", e.target.value)}
            >
                {gameStatuses.map(s => (
                    <option key={s.StatusID} value={s.StatusID}>{s.StatusName}</option>
                ))}
            </select>
            <button
                onClick={() => onRemove(index)}
                style={{ ...cancelBtnStyle, padding: "8px" }}
            >
                ✕
            </button>
        </div>
    );
}

/* ===== USER FORM ===== */
function UserForm({ username, setUsername, email, setEmail, password, setPassword, onSubmit }) {
    return (
        <>
            <div 
                style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "20px", 
                    marginBottom: "25px",
                    textShadow: "4px 4px 4px rgba(0, 0, 0, 0.25)"
                }}
            >
                <FieldBlock label="USERNAME" accent="#65c7f7">
                    <input 
                        style={inputStyle} 
                        placeholder="e.g. StarPilot99"
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                    />
                </FieldBlock>

                <FieldBlock label="EMAIL" accent="#65c7f7">
                    <input 
                        style={inputStyle} 
                        placeholder="email@domain.com"
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                    />
                </FieldBlock>
            </div>

            <FieldBlock label="PASSWORD" accent="#65c7f7">
                <input 
                    style={inputStyle} 
                    placeholder="••••••••" type="password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                />
            </FieldBlock>
            
            <SubmitButton onClick={onSubmit} color="#65c7f7" label="CREATE USER ENTITY" />
        </>
    );
}

/* ===== PROFILE FORM ===== */
function ProfileForm({
    users, selectedUserId, setSelectedUserId,
    playerName, setPlayerName,
    factions, factionId, setFactionId, useNewFaction, setUseNewFaction, newFactionName, setNewFactionName,
    shipId, setShipId,
    categories, categoryId, setCategoryId,
    roles, roleId, setRoleId,
    statuses, statusId, setStatusId,
    experience, setExperience,
    games, setGames, gameStatuses,
    allQuests, selectedQuests, setSelectedQuests,
    onSubmit
}) {
    const rank = expToRank(Number(experience));

    const addGame = () => {
        const today = new Date().toISOString().split("T")[0];
        setGames(prev => [...prev, { date: today, duration: 10, score: Math.floor(Math.random() * 50) + 1, statusId: 2 }]);
    };

    const updateGame = (index, field, value) => {
        setGames(prev => prev.map((g, i) => {
            if (i !== index) return g;

            const updated = { ...g, [field]: value };

            if (field === "statusId") {
                const id = Number(value);
                if (id === 1) updated.score = Math.floor(Math.random() * 50) + 1;
                else if (id === 2) updated.score = Math.floor(Math.random() * 50) + 51;
                else updated.score = 0;
            }

            return updated;
        }));
    };

    const removeGame = (index) => {
        setGames(prev => prev.filter((_, i) => i !== index));
    };

    const toggleQuest = (questId) => {
        setSelectedQuests(prev =>
            prev.includes(questId)
                ? prev.filter(id => id !== questId)
                : [...prev, questId]
        );
    };

    return (
        <>
            {/* ROW 1 */}
            <div 
                style={{
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "20px", marginBottom: "25px" 
                }}
            >
                <FieldBlock label="ASSIGN TO USER" accent="#65c7f7">
                    <CustomSelect users={users} selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId} />
                </FieldBlock>

                <FieldBlock label="PLAYER NAME" accent="#65c7f7">
                    <input 
                        style={inputStyle} 
                        placeholder="e.g. Commander Vex"
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
                                style={{ 
                                    ...inputStyle, 
                                    marginBottom: 0, 
                                    flex: 1 
                                }}
                                placeholder="New faction name"
                                value={newFactionName}
                                onChange={e => setNewFactionName(e.target.value)} 
                            />
                            <button onClick={() => setUseNewFaction(false)} style={cancelBtnStyle}>✕</button>
                        </div>
                    ) : (
                        <select 
                            style={inputStyle} 
                            value={factionId} 
                            onChange={e => {
                                if (e.target.value === "new") setUseNewFaction(true);
                                else setFactionId(e.target.value);
                            }}
                        >
                            <option value="">Select Faction...</option>
                            {factions.map(f => (
                                <option key={f.FactionID} value={f.FactionID}>{f.FactionName}</option>
                            ))}
                            <option value="new">Create New Faction</option>
                        </select>
                    )}
                </FieldBlock>

                <FieldBlock label="SHIP NAME" accent="#ff9800">
                    <input 
                        style={{ 
                            ...inputStyle, 
                            color: "#ff9800"
                        }} 
                        placeholder="e.g. Nova Crusher"
                        value={shipId} 
                        onChange={e => setShipId(e.target.value)} 
                    />
                </FieldBlock>
            </div>

            {/* ROW 3 */}
            <div 
                style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(3, 1fr)", 
                    gap: "15px", 
                    marginBottom: "25px" 
                }}
            >
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

            {/* EXPERIENCE / RANK */}
            <div 
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "25px"
                }}
            >
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

                {/* DERIVED RANK PREVIEW */}
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
                    <div 
                        style={{
                            fontSize: "2.2rem",
                            fontWeight: "bold",
                            color: "#ffd700"
                        }}
                    >
                        {rank}
                    </div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                        automatically calculated from exp
                    </div>
                </div>
            </div>

            {/* GAMES SECTION */}
            <div 
                style={{
                    background: "#1a1f3a",
                    border: "1px solid #2a3a5a",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "25px"
                }}
            >
                <div 
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: games.length > 0 ? "15px" : 0
                    }}
                >
                    <div 
                        style={{
                            fontSize: "0.85rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            opacity: 0.6
                        }}
                    >
                        GAME SESSIONS • {games.length}
                    </div>
                    <button
                        onClick={addGame}
                        style={{
                            padding: "6px 14px",
                            background: "transparent",
                            border: "1px solid #7cb342",
                            borderRadius: "6px",
                            color: "#7cb342",
                            cursor: "pointer",
                            fontFamily: "Rubik",
                            fontSize: "0.75rem",
                            letterSpacing: "0.5px",
                            textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#7cb34222"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        + ADD GAME
                    </button>
                </div>

                {games.length > 0 && (
                    <>
                        {/* COLUMN HEADERS */}
                        <div 
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 80px 80px 120px 36px",
                                gap: "8px",
                                marginBottom: "6px",
                                paddingLeft: "4px"
                            }}
                        >
                            {["Date", "Mins", "Score", "Status", ""].map((h, i) => (
                                <div 
                                    key={i} 
                                    style={{ 
                                        fontSize: "0.7rem", 
                                        opacity: 0.4, 
                                        textTransform: "uppercase", 
                                        letterSpacing: "1px",
                                        textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
                                    }}
                                >
                                    {h}
                                </div>
                            ))}
                        </div>

                        {games.map((game, idx) => (
                            <GameEntryRow
                                key={idx}
                                game={game}
                                index={idx}
                                onChange={updateGame}
                                onRemove={removeGame}
                                gameStatuses={gameStatuses}
                            />
                        ))}
                    </>
                )}

                {games.length === 0 && (
                    <div 
                        style={{
                            fontSize: "0.8rem", 
                            opacity: 0.35, 
                            marginTop: "12px",
                            textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        No games added yet - click + ADD GAME to log a session
                    </div>
                )}
            </div>

            {/* QUESTS SECTION */}
            <div 
                style={{
                    background: "#1a1f3a",
                    border: "1px solid #2a3a5a",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "25px"
                }}
            >
                <div 
                    style={{
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        opacity: 0.6,
                        marginBottom: "15px"
                    }}
                >
                    QUESTS • {selectedQuests.length} SELECTED
                </div>

                <div 
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "8px"
                    }}
                >
                    {allQuests.map(quest => {
                        const isSelected = selectedQuests.includes(quest.QuestID);
                        return (
                            <div
                                key={quest.QuestID}
                                onClick={() => toggleQuest(quest.QuestID)}
                                style={{
                                    padding: "10px 14px",
                                    background: isSelected ? "#12172b" : "transparent",
                                    border: `1px solid ${isSelected ? "#ab47bc" : "#2a3a5a"}`,
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    transition: "border-color 0.2s, background 0.2s",
                                    textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: "0.85rem", color: isSelected ? "#ccc" : "#888" }}>
                                        {quest.QuestName}
                                    </div>
                                    <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                                        {quest.AreaName}
                                    </div>
                                </div>
                                <div 
                                    style={{
                                        fontSize: "0.7rem",
                                        color: isSelected ? "#ab47bc" : "#555",
                                        textAlign: "right"
                                    }}
                                >
                                    {quest.DifficultyName}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <SubmitButton onClick={onSubmit} color="#52f3ff" label="CREATE PROFILE ENTITY" />
        </>
    );
}

/* ===== MAIN COMPONENT ===== */
function Create() {
    const [mode, setMode] = useState('user');

    /* ===== DATA ===== */
    const [users, setUsers] = useState([]);
    const [factions, setFactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [roles, setRoles] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [gameStatuses] = useState([
        { StatusID: 1, StatusName: "In Progress" },
        { StatusID: 2, StatusName: "Completed" },
        { StatusID: 3, StatusName: "Abandoned" }
    ]);
    const [allQuests, setAllQuests] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ===== USER ===== */
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    /* ===== PROFILE ===== */
    const [selectedUserId, setSelectedUserId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [shipId, setShipId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [statusId, setStatusId] = useState("");
    const [experience, setExperience] = useState(0);
    const [games, setGames] = useState([]);
    const [selectedQuests, setSelectedQuests] = useState([]);

    /* ===== FACTION ===== */
    const [factionId, setFactionId] = useState("");
    const [useNewFaction, setUseNewFaction] = useState(false);
    const [newFactionName, setNewFactionName] = useState("");

    /* ===== MESSAGE ===== */
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    /* ===== RELOAD USER SELECTOR ===== */
    useEffect(() => {
        if (users.length) {
            setSelectedUserId(prev => users.some(u => u.UserID === prev) ? prev : "");
        }
    }, [users]);

    /* ===== FETCH ALL LOOKUPS ===== */
    useEffect(() => {
        Promise.all([
            fetch("http://127.0.0.1:5000/users").then(r => r.json()),
            fetch("http://127.0.0.1:5000/factions").then(r => r.json()),
            fetch("http://127.0.0.1:5000/categories").then(r => r.json()),
            fetch("http://127.0.0.1:5000/roles").then(r => r.json()),
            fetch("http://127.0.0.1:5000/statuses").then(r => r.json()),
            fetch("http://127.0.0.1:5000/quests").then(r => r.json()),
        ])
        .then(([u, f, c, r, st, q]) => {
            setUsers(u); setFactions(f); setCategories(c);
            setRoles(r); setStatuses(st); setAllQuests(q);
            setLoading(false);
        })
        .catch(err => { console.error(err); setLoading(false); });
    }, []);

    /* ===== CREATE USER ===== */
    const handleCreateUser = async () => {
        if (!username || !email || !password) {
            setMessage("Please fill all fields"); 
            setMessageType("error"); 
            return;
        }
        try {
            const res = await fetch("http://127.0.0.1:5000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Username: username, Email: email, Password: password })
            });
            if (!res.ok) throw new Error();
            const newUser = await res.json();
            setUsers(prev => [...prev, newUser]);
            setMessage("User created successfully"); 
            setMessageType("success");
            setUsername(""); 
            setEmail(""); 
            setPassword("");
        } catch {
            setMessage("Error creating user"); 
            setMessageType("error");
        }
    };

    /* ===== CREATE PROFILE ===== */
    const handleCreateProfile = async () => {
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

            const rank = expToRank(Number(experience));
            const profileRes = await fetch("http://127.0.0.1:5000/profiles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    PlayerName: playerName, UserID: selectedUserId,
                    FactionID: factionValue, ShipID: shipId,
                    CategoryID: categoryId, RoleID: roleId, StatusID: statusId,
                    Experience: Number(experience), Rank: rank
                })
            });
            if (!profileRes.ok) throw new Error();
            const { PlayerID } = await profileRes.json();

            for (const game of games) {
                await fetch("http://127.0.0.1:5000/game_sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        PlayerID,
                        GameDate: game.date,
                        Duration: Number(game.duration),
                        Score: Number(game.score),
                        StatusID: Number(game.statusId)
                    })
                });
            }

            for (const questId of selectedQuests) {
                await fetch("http://127.0.0.1:5000/quest_profiles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ PlayerID, QuestID: questId })
                });
            }

            setMessage(`Profile created • Rank ${rank} • ${games.length} games • ${selectedQuests.length} quests`);
            setMessageType("success");

            setPlayerName(""); 
            setSelectedUserId(""); 
            setFactionId("");
            setUseNewFaction(false); 
            setNewFactionName(""); 
            setShipId("");
            setCategoryId(""); 
            setRoleId(""); 
            setStatusId("");
            setExperience(0); 
            setGames([]); 
            setSelectedQuests([]);

        } catch (e) {
            setMessage("Error creating profile"); 
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
                    textShadow: "4px 4px 4px rgba(0, 0, 0, 0.25)"
                }}
            >
                CREATE AN ENTITY
            </h1>

            {/* MODE TOGGLE */}
            <div 
                style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    gap: "15px", 
                    marginBottom: "30px",
                    textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
                }}
            >
                {["user", "profile"].map(m => (
                    <button 
                        key={m} 
                        onClick={() => { 
                            setMode(m); 
                            setMessage(""); 
                        }} 
                        style={{
                            padding: "10px 28px",
                            background: mode === m ? "linear-gradient(135deg, #1a2f5a 0%, #16213e 100%)" : "#1a1f3a",
                            color: mode === m ? "#65c7f7" : "#ccc",
                            border: mode === m ? "1px solid #2a4a8a" : "1px solid #2a3a5a",
                            borderRadius: "8px", 
                            cursor: "pointer",
                            fontFamily: "Rubik", 
                            fontSize: "0.85rem",
                            textTransform: "uppercase", 
                            letterSpacing: "1px",
                            textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        {m === "user" ? "Create User" : "Create Profile"}
                    </button>
                ))}
            </div>

            {/* MAIN CARD */}
            <div 
                style={{
                    background: "linear-gradient(135deg, #1a2f5a 0%, #16213e 100%)",
                    border: "1px solid #2a4a8a",
                    borderRadius: "12px",
                    padding: "25px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
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
                        textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: "1.8rem", color: "#ccc" }}>
                        {mode === "user" ? "New User" : "New Profile"}
                    </h3>
                    <div 
                        style={{ 
                            fontSize: "1.2rem", 
                            opacity: 0.7, 
                            textShadow: "4px 4px 4px rgba(0, 0, 0, 0.25)",
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        {mode === "user" ? "Account Entity" : "Player Entity"}
                    </div>
                </div>

                {mode === "user" ? (
                    <UserForm
                        username={username} setUsername={setUsername}
                        email={email} setEmail={setEmail}
                        password={password} setPassword={setPassword}
                        onSubmit={handleCreateUser}
                    />
                ) : (
                    <ProfileForm
                        users={users} selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId}
                        playerName={playerName} setPlayerName={setPlayerName}
                        factions={factions} factionId={factionId} setFactionId={setFactionId}
                        useNewFaction={useNewFaction} setUseNewFaction={setUseNewFaction}
                        newFactionName={newFactionName} setNewFactionName={setNewFactionName}
                        shipId={shipId} setShipId={setShipId}
                        categories={categories} categoryId={categoryId} setCategoryId={setCategoryId}
                        roles={roles} roleId={roleId} setRoleId={setRoleId}
                        statuses={statuses} statusId={statusId} setStatusId={setStatusId}
                        experience={experience} setExperience={setExperience}
                        games={games} setGames={setGames} gameStatuses={gameStatuses}
                        allQuests={allQuests} selectedQuests={selectedQuests} setSelectedQuests={setSelectedQuests}
                        onSubmit={handleCreateProfile}
                    />
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
                            textShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
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
    fontFamily: "Rubik", 
    fontSize: "0.9rem",
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

export default Create;