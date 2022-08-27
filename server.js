const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { getActiveUser, exitRoom, newUser, getIndividualRoomUsers} = require('./utils/userObject');

const { post_event_message } = require('./apis/post_event');
const { list_messages } = require('./apis/get_messages');

app.use(express.static('public'));

app.get('/', (req, res) => { res.sendFile(__dirname + '/public/chat.html');});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => { console.log(`listening on port ${PORT}`);});


io.on('connection', socket => {
  socket.on('new-user', ({name, chat_uuid, user_uuid, room}) => {
    const user = newUser(socket.id, name, chat_uuid, user_uuid, room);    
    socket.join(user.room + user.chat_uuid);
    socket.to(user.room + user.chat_uuid).emit('user-connected', user.name);
    
    //post_event_message(chat_uuid, user_uuid, name, room, 
    //  `[${name} connected: ${Math.floor(new Date().getTime() / 1000)}]`, false));
    
    //if messages for the said chat ID exists -> show the messages!
    //loop it out and keep calling chat-message!!
    var obj = list_messages(chat_uuid);
    //example(() => {});
    console.log(obj)
    
    
    // Converting JSON-encoded string to JS object
    // var obj = JSON.parse(json); 
    // var size = Object.keys(obj.data).length;
    // for (let i = 0; i < size; i++) { 
    //   document.write(obj.data[i].attributes.senderName + ": ");
    //   document.write(obj.data[i].attributes.messageText + "<br>");
    // }
  })
  
  socket.on('send-chat-message', message => {
    const user = getActiveUser(socket.id);
    socket.to(user.room + user.chat_uuid).emit('chat-message', { message: message.text, name: user.name });
    
    //post_event_message(user.chat_uuid, user.user_uuid, user.name, user.room, 
    //  `[${message.keys_timestamped}: ${Math.floor(new Date().getTime() / 1000)}]`, false);
    
    //post_event_message(user.chat_uuid, user.user_uuid, user.name, user.room, message.text, true);
  })
  
  socket.on('disconnect', () => {
    const user = getActiveUser(socket.id);
    //socket.to(user.room + user.chat_uuid).emit('user-disconnected', user.name);
    
    //post_event_message(user.chat_uuid, user.user_uuid, user.name, user.room, 
    //  `[${user.name} disconnected: ${Math.floor(new Date().getTime() / 1000)}]`, false);
    exitRoom(socket.id);
  })
  
  socket.on('typing', message => {
    const user = getActiveUser(socket.id);
    socket.to(user.room + user.chat_uuid).emit('typing', { message: message, name: user.name });
  })
})