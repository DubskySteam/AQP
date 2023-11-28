-- Create the smartsocial schema
CREATE SCHEMA smartsocial;

-- Create Groups table
CREATE TABLE smartsocial.Groups (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    creation_date DATE NOT NULL,
    admin_user_id INT REFERENCES smartuser.users(id),
    description TEXT
);

-- Create GroupMembers table
CREATE TABLE smartsocial.GroupMembers (
    group_id INT REFERENCES smartsocial.Groups(group_id),
    user_id INT REFERENCES smartuser.users(id),
    member_since DATE NOT NULL,
    status VARCHAR(100) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- Create Achievements table
CREATE TABLE smartsocial.Achievements (
    achievement_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date_of_receivement DATE NOT NULL
);

-- Create UserAchievements table
CREATE TABLE smartsocial.UserAchievements (
    user_id INT REFERENCES smartuser.users(id),
    achievement_id INT REFERENCES smartsocial.Achievements(achievement_id),
    PRIMARY KEY (user_id, achievement_id)
);

-- Create ProfileSettings table
CREATE TABLE smartsocial.ProfileSettings (
    user_id INT PRIMARY KEY REFERENCES smartuser.users(id),
    profile_visibility VARCHAR(50) NOT NULL,
    notifications_enabled BOOLEAN NOT NULL,
    additional_settings JSONB
);

-- Create Quests table
CREATE TABLE smartsocial.Quests (
    quest_id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    xp_reward INT NOT NULL
);

-- Create UserQuests table
CREATE TABLE smartsocial.UserQuests (
    user_id INT REFERENCES smartuser.users(id),
    quest_id INT REFERENCES smartsocial.Quests(quest_id),
    completion_date DATE NOT NULL,
    PRIMARY KEY (user_id, quest_id)
);

CREATE TABLE SmartSocial.leaderboard (
    userid INT REFERENCES smartuser.users(id),
    kilometers DECIMAL(10, 2) NOT NULL,
    finished_quests INT NOT NULL,
    PRIMARY KEY (userid)
);