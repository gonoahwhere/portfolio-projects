-- ==================================
--      RELATIONSHIP CARDINALITY
-- ==================================

--  Following symbols describe relationships between tables

--      (1) - Exactly one
--          A record must be linked to one and only one record

--      (0..1) - Zero or one (optional)
--          A record may or may not be linked to another record

--      (M) or (*) - Many
--          A record can be linked to multiple records

--      (0..*) - Zero or many
--          A record can have no related records, or many





-- ===================================
--      HOW TO READ RELATIONSHIPS
-- ===================================

--      Example:
--          "USER" (1) --- (0..*) PROFILE

--      Interpretation:
--          Each PROFILE must belong to exactly one "USER"
--          A "USER" can have zero or many PROFILES

--      Example:
--          PROFILE (M) --- (M) GAME_SESSION

--      Interpretation:
--          A PROFILE can participate in many GAME_SESSIONS
--          A GAME_SESSION can contain many PROFILES
--              This requires a JOIN TABLE (PLAYER_GAME)






-- ============================================
--      LOOKUP TABLE: "CATEGORY"
--      RELATIONSHIPS:
--          PROFILE (M) --- (1) "CATEGORY"
-- ============================================
CREATE TABLE IF NOT EXISTS "CATEGORY" (
    CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    CategoryName TEXT NOT NULL
);

INSERT INTO "CATEGORY" (CategoryID, CategoryName)
VALUES
    (1, 'Navigator'),
    (2, 'Operative'),
    (3, 'Engineer'),
    (4, 'Explorer'),
    (5, 'Scientist'),
    (6, 'Pilot');

-- ========================================
--      LOOKUP TABLE: "ROLE"
--      RELATIONSHIPS:
--          PROFILE (M) --- (1) "ROLE"
-- ========================================
CREATE TABLE IF NOT EXISTS "ROLE" (
    RoleID INTEGER PRIMARY KEY AUTOINCREMENT,
    RoleName TEXT NOT NULL
);

INSERT INTO "ROLE" (RoleID, RoleName)
VALUES
    (1, 'Analyst'),
    (2, 'Scout'),
    (3, 'Medic'),
    (4, 'Commander'),
    (5, 'Technician'),
    (6, 'Strategist');

-- ==========================================
--      LOOKUP TABLE: "STATUS"
--      RELATIONSHIPS:
--          PROFILE (M) --- (1) "STATUS"
-- ==========================================
CREATE TABLE IF NOT EXISTS "STATUS" (
    StatusID INTEGER PRIMARY KEY AUTOINCREMENT,
    StatusName TEXT NOT NULL
);

INSERT INTO "STATUS" (StatusID, StatusName)
VALUES
    (1, 'Active'),
    (2, 'Inactive'),
    (3, 'Suspended'),
    (4, 'Banned'),
    (5, 'Deleted');

-- ==================================================
--      LOOKUP TABLE: GAME_STATUS
--      RELATIONSHIPS:
--          GAME_SESSION (M) --- (1) GAME_STATUS
-- ==================================================
CREATE TABLE IF NOT EXISTS GAME_STATUS (
    StatusID INTEGER PRIMARY KEY AUTOINCREMENT,
    StatusName TEXT NOT NULL
);

INSERT INTO GAME_STATUS (StatusID, StatusName)
VALUES
    (1, 'In Progress'),
    (2, 'Completed'),
    (3, 'Abandoned');

-- ===========================================
--      LOOKUP TABLE: DIFFICULTY
--      RELATIONSHIPS:
--          DIFFICULTY (1) --- (M) QUESTS
-- ===========================================
CREATE TABLE IF NOT EXISTS DIFFICULTY (
    DifficultyID INTEGER PRIMARY KEY AUTOINCREMENT,
    DifficultyName TEXT NOT NULL
);

INSERT INTO DIFFICULTY (DifficultyID, DifficultyName)
VALUES
    (1, 'Easy'),
    (2, 'Normal'),
    (3, 'Hard'),
    (4, 'Extreme'),
    (5, 'Nightmare');

-- ===========================================
--      LOOKUP TABLE: ORGANISATIONAL_AREA
--      RELATIONSHIPS:
--          AREA (1) --- (M) QUESTS
-- ===========================================
CREATE TABLE IF NOT EXISTS ORGANISATIONAL_AREA (
    AreaID INTEGER PRIMARY KEY AUTOINCREMENT,
    AreaName TEXT NOT NULL
);

