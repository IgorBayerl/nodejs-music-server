import express from 'express'
import ytdl from 'ytdl-core'
import YouTube from 'youtube-sr'
import cors from 'cors'

import { playlist_mock } from './playlist_mock.js'


const app = express()
app.use(cors())

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})


app.get('/music/play', (req, res) => {
  const response = {}
  try {
    const videoId = req.query.v
    if (!videoId) throw new Error('No id')

    const url = 'https://www.youtube.com/watch?v=' + videoId

    ytdl(url, {
      format: 'mp3',
      filter: 'audioonly',
    }).pipe(res)
  } catch (error) {
    response.message = error.message
    res.json(response).status(500)
  }
})

app.get('/music/info', async (req, res) => {
  const response = {}
  try {
    const videoId = req.query.v
    if (!videoId) throw new Error('No id')

    const url = 'https://www.youtube.com/watch?v=' + videoId

    const videoInfo = await ytdl.getInfo(url)

    response.id = videoInfo.videoDetails.videoId
    response.title = videoInfo.videoDetails.title
    response.thumbnail = videoInfo.videoDetails.thumbnails[0].url
    response.duration = videoInfo.videoDetails.lengthSeconds
    response.url = videoInfo.videoDetails.video_url
    response.channel = {}
    response.channel.name = videoInfo.videoDetails.author.name
    response.channel.url = videoInfo.videoDetails.author.user_url
    response.channel.avatar = videoInfo.videoDetails.author.thumbnails[0].url

    res.json(response)
    
  } catch (error) {
    response.message = error.message
    res.json(response).status(500)
  }
})


app.get('/search', async (req, res) => {
  const response = {};
  try {
    const query = req.query.query;
    const maxResults = parseInt(req.query.maxResults) || 10;
    const searchResults = await YouTube.search(query, { limit: maxResults });

    res.json(searchResults);
  } catch (error) {
    response.message = error.message;
    res.status(500).json(response);
  }
});

app.get('/suggest', async (req, res) => {
  const response = {};
  try {
    const query = req.query.query;
    const suggestions = await YouTube.getSuggestions(query);

    res.json(suggestions);
  } catch (error) {
    response.message = error.message;
    res.status(500).json(response);
  }
});

app.get('/playlist', async (req, res) => {
  const response = {};
  try {
    const playlist = playlist_mock;

    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;

    const offset = (page - 1) * pageSize;

    const paginatedPlaylist = playlist.slice(offset, offset + pageSize);
    const results = {
      hasNextPage: offset + pageSize < playlist.length,
      total: playlist.length,
      pageSize,
      page,
      pages: Math.ceil(playlist.length / pageSize),
      playlist: paginatedPlaylist,
    }

    res.json(results);
  } catch (error) {
    response.message = error.message;
    res.status(500).json(response);
  }
});