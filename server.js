require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const shortId = require('shortid');
const URL = require("url").URL;
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error'));
connection.once('open', () => {
  console.log('database connection successful');
})

const urlShema = new mongoose.Schema({
  original_url: String,
  short_url: String
})

const UrlModel = mongoose.model('UrlModel', urlShema);

app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  const shorturl = shortId.generate();

  // const isAValidUrl = (s) => {
  //   try {
  //     new URL(s);
  //     return true;
  //   } catch (err) {
  //     return false;
  //   }
  // };
  // console.log(isAValidUrl(url));
  // console.log(!isAValidUrl(url));

  const httpRegex = /^(http|https)(:\/\/)/;

  if(!httpRegex.test(originalURL)) {
    console.log(url);
    return res.json({
      error: 'invalid url'
    })
  }
  else {
    try {
      console.log('hello');
      let findOne = await UrlModel.findOne({ original_url: url });
      console.log(findOne);
      if(findOne) {
      console.log('already exists');
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        })
      }
      else {
       findOne = new UrlModel({
          original_url: url,
          short_url: shorturl
        })
        await findOne.save();
        console.log('created new');
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        })
      }
    } catch (error) {
        console.log(error);
        res.status(500).json('Server error...');
    }
  }
})

app.get('/api/shorturl/:short_url?', async (req, res) => {
  try {
    const urlParams = await UrlModel.findOne({ short_url: req.params.short_url });
    console.log(urlParams);
    if(urlParams) {
      return res.redirect(urlParams.original_url)
    } else {
      res.status(404).json('No URL Found');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json('Server error...')
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
