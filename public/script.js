const socket = io()

// Get name, chat_uuid, user_uuid and room from URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const name = urlParams.get('name')
const chat_uuid = urlParams.get('chat_uuid')
const user_uuid = urlParams.get('user_uuid')
const room = urlParams.get('room')

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const typing = document.getElementById('typing')

var keypressed_timestamped = ''

appendMessage(`${name} joined`)
//post_message_data(`(${name} connected, ${Math.floor(new Date().getTime() / 1000)})`)
socket.emit('new-user', {name, chat_uuid, room})

//Message received with recipient name
socket.on('chat-message', data => {
  typing.innerHTML = ''
  appendMessage(`${data.name}: ${data.message}`)
})

//Shows when other people connect
socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

//Shows when other people disconnect
socket.on('user-disconnected', name => {
  //post_message_data(`(${name} disconnected, ${Math.floor(new Date().getTime() / 1000)})`)
  appendMessage(`${name} disconnected`)
})

socket.on('typing', data => {
  if (data.message.length == 0 || room == 0){ //No indicator
     typing.innerHTML = ''
   }
  else { //Is-typing indicator
    if (room == 1){
      typing.innerHTML = '<p>' + data.name + ' is typing...</p>'
    }
    else if (room == 2){ //Live typing
      typing.innerHTML = `<p>${data.name}: ${data.message}...</p>`
    }
    else if (room == 3){ //Masked typing
      typing.innerHTML = `<p>${data.name}: ${data.message.replace(/\S/g, "#")}...</p>`
    }
  }
})

//Message sent by sender - call API 
messageForm.addEventListener('submit', e => {
  e.preventDefault()

  //post_message_data(keypressed_timestamped)
  keypressed_timestamped = ''
  
  const message = messageInput.value
  appendMessage(`${name}: ${message}`)
  socket.emit('send-chat-message', message)
  typing.innerHTML = ''
  messageInput.value = ''
})

messageInput.addEventListener('input', function(e){
  socket.emit('typing', messageInput.value)
})

//Keys pressed by the sender - concatenate keys/events 
messageInput.addEventListener('keyup', function(e){
  keypressed_timestamped += `(${e.key}, ${Math.floor(new Date().getTime() / 1000)})`
  //appendMessage(keypressed_timestamped)
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}