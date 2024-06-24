displayedNodes = new Set();
targetNode = null;
nodeList = [];
arrowList = [];
challenge = false;
API_LIVE = false;
foldedNodes = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetch('https://six-degrees-api.vercel.app/api/football?path=ping')
    .then(response => response.json())
    .then(data => {
        if (data.message === 'pong') {
            API_LIVE = true;
        }
    }).catch(error => console.error('Error fetching ping:', error));
});

function startGameButton() {
    if (!API_LIVE) {
        alert('The Game is currently unavailable. Please try again later.');
        return;
    }
    titleDisplay(false);
    startGame();
}

function explorerChallengerToggle() {
    document.body.classList.toggle('red-theme');
    challenge = !challenge;
}

function titleDisplay(bool) {
    const display = bool ? 'flex' : 'none';
    const titleDiv = document.getElementById('title');
    const buttonContainer = document.getElementById('button-container');
    const checkbox = document.getElementById('checkbox');

    titleDiv.style.display = display;
    buttonContainer.style.display = display;
    checkbox.style.display = display;
}

function startGame() {
    // resetVars();
    if (challenge) {
        fetch('https://six-degrees-api.vercel.app/api/football?path=endpoints')
        .then(response => response.json())
        .then(endpoints => {
            const key = endpoints.source[0];
            fetch(`https://six-degrees-api.vercel.app/api/football?path=neighbors&key=${key}`)
            .then(response => response.json())
            .then(data => {
                displayGame(endpoints.target[1], data.neighbors);
                targetNode = data.target[0];
                spawnNode(data.source[0], data.source[1]);
            }).catch(error => console.error('Error fetching neighbors:', error));
        })
        .catch(error => console.error('Error fetching endpoints:', error));
    } else {
        fetch('https://six-degrees-api.vercel.app/api/football?path=playerlist')
        .then(response => response.json())
        .then(data => {
            // do stuff
        })
        .catch(error => console.error('Error fetching data:', error));
    }
}

function displayGame(target, neighbors) {
    displayLeft(neighbors);
    displayRight();
    if (challenge) {
        displayTarget(target);
    }
}

function displayLeft(neighbors) {
    const searchContainer = document.getElementById('left-side-container');
    const neighborsList = document.getElementById('neighbors-list');
    neighborsList.innerHTML = '';  // Clear previous content
    neighbors.sort((a, b) => {
        return a[1].localeCompare(b[1]);
    });
    neighbors.forEach(neighbor => {
        if (!displayedNodes.has(neighbor[0])) {
            const listItem = document.createElement('li');
            listItem.textContent = neighbor[1]; // Assuming neighbor[1] is the display name
            listItem.id = neighbor[0]; // Assuming neighbor[0] is the ID
            listItem.addEventListener('click', () => handleNeighborClick(neighbor[0], neighbor[1]));
            neighborsList.appendChild(listItem);
        }
    });
    searchContainer.style.display = 'flex';
}

function displayRight() {
    const rightSideContainer = document.getElementById('right-side-container');
    const infoText = document.getElementById('info-text');
    if (challenge) {
        infoText.textContent = 'Start your journey by selecting a teammate from the list of neighbors. Each selection will reveal new connections, helping you navigate through the football network to reach the target player. The goal? To see if you can to connect two players in 6 clicks or less. Happy exploring!';
    } else {
        infoText.textContent = 'Begin your exploration by selecting a teammate from the list of neighbors. Each selection will uncover new connections, allowing you to freely navigate through the football network without any target. Click as many times as you like and enjoy discovering the web of player connections. Happy exploring!';
    }
    rightSideContainer.style.display = 'flex';
}

function displayTarget(target) {
    const targetDisplay = document.getElementById('target-display');
    targetDisplay.textContent = `Target: ${target}`;
    targetDisplay.style.display = 'flex';
}

function handleNeighborClick(id, name) {
    const neighborsList = document.getElementById('neighbors-list');
    neighborsList.innerHTML = '';  // Clear previous content
    //spawnNode(id, name);
    if (targetNode === id) {
        // Win
        return;
    } else if (displayedNodes.length >= 7) {
        // Lose
        return;
    }
    fetch(`https://six-degrees-api.vercel.app/api/football?path=neighbors&key=${id}`)
    .then(response => response.json())
    .then(data => {
        displayLeft(data.neighbors);
    })
    .catch(error => console.error('Error fetching neighbors:', error));
}