INSERT INTO ORGANISATIONAL_AREA (AreaID, AreaName)
VALUES
    (1, 'Deep Space'),
    (2, 'Asteroid Belt'),
    (3, 'Mars Colony'),
    (4, 'Lunar Surface'),
    (5, 'Nebula Sector'),
    (6, 'Outer Rim');

-- ===========================================
--      CORE ENTITY: "USER"
--      RELATIONSHIPS:
--          "USER" (1) --- (0..*) PROFILE
-- ===========================================
CREATE TABLE IF NOT EXISTS "USER" (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL UNIQUE CHECK(LENGTH(Username) BETWEEN 3 AND 20),
    Email TEXT NOT NULL UNIQUE CHECK(LENGTH(Email) <= 254),
    PasswordHash TEXT NOT NULL UNIQUE CHECK(LENGTH(PasswordHash) = 64),
    CreationDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "USER" (UserID, Username, Email, PasswordHash, CreationDate)
VALUES
    (1, 'StarAlexander12', 'star.alexander12@spacegame.com', '5a7d100b399e37fa6376f91a1b3d9a99d21e3e15e982c236f8d48c986bd41ae1', '2018-04-10 09:15:31'),
    (2, 'QuantumCourtney328', 'quantum.courtney328@galaxymail.com', '017ebaf92a301031305fce473b08f43c13d218ce89eb64e9a6060daddb568075', '2018-11-23 14:30:47'),
    (3, 'NovaLisa91', 'nova.lisa91@stardust.org', '3e04d2897935c452e62a63cec853968a00d91081bb42fb2333658cdef48bda3e', '2019-06-05 08:45:19'),
    (4, 'AstroDaniel336', 'astro.daniel336@galaxymail.com', '8ee7f298bad580ec31613b02852a1d63aacb3729cf8c6100b60a43a74aea7f3e', '2020-01-18 17:20:53'),
    (5, 'NovaKathryn898', 'nova.kathryn898@spacegame.com', '59b683fb7b3460e4653c7a23e16c9eddfcd5101cfcb3a3e886047913eff098c0', '2020-09-30 11:00:28'),
    (6, 'StarStephen704', 'star.stephen704@spacegame.com', '3eadfe874665397bb8a556f5e7b0936acf0a1893f9066b93a30d843c4101f332', '2021-05-14 13:55:41'),
    (7, 'StarBrandon42', 'star.brandon42@stardust.org', 'a1b97877e946bb308dc32644383b2654a78d6c386858daeec798b407c42febe8', '2022-02-27 07:30:07'),
    (8, 'AstroLisa391', 'astro.lisa391@stardust.org', 'f27892ca20229b46e3e0da8985c95494477a8b72522707fd6cd64e87a2f74bdf', '2022-12-08 16:10:55'),
    (9, 'AstroMarie521', 'astro.marie521@spacegame.com', 'b28dc07beb218d5eaeb8399097413656bee88eeac5a8d5800e388325e4cc2f27', '2022-07-19 10:45:13'),
    (10, 'QuantumJeremy547', 'quantum.jeremy547@stardust.org', '3782bbabc3870acbfffafbde504835026360864d14ad9c8d8537c59d16b92b46', '2022-04-10 09:23:47');

-- ============================================
--      CORE ENTITY: FACTION
--      RELATIONSHIPS:
--          FACTION (1) --- (0..*) PROFILE
-- ============================================
CREATE TABLE IF NOT EXISTS FACTION (
    FactionID INTEGER PRIMARY KEY AUTOINCREMENT,
    FactionName TEXT NOT NULL UNIQUE,
    Planet TEXT NOT NULL DEFAULT 'Earth',
    FactionDescription TEXT,
    MaxPlayers INTEGER NOT NULL CHECK(MaxPlayers > 0)
);

INSERT INTO FACTION (FactionID, FactionName, Planet, FactionDescription, MaxPlayers)
VALUES
    (1, 'Orion Pact', 'Aureon Prime', 'A disciplined interstellar alliance built from frontier systems in the Orion arm. They prioritise order, defence, and controlled expansion to maintain stability across their territories.', 18),
    (2, 'Nova Syndicate', 'Nyxaris', 'A powerful corporate-criminal network operating across multiple systems. They dominate trade, hire mercenaries, and use wealth and influence to secure their control.', 42),
    (3, 'Voidborn Collective', 'Varkon Drift', 'A secretive faction originating from deep-space colonies beyond known space. They are highly adaptive and often integrate alien technology into their unpredictable operations.', 15),
    (4, 'Celestial Union', 'Elyssia', 'A diplomatic coalition of advanced civilisations united under shared governance. They focus on peacekeeping, research, and cooperation between species and systems.', 55),
    (5, 'Astro Cartel', 'Krythos Belt', 'A resource-driven network controlling mining and trade across asteroid belts. They are opportunistic, profit-focused, and quick to shift alliances.', 33),
    (6, 'Eclipse Order', 'Umbra Vey', 'A covert and ideological faction that believes in guiding galactic cycles through hidden influence. They operate through manipulation, secrecy, and long-term planning.', 27);

-- ===========================================
--      CORE ENTITY: SPACESHIP
--      RELATIONSHIPS:
--          SPACESHIP (1) --- (1) PROFILE
-- ===========================================
CREATE TABLE IF NOT EXISTS SPACESHIP (
    ShipID INTEGER PRIMARY KEY AUTOINCREMENT,
    ShipName TEXT NOT NULL CHECK(LENGTH(ShipName) BETWEEN 3 AND 20),
    Level INTEGER NOT NULL DEFAULT 1 CHECK(Level >= 1),
    HealthPoints INTEGER NOT NULL DEFAULT 100 CHECK(HealthPoints >= 0),
    AttackPower INTEGER NOT NULL DEFAULT 10 CHECK(AttackPower >= 0),
    DefencePower INTEGER NOT NULL DEFAULT 5 CHECK(DefencePower >= 0),
    ShipDestroyed INTEGER NOT NULL DEFAULT 0 CHECK(ShipDestroyed IN (0,1))
);

INSERT INTO SPACESHIP (ShipID, ShipName, Level, HealthPoints, AttackPower, DefencePower, ShipDestroyed)
VALUES
    (1, 'Astral Horizon', 7, 0, 13, 38, 1),
    (2, 'Metoer Breaker', 7, 0, 6, 23, 1),
    (3, 'Starfall Eclipse', 7, 0, 17, 42, 1),
    (4, 'Titan Voyagar', 3, 133, 11, 38, 0),
    (5, 'Dark Matter Raider', 7, 0, 43, 5, 1),
    (6, 'Galactic Pulse', 9, 0, 25, 31, 1),
    (7, 'Gravity Phantom', 9, 0, 20, 43, 1),
    (8, 'Cosmic Vanguard', 3, 0, 11, 38, 1),
    (9, 'Zenith Cruiser', 6, 0, 29, 35, 1),
    (10, 'Stellar Whisper', 9, 127, 47, 35, 0),
    (11, 'Plasma Horizon', 9, 81, 24, 33, 0),
    (12, 'Lunar Phantom', 2, 160, 18, 25, 0),
    (13, 'Asteroid Hunter', 7, 0, 10, 40, 1),
    (14, 'Eclipse Runner', 9, 0, 23, 34, 1),
    (15, 'Radiant Echo', 9, 138, 25, 31, 0),
    (16, 'Crimson Orbit', 3, 0, 19, 20, 1),
    (17, 'Nebula Voyager', 6, 0, 29, 35, 1),
    (18, 'Aurora Blade', 6, 153, 44, 26, 0),
    (19, 'Celestial Nomad', 7, 0, 43, 5, 1),
    (20, 'Solaris Knight', 9, 138, 25, 31, 0),
    (21, 'Void Harbinger', 6, 0, 44, 55, 1),
    (22, 'Comet Chaser', 3, 133, 11, 38, 0),
    (23, 'Starlight Reaver', 7, 112, 47, 8, 0),
    (24, 'Obsidian Wing', 6, 0, 29, 35, 1),
    (25, 'Void Serpent', 7, 192, 15, 35, 0),
    (26, 'Photon Spear', 3, 0, 24, 14, 1),
    (27, 'Quantum Spear', 9, 127, 49, 30, 0),
    (28, 'Vortex Seeker', 3, 0, 21, 16, 1),
    (29, 'Orion Drifter', 6, 148, 29, 38, 0),
    (30, 'Hyperion Dawn', 7, 112, 38, 8, 0),
    (31, 'Nova Striker', 7, 192, 12, 38, 0),
    (32, 'Celestial Drift', 7, 192, 18, 40, 0),
    (33, 'Ion Tempest', 2, 0, 20, 23, 1),
    (34, 'Solar Warden', 2, 160, 18, 25, 0),
    (35, 'Nebula Strider', 3, 133, 14, 40, 0),
    (36, 'Infinity Crest', 9, 112, 45, 39, 0);

-- ================================================================
--      CORE ENTITY: PROFILE
--      RELATIONSHIPS:
--          PROFILE (M) --- (1) "USER"
--          PROFILE (0..*) --- (1) FACTION
--          PROFILE (1) --- (1) SPACESHIP
--          PROFILE (M) --- (1) "CATEGORY"
--          PROFILE (M) --- (1) "ROLE"
--          PROFILE (M) --- (1) "STATUS"
--          PROFILE (M) --- (M) GAME_SESSION (via PLAYER_GAME)
--          PROFILE (M) --- (M) QUESTS (via QUEST_PROFILE)
-- ================================================================
CREATE TABLE IF NOT EXISTS PROFILE (
    PlayerID INTEGER PRIMARY KEY AUTOINCREMENT,
    PlayerName TEXT NOT NULL UNIQUE CHECK(LENGTH(PlayerName) BETWEEN 3 AND 20),
    Rank INTEGER NOT NULL DEFAULT 1 CHECK(Rank >= 1),
    Experience INTEGER NOT NULL DEFAULT 0 CHECK(Experience >= 0),
    LastLogin DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- REFERENCES FOR FK
    UserID INTEGER NOT NULL,
    FactionID INTEGER NOT NULL,
    ShipID INTEGER NOT NULL,
    CategoryID INTEGER NOT NULL,
    RoleID INTEGER NOT NULL,
    StatusID INTEGER NOT NULL,
    
    FOREIGN KEY (UserID) REFERENCES "USER"(UserID),
    FOREIGN KEY (FactionID) REFERENCES FACTION(FactionID),
    FOREIGN KEY (ShipID) REFERENCES SPACESHIP(ShipID),
    FOREIGN KEY (CategoryID) REFERENCES "CATEGORY"(CategoryID),
    FOREIGN KEY (RoleID) REFERENCES "ROLE"(RoleID),
    FOREIGN KEY (StatusID) REFERENCES "STATUS"(StatusID)
);

INSERT INTO PROFILE (PlayerID, PlayerName, Rank, Experience, LastLogin, CreationDate, UserID, FactionID, ShipID, CategoryID, RoleID, StatusID)
VALUES
    (25, 'orionis', 3, 314, '2020-09-27 12:11:33', '2018-04-10 17:42:09', 1, 1, 21, 5, 3, 1),
    (26, 'vantara', 8, 928, '2025-04-11 19:26:58', '2021-11-13 09:05:44', 1, 6, 4, 2, 6, 5),
    (16, 'kepleron', 8, 910, '2018-11-23 15:15:49', '2022-07-14 18:45:09', 2, 2, 15, 6, 2, 3),
    (17, 'zenovar', 6, 792, '2019-03-08 16:27:51', '2024-01-22 09:33:40', 2, 5, 33, 1, 5, 2),
    (18, 'hyperionix', 9, 963, '2020-09-17 11:05:22', '2025-06-03 20:14:55', 2, 3, 2, 3, 1, 4),
    (19, 'nyxara', 7, 844, '2023-08-29 07:48:10', '2023-08-29 07:48:10', 2, 4, 27, 4, 4, 1),
    (14, 'draconis', 3, 449, '2019-06-05 09:30:13', '2022-12-19 11:08:27', 3, 1, 9, 2, 6, 5),
    (15, 'solaris', 1, 78, '2021-04-26 08:47:19', '2026-04-13 16:02:51', 3, 2, 18, 6, 2, 2),
    (1, 'titanus', 1, 102, '2020-01-18 23:58:41', '2021-11-03 08:27:15', 4, 6, 35, 1, 5, 3),
    (2, 'phoenixa', 2, 153, '2020-03-12 18:49:37', '2023-06-25 14:52:09', 4, 3, 6, 5, 3, 1),
    (3, 'atlasion', 5, 625, '2021-07-05 09:33:11', '2024-09-18 19:05:44', 4, 5, 12, 3, 6, 4),
    (4, 'vegara', 3, 412, '2022-10-27 16:21:58', '2026-02-07 22:40:31', 4, 4, 24, 4, 1, 2),
    (5, 'cosmara', 2, 181, '2024-05-14 07:12:46', '2026-04-13 11:36:20', 4, 2, 3, 2, 2, 5),
    (11, 'rheonis', 3, 440, '2020-09-30 14:43:12', '2022-04-18 09:14:52', 5, 1, 30, 6, 4, 2),
    (12, 'cygnara', 5, 650, '2021-12-09 17:38:21', '2024-08-27 13:57:06', 5, 6, 11, 1, 6, 3),
    (13, 'novaris', 6, 741, '2023-03-15 08:52:47', '2026-04-13 15:08:39', 5, 3, 7, 3, 1, 1),
    (32, 'heliora', 1, 102, '2021-05-14 14:52:18', '2022-08-03 18:45:27', 6, 4, 14, 5, 2, 4),
    (33, 'tritonix', 1, 84, '2021-07-02 13:11:56', '2023-11-19 10:22:08', 6, 5, 29, 2, 3, 5),
    (34, 'elysara', 9, 961, '2022-01-27 08:39:44', '2024-06-07 21:14:33', 6, 2, 5, 4, 5, 2),
    (35, 'perseon', 1, 102, '2023-04-10 16:57:02', '2025-12-01 12:08:49', 6, 6, 36, 6, 1, 3),
    (36, 'andromis', 4, 587, '2024-09-05 11:05:18', '2026-04-13 17:33:21', 6, 1, 8, 3, 6, 1),
    (27, 'lyrion', 1, 132, '2022-02-27 11:34:47', '2022-12-14 19:05:33', 7, 5, 20, 1, 4, 2),
    (28, 'altaris', 6, 767, '2023-05-19 14:42:11', '2023-10-02 09:28:47', 7, 3, 1, 2, 2, 4),
    (29, 'janoris', 1, 132, '2023-11-03 10:55:06', '2024-07-21 16:33:58', 7, 2, 17, 5, 6, 3),
    (30, 'umbrixa', 7, 960, '2024-08-26 12:09:44', '2025-03-18 20:47:12', 7, 4, 10, 4, 3, 5),
    (31, 'cetaris', 1, 125, '2024-12-11 07:31:53', '2026-04-13 18:12:36', 7, 6, 25, 6, 1, 1),
    (6, 'icaronis', 3, 377, '2022-12-08 18:43:15', '2024-04-17 23:34:04', 8, 1, 13, 1, 5, 3),
    (7, 'astrion', 7, 840, '2022-07-19 13:29:43', '2023-01-16 18:42:55', 9, 3, 34, 3, 6, 5),
    (8, 'rigelis', 1, 127, '2022-08-30 11:07:39', '2024-09-22 14:33:10', 9, 5, 16, 2, 2, 2),
    (9, 'dionara', 6, 710, '2023-12-05 16:48:21', '2025-02-11 10:19:47', 9, 2, 22, 4, 6, 1),
    (10, 'charonis', 3, 405, '2025-06-14 08:25:03', '2026-04-13 15:57:36', 9, 4, 28, 1, 6, 4),
    (20, 'eridara', 7, 449, '2022-04-10 11:43:27', '2022-05-02 18:05:33', 10, 1, 19, 6, 3, 2),
    (21, 'callion', 6, 449, '2023-06-10 09:23:47', '2024-11-15 11:42:09', 10, 1, 31, 3, 5, 3),
    (22, 'lunaris', 5, 449, '2024-8-23 19:23:40', '2025-05-01 20:16:58', 10, 1, 26, 1, 2, 5),
    (23, 'arctara', 10, 449, '2024-12-28 19:30:17', '2024-08-18 08:33:21', 10, 1, 23, 2, 6, 1),
    (24, 'polaron', 6, 449, '2024-04-10 16:27:30', '2026-01-03 14:27:45', 10, 1, 32, 4, 4, 4);

-- ================================================================
--      CORE ENTITY: GAME_SESSION
--      RELATIONSHIPS:
--          GAME_SESSION (1) --- (0..*) PLAYER_GAME
--          GAME_SESSION (M) --- (1) GAME_STATUS
--          Winner is calculated from PLAYER_GAME (not stored)
-- ================================================================
CREATE TABLE IF NOT EXISTS GAME_SESSION (
    GameID INTEGER PRIMARY KEY AUTOINCREMENT,
    GameDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Duration INTEGER NOT NULL DEFAULT 10,
    
    -- REFERENCES FOR FK
    StatusID INTEGER NOT NULL,

    FOREIGN KEY (StatusID) REFERENCES GAME_STATUS(StatusID)
);

INSERT INTO GAME_SESSION (GameID, GameDate, Duration, StatusID)
VALUES
    (63, '2018-04-15 14:30:49', 21, 1),
    (64, '2018-05-02 19:15:43', 19, 2),
    (6, '2021-11-20 16:45:12', 5, 1),
    (47, '2018-11-23 15:15:49', 28, 2),
    (3, '2019-03-12 14:45:17', 18, 1),
    (4, '2019-04-05 18:30:42', 5, 2),
    (37, '2020-09-22 13:10:56', 9, 1),
    (38, '2020-10-15 16:40:28', 22, 3),
    (39, '2020-11-08 09:25:14', 10, 3),
    (40, '2020-12-30 20:15:51', 29, 3),
    (80, '2023-09-03 15:50:38', 27, 1),
    (59, '2019-06-12 17:45:29', 5, 2),
    (18, '2021-04-30 12:15:44', 25, 1),
    (19, '2021-05-18 19:33:52', 26, 3),
    (20, '2021-06-22 14:20:17', 18, 2),
    (21, '2021-07-10 11:05:38', 30, 3),
    (22, '2021-08-03 16:52:26', 20, 3),
    (72, '2020-01-25 14:22:15', 16, 1),
    (73, '2020-02-12 19:47:33', 10, 3),
    (74, '2020-03-08 10:31:58', 19, 3),
    (1, '2020-03-18 15:16:42', 13, 1),
    (2, '2020-04-09 21:53:24', 21, 2),
    (75, '2021-07-11 13:48:27', 8, 1),
    (76, '2021-08-02 17:25:51', 27, 2),
    (77, '2021-09-15 11:12:38', 6, 3),
    (78, '2021-10-28 18:40:19', 7, 2),
    (7, '2022-11-05 09:54:37', 6, 2),
    (83, '2024-05-20 14:33:12', 28, 2),
    (84, '2024-06-10 16:47:55', 14, 2),
    (85, '2024-07-03 12:19:44', 15, 3),
    (86, '2024-07-25 20:05:28', 10, 2),
    (87, '2024-08-18 15:52:17', 5, 3),
    (15, '2020-10-06 16:28:45', 26, 1),
    (16, '2020-10-28 12:15:33', 11, 2),
    (17, '2020-11-19 19:52:18', 25, 2),
    (11, '2021-12-15 13:44:56', 22, 3),
    (12, '2022-01-08 20:12:38', 9, 2),
    (13, '2022-02-03 15:35:22', 16, 3),
    (14, '2022-03-12 11:18:47', 15, 3),
    (91, '2023-03-22 17:41:29', 18, 1),
    (92, '2023-04-16 13:26:54', 10, 3),
    (93, '2023-05-25 19:07:11', 17, 3),
    (58, '2021-05-21 11:33:47', 24, 1),
    (48, '2021-07-08 15:48:22', 10, 1),
    (49, '2021-08-01 18:26:38', 30, 3),
    (50, '2021-09-10 10:15:53', 16, 3),
    (5, '2022-02-03 14:22:19', 10, 1),
    (65, '2023-04-18 12:41:35', 20, 1),
    (66, '2023-05-12 19:54:17', 15, 3),
    (67, '2023-06-28 14:33:51', 26, 2),
    (68, '2023-08-05 17:08:24', 14, 2),
    (29, '2024-09-12 13:29:47', 11, 1),
    (30, '2024-10-01 16:42:15', 30, 2),
    (23, '2022-03-05 16:12:33', 10, 1),
    (24, '2022-03-28 13:47:58', 29, 3),
    (25, '2022-04-21 19:25:14', 29, 3),
    (26, '2022-05-18 10:08:42', 13, 2),
    (60, '2023-05-27 11:18:26', 20, 1),
    (61, '2023-06-19 17:33:51', 24, 3),
    (62, '2023-07-15 14:05:37', 8, 3),
    (45, '2023-11-10 15:42:28', 10, 1),
    (46, '2023-12-02 18:21:54', 12, 3),
    (41, '2024-09-02 16:34:12', 10, 3),
    (42, '2024-09-25 13:19:47', 24, 3),
    (43, '2024-10-18 19:52:35', 12, 3),
    (44, '2024-11-12 11:27:18', 10, 2),
    (88, '2024-12-18 14:08:22', 30, 3),
    (89, '2025-01-09 16:45:39', 6, 3),
    (90, '2025-02-03 12:18:54', 19, 2),
    (54, '2022-12-16 12:57:41', 21, 3),
    (55, '2023-01-09 15:31:28', 13, 2),
    (56, '2023-02-05 18:14:53', 29, 3),
    (57, '2023-03-02 10:48:19', 23, 3),
    (71, '2022-07-26 17:44:18', 13, 3),
    (79, '2022-09-06 14:33:52', 26, 1),
    (31, '2023-12-12 12:15:47', 25, 1),
    (32, '2024-01-04 19:52:33', 16, 2),
    (81, '2025-06-21 15:47:29', 13, 1),
    (82, '2025-07-14 11:33:56', 30, 2),
    (51, '2022-04-17 14:22:15', 6, 3),
    (52, '2022-05-08 18:56:38', 7, 2),
    (53, '2022-06-02 12:31:47', 20, 3),
    (27, '2023-06-18 16:48:22', 24, 3),
    (28, '2023-07-12 13:15:51', 14, 3),
    (8, '2024-08-30 15:41:28', 5, 1),
    (9, '2024-09-22 17:08:53', 19, 2),
    (10, '2024-10-16 11:35:17', 19, 3),
    (69, '2025-01-04 14:12:45', 8, 1),
    (70, '2025-01-26 16:53:31', 20, 3),
    (33, '2024-04-18 13:19:44', 11, 3),
    (34, '2024-05-10 19:42:18', 20, 3),
    (35, '2024-06-05 15:27:52', 13, 3),
    (36, '2024-07-02 11:08:36', 14, 2);

-- ==============================================
--      JOIN TABLE: PLAYER_GAME
--      RELATIONSHIPS:
--          PROFILE (M) --- (M) GAME_SESSION
-- ==============================================
CREATE TABLE IF NOT EXISTS PLAYER_GAME (
    PlayerID INTEGER NOT NULL,
    GameID INTEGER NOT NULL,
    Score INTEGER DEFAULT 0 CHECK (Score >= 0),

    PRIMARY KEY (PlayerID, GameID),

    FOREIGN KEY (PlayerID) REFERENCES PROFILE(PlayerID),
    FOREIGN KEY (GameID) REFERENCES GAME_SESSION(GameID)
);

INSERT INTO PLAYER_GAME (PlayerID, GameID, Score)
VALUES
    (25, 63, 24),
    (25, 64, 56),
    (26, 6, 38),
    (16, 47, 72),
    (17, 3, 11),
    (17, 4, 74),
    (18, 37, 9),
    (18, 38, 0),
    (18, 39, 0),
    (18, 40, 0),
    (19, 80, 17),
    (14, 59, 86),
    (15, 18, 15),
    (15, 19, 0),
    (15, 20, 58),
    (15, 21, 0),
    (15, 22, 0),
    (1, 72, 6),
    (1, 73, 0),
    (1, 74, 0),
    (2, 1, 36),
    (2, 2, 83),
    (3, 75, 43),
    (3, 76, 85),
    (3, 77, 0),
    (3, 78, 61),
    (4, 7, 60),
    (5, 83, 56),
    (5, 84, 66),
    (5, 85, 0),
    (5, 86, 82),
    (5, 87, 0),
    (11, 15, 38),
    (11, 16, 60),
    (11, 17, 63),
    (12, 11, 0),
    (12, 12, 51),
    (12, 13, 0),
    (12, 14, 0),
    (13, 91, 12),
    (13, 92, 0),
    (13, 93, 0),
    (32, 58, 1),
    (33, 48, 18),
    (33, 49, 0),
    (33, 50, 0),
    (34, 5, 11),
    (35, 65, 28),
    (35, 66, 0),
    (35, 67, 75),
    (35, 68, 73),
    (36, 29, 26),
    (36, 30, 55),
    (27, 23, 38),
    (27, 24, 0),
    (27, 25, 0),
    (27, 26, 64),
    (28, 60, 38),
    (28, 61, 0),
    (28, 62, 0),
    (29, 45, 36),
    (29, 46, 84),
    (30, 41, 0),
    (30, 42, 0),
    (30, 43, 0),
    (30, 44, 98),
    (31, 88, 0),
    (31, 89, 0),
    (31, 90, 80),
    (6, 54, 0),
    (6, 55, 53),
    (6, 56, 0),
    (6, 57, 0),
    (7, 71, 0),
    (8, 79, 43),
    (9, 31, 17),
    (9, 32, 66),
    (10, 81, 19),
    (10, 82, 95),
    (20, 51, 0),
    (20, 52, 60),
    (20, 53, 82),
    (21, 27, 0),
    (21, 28, 0),
    (22, 8, 41),
    (22, 9, 97),
    (22, 10, 0),
    (23, 69, 48),
    (23, 70, 0),
    (24, 33, 0),
    (24, 34, 0),
    (24, 35, 0),
    (24, 36, 81);
-- ============================================================
--      CORE ENTITY: QUESTS
--      RELATIONSHIPS:
--          QUESTS (M) --- (1) DIFFICULTY
--          QUESTS (M) --- (1) AREA
--          QUESTS (M) --- (M) PROFILE (via QUEST_PROFILE)
-- ============================================================
CREATE TABLE IF NOT EXISTS QUESTS (
    QuestID INTEGER PRIMARY KEY AUTOINCREMENT,
    QuestName TEXT NOT NULL,
    
    -- REFERENCES FOR FK
    DifficultyID INTEGER NOT NULL,
    AreaID INTEGER NOT NULL,

    FOREIGN KEY (DifficultyID) REFERENCES DIFFICULTY(DifficultyID),
    FOREIGN KEY (AreaID) REFERENCES ORGANISATIONAL_AREA(AreaID)
);

INSERT INTO QUESTS (QuestID, QuestName, DifficultyID, AreaID)
VALUES
    (1, 'Stellar Nexus', 2, 5),
    (2, 'Star Chart Alpha', 2, 3),
    (3, 'Neural Orbit', 5, 2),
    (4, 'Dark Matter Drift', 4, 4),
    (5, 'Solar Link', 5, 2),
    (6, 'Quantum Beacon', 5, 6),
    (7, 'Nebula Chain', 2, 2),
    (8, 'Pulsar Grid', 4, 2),
    (9, 'Gravity Well', 3, 1),
    (10, 'Void Relay', 1, 4);

-- ========================================
--      JOIN TABLE: QUEST_PROFILE
--      RELATIONSHIPS:
--          PROFILE (M) --- (M) QUESTS
-- ========================================
CREATE TABLE IF NOT EXISTS QUEST_PROFILE (
    QuestID INTEGER NOT NULL,
    PlayerID INTEGER NOT NULL,

    PRIMARY KEY (QuestID, PlayerID),

    FOREIGN KEY (QuestID) REFERENCES QUESTS(QuestID),
    FOREIGN KEY (PlayerID) REFERENCES PROFILE(PlayerID)
);

INSERT INTO QUEST_PROFILE (QuestID, PlayerID)
VALUES
    (1, 25),
    (3, 26),
    (4, 16),
    (8, 16),
    (10, 17),
    (6, 17),
    (4, 18),
    (9, 18),
    (3, 19),
    (9, 14),
    (10, 15),
    (8, 15),
    (3, 1),    
    (4, 2),    
    (8, 2),    
    (1, 3),    
    (3, 4),    
    (3, 5),
    (2, 11),
    (2, 12),
    (1, 13),
    (5, 13),
    (4, 32),
    (9, 32),
    (7, 33),
    (5, 33),
    (2, 34),
    (10, 34),
    (4, 35),
    (9, 36),
    (3, 36),
    (8, 27),
    (2, 28),
    (8, 28),
    (4, 29),
    (10, 30),
    (1, 30),
    (1, 31),
    (8, 31),
    (4, 6),
    (9, 6),
    (9, 7),
    (6, 7),
    (7, 8),
    (1, 8),
    (3, 9),
    (9, 9),
    (6, 10),
    (5, 20),
    (3, 21),
    (9, 21),
    (7, 22),
    (9, 22),
    (4, 23),
    (7, 23),
    (10, 24);
