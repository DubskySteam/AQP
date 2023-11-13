-- Create the schema
CREATE SCHEMA smartsocials;

-- Create user_profiles table
CREATE TABLE smartsocials.user_profiles (
    user_id INT PRIMARY KEY,
    display_name VARCHAR(255),
    gender VARCHAR(50)
);

-- Create account_settings table
CREATE TABLE smartsocials.account_settings (
    user_id INT PRIMARY KEY,
    profile_privacy BOOLEAN,
    notifications BOOLEAN
);

-- Create user_stats table
CREATE TABLE smartsocials.user_stats (
    user_id INT PRIMARY KEY,
    total_mileage NUMERIC,
    weekly_mileage NUMERIC,
    level INT,
    exp_points INT
);

-- Create user_achievements table
CREATE TABLE smartsocials.user_achievements (
    achievement_id SERIAL PRIMARY KEY,
    user_id INT,
    achievement VARCHAR(255),
    date_achieved DATE,
    FOREIGN KEY (user_id) REFERENCES smartsocials.user_profiles(user_id)
);

-- Create social_groups table
CREATE TABLE smartsocials.social_groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP
);

-- Create group_members table
CREATE TABLE smartsocials.group_members (
    group_id INT,
    user_id INT,
    joined_at TIMESTAMP,
    role VARCHAR(255),
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES smartsocials.social_groups(group_id),
    FOREIGN KEY (user_id) REFERENCES smartsocials.user_profiles(user_id)
);

