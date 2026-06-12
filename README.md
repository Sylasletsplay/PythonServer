# PythonServer

A web server built with Python and JavaScript during an apprenticeship. Features a game with user authentication, leaderboards, and a shop system.

## Features

- **User Authentication**: Create accounts and login with secure password hashing (bcrypt)
- **Bullet Hell Game**: Interactive browser-based bullet hell game
- **Leaderboard**: Track and display player scores and playtime
- **Shop System**: Randomized shop with weapons, stat upgrades, and items
- **Dashboard**: View gameplay statistics and analytics
- **HTTPS Support**: Secure connections with SSL/TLS

## Pages

- **Home** (`/`) - Main landing page with links to game and features
- **Game** (`/bullethell`) - The bullet hell game
- **Account** (`/Account`) - Login/registration page
- **Leaderboard** (`/Leaderboard`) - View player scores
- **Dashboard** (`/Dashboard`) - View website statistics

## Tech Stack

- **Backend**: Python (SSL socket server, authentication)
- **Frontend**: HTML, CSS, JavaScript
- **Security**: bcrypt password hashing, HMAC-SHA256 token signing
- **Communication**: HTTPS, WebSocket support

## Requirements

- Python 3.x
- SSL certificates (server.cert, server.key)
- Dependencies: bcrypt

## Setup

1. Generate SSL certificates for HTTPS
2. Create a config file with your server key
3. Place certificate files in the `NewWebsite` directory
4. Run the server: `python NewWebsite/mainserver.py`

## License

MIT License - See LICENSE file for details
