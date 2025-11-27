function fetchJSONData() {
    fetch('/data/scores')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            data.forEach((entry, index) => {
                let scoreId = "score" + (index + 1);
                let userId = "user" + (index + 1);
                let timeId = "time" + (index + 1);
                let scoreElement = document.getElementById(scoreId);
                let userElement = document.getElementById(userId);
                let timeElement = document.getElementById(timeId);
                let username = entry.username;
                let score = entry.score;
                let time = entry.time;

                scoreElement.innerHTML = score;
                userElement.innerHTML = username;
                timeElement.innerHTML = time+' Sec';
            });
        })
        .catch(error => console.error('Failed to fetch data:', error));
}
fetchJSONData();