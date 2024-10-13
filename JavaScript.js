const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Ön uç dosyalarımız burada
app.use(express.static('public'));

// Bağlantılar için ana olay dinleyici
io.on('connection', (socket) => {
    console.log('Kullanıcı bağlandı: ', socket.id);

    // Odaya katılma isteği
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} numaralı kullanıcı ${roomId} odasına katıldı`);
        
        // Odaya katılan tüm kullanıcılara bildirim gönder
        socket.to(roomId).emit('user-joined', { userId: socket.id, roomId });
    });

    // WebRTC sinyali
    socket.on('signal', (data) => {
        // Sinyali diğer istemcilere ilet
        socket.to(data.room).emit('signal', {
            signal: data.signal,
            userId: socket.id // Kullanıcının kimliği
        });
    });

    // Bağlantıdan ayrılma olayı
    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı: ', socket.id);
        
        // Oda üyelerine bildirim gönder
        const rooms = Object.keys(socket.rooms);
        rooms.forEach((room) => {
            socket.to(room).emit('user-left', { userId: socket.id });
        });
    });
});

// Sunucunun çalıştığını bildiren mesaj
const PORT = process.env.PORT || 3000; // Çevresel değişken kullanarak port
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} numaralı portta çalışıyor. Yerel ağdaki IP adresi: http://[YOUR_LOCAL_IP]:${PORT}`);
});
