pwHide = document.getElementById('passwordHide');
pwInput = document.getElementById('PasswordInput');
logout = document.getElementById('Logout');

pwHide.addEventListener('click', function() {
    console.log('Clicked');
    togglePassword();
});

function togglePassword() {
    if (pwHide.innerHTML === 'Show') {
        pwHide.innerHTML = 'Hide';
        pwInput.type = 'text';
    }
    else {
        pwHide.innerHTML = 'Show';
        pwInput.type = 'password';
    }
}

logout.addEventListener('click', function() {
    console.log('Clicked the button');
    fetch('/Logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then((data) => {
        const message = data.message;
        console.log(message);
        document.getElementById('loginstate').innerHTML = message;
    })
    .catch((fetchError) => {
        console.error('There was a problem with the fetch operation: ', fetchError);
    });
})