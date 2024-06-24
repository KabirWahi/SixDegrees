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
    if (challenge) {
        fetch('https://six-degrees-api.vercel.app/api/football?path=endpoints')
        .then(response => response.json())
        .then(endpoints => {
            const key = endpoints.source[0];
            fetch(`https://six-degrees-api.vercel.app/api/football?path=neighbors&key=${key}`)
            .then(response => response.json())
            .then(data => {
                displayGame(endpoints.target[1], data.neighbors);
                targetNode = endpoints.target[0];
                spawnNode(endpoints.source[0], endpoints.source[1]);
            }).catch(error => console.error('Error fetching neighbors:', error));
        })
        .catch(error => console.error('Error fetching endpoints:', error));
    } else {
        fetch('https://six-degrees-api.vercel.app/api/football?path=playerlist')
        .then(response => response.json())
        .then(data => {
            displayExplorerGame(data);
        })
        .catch(error => console.error('Error fetching data:', error));
    }
}

function displayGame(target, neighbors) {
    displayLeft(neighbors);
    displayRight();
    displayTarget(target);
}

function displayExplorerGame(players) {
    const searchContainer = document.getElementById('left-side-container');
    const neighborsList = document.getElementById('neighbors-list');
    neighborsList.innerHTML = '';  // Clear previous content
    Object.entries(players)
        .sort((a, b) => a[1].localeCompare(b[1]))
        .forEach(([id, name]) => {
            const listItem = document.createElement('li');
            listItem.textContent = name;
            listItem.id = id;
            listItem.addEventListener('click', () => handleSourceClick(id, name));
            neighborsList.appendChild(listItem);
        });
    displayRight();
    searchContainer.style.display = 'flex';
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
    const search = document.getElementById('search-input');
    search.value = '';
    if (!challenge) {
        if (nodeList.length > 6 && nodeList.length % 6 === 1) {
            nodeList.splice(1, 7).forEach(nodeId => {
                const node = document.getElementById(nodeId);
                document.body.removeChild(node);
                foldedNodes += 1;
            });
            arrowList.forEach(arrowId => {
                const arrow = document.getElementById(arrowId);
                document.body.removeChild(arrow);
            });
            arrowList = [];
        }
    }
    spawnNode(id, name);
    if (challenge) {
        if (id === targetNode) {
            const message = document.createElement('h1');
            message.textContent = 'You Win!';
            message.position = 'absolute';
            message.style.marginTop = '4vw';
            message.style.padding = '2vw';
            neighborsList.appendChild(message);
            const restartButton = document.createElement('button');
            restartButton.textContent = 'Restart';
            restartButton.className = 'button';
            restartButton.addEventListener('click', () => {
                restartGame();
            });
            neighborsList.appendChild(restartButton);
            return;
        } else if (nodeList.length >= 7) {
            const message = document.createElement('h1');
            message.textContent = 'You Lose!';
            message.position = 'absolute';
            message.style.marginTop = '4vw';
            message.style.padding = '2vw';
            neighborsList.appendChild(message);
            const restartButton = document.createElement('button');
            restartButton.textContent = 'Restart';
            restartButton.className = 'button';
            restartButton.addEventListener('click', () => {
                restartGame();
            });
            neighborsList.appendChild(restartButton);
            return;
        }
    }
    if (foldedNodes > 0) {
        console.log('foldedNodes:', foldedNodes);
        let foldCount = document.getElementById('fold-count');
        if (foldCount == null) {
            foldCount = document.createElement('h1');
            foldCount.id = 'fold-count';
            foldCount.style.position = 'absolute';
            foldCount.style.top = '12%';
            foldCount.style.left = '60%';
            foldCount.style.fontSize = '3vw';
            foldCount.style.zIndex = '10';
            document.body.appendChild(foldCount);
        }
        foldCount.textContent = `+${foldedNodes} nodes`;
    }
    fetch(`https://six-degrees-api.vercel.app/api/football?path=neighbors&key=${id}`)
    .then(response => response.json())
    .then(data => {
        displayLeft(data.neighbors);
    })
    .catch(error => console.error('Error fetching neighbors:', error));
}

function handleSourceClick(id, name) {
    const resetButton = document.getElementById('reset-button');
    resetButton.style.display = 'flex';
    handleNeighborClick(id, name);
}


function spawnNode(id, name) {
    const node = document.createElement('h1');
    node.className = 'node';
    node.id = 'node-' + id;
    node.textContent = name;
    node.style.top = `${5 + (nodeList.length) * 12.5}%`; // Adjust the vertical position based on the number of nodes
    document.body.appendChild(node);
    displayedNodes.add(id);
    nodeList.push('node-' + id);
    if (nodeList.length > 1) {
        drawArrow(nodeList.length - 2);
    }
}

function drawArrow(fromIndex) {
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.id = `arrow-${arrowList.length}`;
    arrow.style.position = 'absolute';
    arrow.style.top = `${12 + fromIndex * 12.5}%`; // Position the arrow between the two nodes
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.innerHTML = '&darr;'; // Downward arrow symbol
    document.body.appendChild(arrow);
    arrowList.push(arrow.id);
}

function resetVars() {
    const neighborsList = document.getElementById('neighbors-list');
    neighborsList.innerHTML = '';
    nodeList.forEach(id => {
        const node = document.getElementById(id);
        console.log('node:', node);
        document.body.removeChild(node);
    });
    arrowList.forEach(id => {
        const arrow = document.getElementById(id);
        document.body.removeChild(arrow);
    });
    displayedNodes.clear();
    targetNode = null;
    nodeList = [];
    arrowList = [];
    foldedNodes = 0;
    const foldCount = document.getElementById('fold-count');
    if (foldCount != null) {
        foldCount.parentNode.removeChild(foldCount);
    }
    const resetButton = document.getElementById('reset-button');
    resetButton.style.display = 'none';
}

function restartGame() {
    resetVars();
    startGame();
}

function backToTitle() {
    resetVars();
    notDisplayGame();
    titleDisplay(true);
}

function notDisplayGame() {
    const searchContainer = document.getElementById('left-side-container');
    const rightSideContainer = document.getElementById('right-side-container');
    const targetDisplay = document.getElementById('target-display');
    searchContainer.style.display = 'none';
    rightSideContainer.style.display = 'none';
    targetDisplay.style.display = 'none';
}

function filterPlayer() {
    const input = document.getElementById('search-input');
    const filter = input.value.toUpperCase();
    const neighborsList = document.getElementById('neighbors-list');
    const neighbors = neighborsList.getElementsByTagName('li');
    for (let i = 0; i < neighbors.length; i++) {
        const name = neighbors[i].textContent;
        const normalizedFilter = normalizeString(filter);
        const normalizedName = normalizeString(name);
        if (normalizedName.includes(normalizedFilter)) {
            neighbors[i].style.display = '';
        } else {
            neighbors[i].style.display = 'none';
        }
    }
}

function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}