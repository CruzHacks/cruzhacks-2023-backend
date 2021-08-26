const express = require("express");
const cors = require("cors");

const announcements = express();
const corsOptions = {
  origin: corsConfig,
  optionsSuccessStatus: 200,
};

announcements.use(cors(corsOptions));
announcements.use(express.json());

// announcements.post('/')
// announcements.delete('/:id')
// announcements.get('/')

module.exports = { announcements };
