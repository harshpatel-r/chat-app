const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector("#input");
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages')

//Templates
const messageTemplateSender = document.querySelector('#message-templates-sender').innerHTML;
const messageTemplate = document.querySelector('#message-templates').innerHTML;
const locationMessageTemplateSender = document.querySelector('#location-message-templates-sender').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-templates').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on("sendme", (message) => {
    const html = Mustache.render(messageTemplateSender,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
})

socket.on("message" , (message) => {
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
});

socket.on("sendMeLocation", (message) => {
    const html = Mustache.render(locationMessageTemplateSender,{
        username : message.username, 
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("locationMessage", (message) => {
    const html = Mustache.render(locationMessageTemplate,{
        username : message.username, 
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})


socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');  

    const message = e.target.elements.message.value;
    socket.emit("sendMessage", message, (error) => {
        
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error){
            return alert(error);
        }

    });
})

$sendLocationButton.addEventListener("click", () => {
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser");
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude : position.coords.latitude , 
            longitude : position.coords.longitude
        }
       

        socket.emit("sendLocation", location, () => {
            $sendLocationButton.removeAttribute('disabled');
        });
    })
})

socket.emi