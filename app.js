const http = require('http');
const express = require('express');
const app = express();
const socketIo = require('socket.io');
const path = require('path');

const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));

// Serve homepage
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('✅ A user connected:', socket.id);

    // Handle receiving location from this client
    socket.on('send-location', (data) => {
        console.log('📍 Location received from:', socket.id, data);

        // Broadcast to all clients (including sender)
        io.emit('received-location', {
            id: socket.id,
            latitude: data.latitude,
            longitude: data.longitude
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

// Start server
server.listen(3000, () => {
    console.log('🚀 Server is running on port 3000');
});
