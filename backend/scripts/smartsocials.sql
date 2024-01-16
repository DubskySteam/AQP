-- smartsocial.achievements definition

-- Drop table

-- DROP TABLE smartsocial.achievements;

CREATE TABLE smartsocial.achievements (
	achievement_id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	description text NULL,
	CONSTRAINT achievements_pkey PRIMARY KEY (achievement_id)
);


-- smartsocial.quests definition

-- Drop table

-- DROP TABLE smartsocial.quests;

CREATE TABLE smartsocial.quests (
	quest_id serial4 NOT NULL,
	description text NOT NULL,
	xp_reward int4 NOT NULL,
	"type" varchar NULL,
	amount int4 NULL,
	title varchar NULL,
	CONSTRAINT quests_pkey PRIMARY KEY (quest_id)
);


-- smartsocial.groupmembers definition

-- Drop table

-- DROP TABLE smartsocial.groupmembers;

CREATE TABLE smartsocial.groupmembers (
	group_id int4 NOT NULL,
	user_id int4 NOT NULL,
	member_since date NOT NULL,
	status varchar(100) NOT NULL,
	CONSTRAINT groupmembers_pkey PRIMARY KEY (group_id, user_id)
);


-- smartsocial."groups" definition

-- Drop table

-- DROP TABLE smartsocial."groups";

CREATE TABLE smartsocial."groups" (
	group_id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	creation_date date NOT NULL,
	admin_user_id int4 NULL,
	description text NULL,
	image varchar NULL,
	code varchar NULL,
	CONSTRAINT groups_pkey PRIMARY KEY (group_id)
);


-- smartsocial.leaderboard definition

-- Drop table

-- DROP TABLE smartsocial.leaderboard;

CREATE TABLE smartsocial.leaderboard (
	userid int4 NOT NULL,
	kilometers numeric(10, 2) NOT NULL,
	finished_quests int4 NOT NULL,
	CONSTRAINT leaderboard_pkey PRIMARY KEY (userid)
);


-- smartsocial.profilesettings definition

-- Drop table

-- DROP TABLE smartsocial.profilesettings;

CREATE TABLE smartsocial.profilesettings (
	user_id int4 NOT NULL,
	profile_visibility varchar(50) NOT NULL,
	notifications_enabled bool NOT NULL,
	additional_settings jsonb NULL,
	picture varchar NULL,
	device varchar NULL,
	CONSTRAINT profilesettings_pkey PRIMARY KEY (user_id)
);


-- smartsocial.userachievements definition

-- Drop table

-- DROP TABLE smartsocial.userachievements;

CREATE TABLE smartsocial.userachievements (
	user_id int4 NOT NULL,
	achievement_id int4 NOT NULL,
	CONSTRAINT userachievements_pkey PRIMARY KEY (user_id, achievement_id)
);


-- smartsocial.userquests definition

-- Drop table

-- DROP TABLE smartsocial.userquests;

CREATE TABLE smartsocial.userquests (
	user_id int4 NOT NULL,
	quest_id int4 NOT NULL,
	completion_date date NULL,
	CONSTRAINT userquests_pkey PRIMARY KEY (user_id, quest_id)
);


-- smartsocial.groupmembers foreign keys

ALTER TABLE smartsocial.groupmembers ADD CONSTRAINT groupmembers_group_id_fkey FOREIGN KEY (group_id) REFERENCES smartsocial."groups"(group_id);
ALTER TABLE smartsocial.groupmembers ADD CONSTRAINT groupmembers_user_id_fkey FOREIGN KEY (user_id) REFERENCES smartuser.users(id);


-- smartsocial."groups" foreign keys

ALTER TABLE smartsocial."groups" ADD CONSTRAINT groups_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES smartuser.users(id);


-- smartsocial.leaderboard foreign keys

ALTER TABLE smartsocial.leaderboard ADD CONSTRAINT leaderboard_userid_fkey FOREIGN KEY (userid) REFERENCES smartuser.users(id);


-- smartsocial.profilesettings foreign keys

ALTER TABLE smartsocial.profilesettings ADD CONSTRAINT profilesettings_user_id_fkey FOREIGN KEY (user_id) REFERENCES smartuser.users(id);


-- smartsocial.userachievements foreign keys

ALTER TABLE smartsocial.userachievements ADD CONSTRAINT userachievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES smartsocial.achievements(achievement_id);
ALTER TABLE smartsocial.userachievements ADD CONSTRAINT userachievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES smartuser.users(id);


-- smartsocial.userquests foreign keys

ALTER TABLE smartsocial.userquests ADD CONSTRAINT userquests_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES smartsocial.quests(quest_id);
ALTER TABLE smartsocial.userquests ADD CONSTRAINT userquests_user_id_fkey FOREIGN KEY (user_id) REFERENCES smartuser.users(id);
