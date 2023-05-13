const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-templates').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-templates').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true});

socket.on("message" , (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
});

socket.on("locationMessage", (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate,{
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML("beforeend", html)
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
            return console.log(error);
        }

        console.log("message delivered!");
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
            console.log('location shared!');
        });
    })
})

socket.emit("join", {username, room}, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
});