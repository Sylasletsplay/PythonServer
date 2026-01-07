refresh = document.getElementById('refresh_button');
refresh.addEventListener('click', function(){
    fetch('getGraph', {
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
        console.log(Object.keys(data).length);
    })
    .catch((fetchError) => {
        console.error('There was a problem with the fetch operation: ', fetchError);
    });
});