#!/bin/bash
#
# Script to create a fresh moose database
#
# @author James Kuczmarski
#
# @usage sh create_clean_db.sh [root_username] [db_name]
#

USER=$1;
DB=$2;

if [ $# -eq 2 ]
	then
mysql -u ${USER} -p << SQL
	DROP DATABASE IF EXISTS ${DB};
	CREATE DATABASE IF NOT EXISTS ${DB};
	USE ${DB};
	CREATE TABLE IF NOT EXISTS users (
		user_id INT NOT NULL AUTO_INCREMENT,
       	username VARCHAR(16) NOT NULL,
       	password TEXT NOT NULL,
       	salt VARCHAR(16) NOT NULL,
       	created_at TEXT,
       	current_room VARCHAR(5),
       	PRIMARY KEY (user_id)
	);
	CREATE TABLE IF NOT EXISTS rooms (
		room_name VARCHAR(22) NOT NULL,
		room_code VARCHAR(5) NOT NULL,
		created_at TEXT,
		room_owner_name VARCHAR(16) NOT NULL,
		PRIMARY KEY (room_code)
	);
	CREATE TABLE IF NOT EXISTS music (
		youtube_id TEXT NOT NULL,
		room_code VARCHAR(5) NOT NULL,
		rank_in_queue INT NOT NULL AUTO_INCREMENT,
		song_name TEXT NOT NULL,
		PRIMARY KEY (rank_in_queue)
	);
	INSERT INTO users (username, password, salt, created_at, current_room) VALUES ('test.1', 'f6537d74a07a61d7a7524e4f5d4070a3fffcdf51c72c6ee22792fd21d76aca388c08abab492790f91879731c427b1653f91e484386b951b61e1783a61732eeaf', '5fc0f38ea20272f8', NOW(), NULL);
	INSERT INTO rooms (room_name, room_code, created_at, room_owner_name) VALUES ('SaturdaysAreForTheBoys', '4444', NOW(), 'test.1');
	INSERT INTO music (youtube_id, room_code, song_name) VALUES ('Kp7eSUU9oy8', '4444', '3005');
SQL
	echo "Finished creating database ${DB}";
	else
		echo "syntax: sh db.sh [root_username] [db_name]";
		exit 1;
fi

#
# creates 1 user
# user: test.1
# pass: test.1
#
# creates 1 room
# name: SaturdaysAreForTheBoys
# code: 4444
#