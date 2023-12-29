// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const openai = require('openai');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Handle MongoDB connection errors
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// OpenAI API configuration
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = new openai.OpenAIAPI({ key: openaiApiKey });

// Body parser middleware
app.use(bodyParser.json());

// Socket.io event handling
io.on('connection', (socket) => {
  console.log('User connected');

  // Handle incoming messages
  socket.on('message', (data) => {
    // Save the message to MongoDB for chat history
    const message = new ChatMessage({ content: data.message });
    message.save();

    // Perform text-to-speech with OpenAI API
    openaiClient.create('text-davinci-003', {
      prompt: Say: ${data.message},
      max_tokens: 50,
      temperature: 0.7,
    })
      .then((response) => {
        const audioData = response.choices[0].audio;
        // Broadcast the audio data to all connected clients
        io.emit('audio', { audio: audioData });
      })
      .catch((error) => {
        console.error('OpenAI Text-to-Speech Error:', error);
      });
  });

  // Handle speech-to-text
  socket.on('audio', (data) => {
    // Use OpenAI API for speech-to-text creatively
    // This is not a direct feature of GPT-3, so the implementation might be limited
    const textData = "This is an example response from OpenAI for speech-to-text.";
    
    // Broadcast the text to all connected clients
    io.emit('message', { message: textData });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Define MongoDB model for chat messages
const ChatMessage = mongoose.model('ChatMessage', {
  content: String,
  timestamp: { type: Date, default: Date.now },
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server is running on port ${PORT}");
});