create = document.getElementById('create');
login = document.getElementById('login');
pwInput = document.getElementById('PasswordInput');
unInput = document.getElementById('UsernameInput');
usernameElement = document.getElementById('UsernameInput');
passwordElement = document.getElementById('PasswordInput');
create.addEventListener('click', function() {
    console.log(unInput.innerHTML.length);
    if (unInput.value.length > 4) {
        if (pwInput.value.length > 5) {
            checkCredentials('create');
        }
        else {
            window.alert('Enter a password with at least 6 Characters');
            pwInput.value = '';
            return;
        }
    }
    else {
        window.alert('Enter a Username with at least 5 Characters');
        pwInput.value = '';
        return;
    }
});
login.addEventListener('click', function() {
    if (unInput.value.length > 4) {
        if (pwInput.value.length > 5) {
            checkCredentials('login');
        }
        else {
            window.alert('Enter a password with at least 6 Characters');
            pwInput.value = '';
            return;
        }
    }
    else {
        window.alert('Enter a Username with at least 5 Characters');
        pwInput.value = '';
        return;
    }
});

function checkCredentials(objective) {
    username = usernameElement.value
    password = passwordElement.value
    passwordElement.value = '';
    fetch("/submitCredentials", {
        method: "POST",
        credentials: 'include',
        body: JSON.stringify({
            username: username,
            password: password,
            objective: objective
        }),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then((data) => {
        const message = data.message;
        document.getElementById('loginstate').innerHTML = message;
        console.log('Message: '+message);
        if (message == 'Credentials Valid!') {
            getToken();
        }
    })
    .catch((fetchError) => {
        console.error('There was a problem with the fetch operation: ', fetchError);
    });
}
function getToken() {
    fetch('/getLoginToken', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
            username: username
        }),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        else {
            document.getElementById('loginstate').innerHTML = 'Logged in!';
        }
    })
    .catch((fetchError) => {
        console.error('There was a problem with the fetch operation: ', fetchError);
    })
}