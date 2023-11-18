-- Assuming both 'smartuser' and 'smartsocial' are schemas in the same database

-- Create the 'groups' table in the 'smartsocial' schema
CREATE TABLE smartsocial.groups (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    join_date DATE
);

-- Create the 'group_members' table in the 'smartsocial' schema
CREATE TABLE smartsocial.group_members (
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES smartsocial.groups(group_id),
    FOREIGN KEY (user_id) REFERENCES smartuser.user(id),
    PRIMARY KEY (group_id, user_id)
);

-- Create the 'achievements' table in the 'smartsocial' schema
CREATE TABLE smartsocial.achievements (
    achievement_id SERIAL PRIMARY KEY,
    creation_date DATE NOT NULL,
    description TEXT
);

-- Create the 'user_achievements' table in the 'smartsocial' schema
CREATE TABLE smartsocial.user_achievements (
    user_achievement_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES smartuser.user(id),
    FOREIGN KEY (achievement_id) REFERENCES smartsocial.achievements(achievement_id)
);

-- Create the 'profile_settings' table in the 'smartsocial' schema
CREATE TABLE smartsocial.profile_settings (
    setting_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    profile_visibility BOOLEAN,
    notifications BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES smartuser.user(id)
);

