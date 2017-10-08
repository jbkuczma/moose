# moose
UB CSE 442 project. Moose is a web app that allows users to stream music together effortlessly.

A user can create a room, becoming that room's host, and share the associated room code with their friends. Once in a room, a user can search for and add music to the room's queue which is played through the host's device. A room will close if there is no song being played and the queue is empty or if the host chooses to close the room. 

# Prerequisites
**Important**

Before running, please ensure that Node.JS (we have been developing with v8.5.0) and MYSQL are installed on your machine. Our development and testing were performed primarily on macOS Sierra, but the following instructions should work for any *nix system.

You will also need a YouTube search API key to make requests. You can register for an API key [here.](https://console.developers.google.com/apis/credentials) Once on the Google APIs page, click the "Create Credentials" button and select "API key". 

**Once you have a cloned repo come back to this step** 

Edit the following line in server/example.keys.js:

        const my_key = 'YOUR API KEY';

so that it contains the API key you just created. Then rename this file from **example.keys.js** to **keys.js**

# Installation and Running
1) Download a zip of the repo from GitHub or clone the repo

        git clone https://github.com/jbkuczma/moose.git

2) Move into the project directory

        cd moose

3) Install dependencies for Moose

        npm install

4) Run the shell script to setup the testing database

        sh create_clean_db.sh [root_username] moose

        * You will need to provide a root database user and its password when prompted for the script to work
        * 1 user will be created
                * User: test.1
                * Password: test.1
        * 1 room will be created
                * Room name: SaturdaysAreForTheBoys
                * Room Code: 4444  

5) Start Moose

        npm start

You should see the following prompt:

        Moose started on port 3000
        Visit localhost:3000/login or [Your IP Address]:3000/login

**The following routes can be visited after following the above steps:**

         localhost:3000/login
         localhost:3000/rooms
         localhost:3000/room/[A Room Code]

**Note**

There will be a slight delay on the room host's screen from when a user joins a room to them showing up in the "Users in room" area. There will also be a slight delay when selecting a song and having it show up in the queue. Rapidly adding songs to the queue may cause server overload which will then need to be restarted, forcing everyone to have to login again - be generous. 
