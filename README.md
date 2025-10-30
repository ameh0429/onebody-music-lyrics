# Onebody Music Lyrics

```
onebody-music-lyrics/
├── package.json
├── .env
├── .gitignore
├── app.js
├── config/
│   └── database.js
├── models/
│   ├── index.js
│   ├── Artiste.js
│   ├── Album.js
│   └── Song.js
├── controllers/
│   ├── artisteController.js
│   ├── albumController.js
│   └── songController.js
├── routes/
│   ├── artisteRoutes.js
│   ├── albumRoutes.js
│   └── songRoutes.js
└── middleware/
    └── errorHandler.js
```

## Installation

```bash
npm init -y
npm install express sequelize pg pg-hstore dotenv
npm install --save-dev nodemon
```

## Setup Instructions

1. Create PostgreSQL database named `onebody_music_lyrics`
2. Configure `.env` file with database credentials
3. Run `npm start` to start the server
4. The database tables will be created automatically

## API Endpoints

### Artistes
- `POST /api/artistes` - Create artiste
- `GET /api/artistes` - Get all artistes
- `GET /api/artistes/:id` - Get artiste by ID
- `PUT /api/artistes/:id` - Update artiste
- `DELETE /api/artistes/:id` - Delete artiste

### Albums
- `POST /api/albums` - Create album
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get album by ID (includes artiste info and all songs)
- `PUT /api/albums/:id` - Update album
- `DELETE /api/albums/:id` - Delete album

### Songs
- `POST /api/songs` - Create song
- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get song by ID
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song