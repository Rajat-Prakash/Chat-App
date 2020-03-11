const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

// Templates 
const messageTemplate = document.querySelector('#message-template').innerHTML
const mapsTemplate = document.querySelector('#url-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

$locationButton = document.querySelector('#send-location')

socket.on('message', (message) => {
    // Note: here in message means above es6 arguments we are receiving an object
    // and we need to use text property of it
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('sendLocation', (message) => {
    console.log(message)
    const urlhtml = Mustache.render(mapsTemplate, {
        username: message.username,
        mapsURL: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    }) 
    $messages.insertAdjacentHTML('beforeend', urlhtml)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    // disable
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
    
        $messageFormInput.value = ''
        $messageFormInput.focus()
        // enable
        $messageFormButton.removeAttribute('disabled')

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared!')
            $locationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})