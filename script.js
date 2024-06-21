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
    
    const button = document.querySelector('.button');

    button.addEventListener('click', () => {
        if (!API_LIVE) {
            alert('The Game is currently unavailable. Please try again later.');
            return;
        }
        startGame();
    });
    
    var checkboxToggle = document.getElementById('checkbox-toggle');

    checkboxToggle.addEventListener('change', function() {
        document.body.classList.toggle('red-theme');
        challenge = !challenge;
    });

    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', () => {
        backToTitle();
    });

    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', () => {
        restartGame();
    });
});

function startGame() {
    displayTitle(false);
    restartGame();
}

function displayTitle(bool) {
    const display = bool ? 'flex' : 'none';
    const titleDiv = document.getElementById('title');
    const buttonContainer = document.getElementById('button-container');
    const checkbox = document.getElementById('checkbox');

    titleDiv.style.display = display;
    buttonContainer.style.display = display;
    checkbox.style.display = display;
}


function backToTitle() {
    const rightSideContainer = document.getElementById('right-side-container');
    const leftSideContainer = document.getElementById('left-side-container');
    const targetDisplay = document.getElementById('target-display');
    const neighborsList = document.getElementById('neighbors-list');
    const resetButton = document.getElementById('reset-button');
    resetButton.style.display = 'none';
    neighborsList.innerHTML = '';
    rightSideContainer.style.display = 'none';
    leftSideContainer.style.display = 'none';
    targetDisplay.style.display = 'none';
    resetVars();
    displayTitle(true);
}

function resetVars() {
    for (let i = 0; i < nodeList.length; i++) {
        const node = document.getElementById(nodeList[i]);
        node.parentNode.removeChild(node);
    }
    nodeList = [];
    for (let i = 0; i < arrowList.length; i++) {
        const arrow = document.getElementById(arrowList[i]);
        arrow.parentNode.removeChild(arrow);
    }
    arrowList = [];
    displayedNodes.clear();
    targetNode = null;
    const neighborsList = document.getElementById('neighbors-list');
    neighborsList.style.removeProperty('border-right');
    foldedNodes = 0;
    const foldCount = document.getElementById('fold-count');
    if (foldCount != null) {
        foldCount.parentNode.removeChild(foldCount);
    }
}


function displayGame(target) {
    displayLeft();
    displayRight();
    if (challenge) {
        displayTarget(target);
    }
}
function displayLeft() {
    const searchContainer = document.getElementById('left-side-container');
    searchContainer.style.display = 'flex';
    if (!challenge) {
        const neighborsHeader = document.getElementById('neighbors-header');
        neighborsHeader.textContent = 'Select Source';
    }
}

function displayRight() {
    const rightSideContainer = document.getElementById('right-side-container');
    rightSideContainer.style.display = 'flex';
    const infoText = document.getElementById('info-text');
    if (challenge) {
        infoText.textContent = 'Start your journey by selecting a teammate from the list of neighbors. Each selection will reveal new connections, helping you navigate through the football network to reach the target player. The goal? To see if you can to connect two players in 6 clicks or less. Happy exploring!';
    } else {
        infoText.textContent = 'Begin your exploration by selecting a teammate from the list of neighbors. Each selection will uncover new connections, allowing you to freely navigate through the football network without any target. Click as many times as you like and enjoy discovering the web of player connections. Happy exploring!';
    }
}

function displayTarget(target) {
    const targetDisplay = document.getElementById('target-display');
    targetDisplay.textContent = `Target: ${target}`;
    targetDisplay.style.display = 'flex';
}

function fetchNeighbors(key) {
    fetch(`https://six-degrees-api.vercel.app/api/football?path=neighbors&key=${key}`)
    .then(response => response.json())
    .then(data => {
        populateList(data.neighbors);
        })
    .catch(error => console.error('Error fetching neighbors:', error));
}

function populateList(neighbors) {
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
}

function handleNeighborClick(id, name) {
    const neighborsList = document.getElementById('neighbors-list');
    for (let i = 0; i < neighborsList.children.length; i++) {
        neighborsList.children[i].removeEventListener('click', () => {});
        console.log(neighborsList.children[i]);
    }
    if (!challenge) {
        const resetButton = document.getElementById('reset-button');
        resetButton.style.display = 'flex';
    }
    const neighborsHeader = document.getElementById('neighbors-header');
    neighborsHeader.textContent = 'Neighbors';
    displayedNodes.add(id);
    spawnNode(name);
    if (challenge && (targetNode === id || displayedNodes.size >= 7)) {
        neighborsList.innerHTML = '';
        neighborsList.style.borderRight = '0.3em solid var(--primary-color)';
        const message = document.createElement('h1');
        if (targetNode === id) {
            message.textContent = 'You win!';
        } else {
            message.textContent = 'You lose!';
        }
        message.style.color = 'var(--text-color)';
        message.style.marginTop = '0.7em';
        message.style.webkitTextStroke = '2px var(--primary-color)';
        neighborsList.appendChild(message);
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.className = 'button';
        restartButton.style.padding = '0.5em 0.5em';
        restartButton.style.marginTop = '1em';
        restartButton.addEventListener('click', () => {
            restartGame();
        });
        neighborsList.appendChild(restartButton);
        return;
    }
    if (!challenge && needWrap(displayedNodes.size)) {
        wrapNodes();
    }
    if (foldedNodes > 0) {
        let foldCount = document.getElementById('fold-count');
        if (foldCount == null) {
            foldCount = document.createElement('h1');
            foldCount.id = 'fold-count';
            foldCount.style.position = 'absolute';
            foldCount.style.top = '10%';
            foldCount.style.left = '60%';
            foldCount.style.color = 'var(--text-color)';
            foldCount.style.webkitTextStroke = '2px var(--primary-color)';
            foldCount.style.zIndex = '10';
            document.body.appendChild(foldCount);
        }
        foldCount.textContent = `+${foldedNodes} nodes`;
    }
    fetchNeighbors(id);
}

function wrapNodes() {
    nodeList.splice(1, 6).forEach(nodeId => {
        const node = document.getElementById(nodeId);
        document.body.removeChild(node);
        foldedNodes++;
    });
    arrowList.forEach(arrowId => {
        const arrow = document.getElementById(arrowId);
        document.body.removeChild(arrow);
    });
    arrowList = [];
    nodeList.splice(1, 1).forEach(nodeId => {
        const node = document.getElementById(nodeId);
        const name = node.textContent;
        spawnNode(name);
        document.body.removeChild(node);
    });
}

function needWrap(size) {
    if (size > 6 && size % 6 === 2) {
        return true;
    }
    return false;
}

function restartGame() {
    resetVars();
    if (challenge) {
        fetch('https://six-degrees-api.vercel.app/api/football?path=endpoints')
        .then(response => response.json())
        .then(data => {
            fetchNeighbors(data.source[0]);
            displayGame(data.target[1]);
            displayedNodes.add(data.source[0]);
            targetNode = data.target[0];
            spawnNode(data.source[1]);
        })
        .catch(error => console.error('Error fetching data:', error));
    } else {
        fetch('https://six-degrees-api.vercel.app/api/football?path=playerlist')
        .then(response => response.json())
        .then(data => {
            populateSourceList(data);
            displayGame('');
        })
        .catch(error => console.error('Error fetching data:', error));
    }
}

function populateSourceList(players) {
    const neighborsList = document.getElementById('neighbors-list');
    neighborsList.innerHTML = '';  // Clear previous content
    Object.entries(players)
        .sort((a, b) => a[1].localeCompare(b[1]))
        .forEach(([id, name]) => {
            const listItem = document.createElement('li');
            listItem.textContent = name;
            listItem.id = id;
            listItem.addEventListener('click', () => handleNeighborClick(id, name));
            neighborsList.appendChild(listItem);
        });
}

function spawnNode(name, id = `node-${displayedNodes.size}`) {
    const node = document.createElement('h1');
    node.className = 'node';
    node.id = id;
    node.textContent = name;
    node.style.top = `${5 + (nodeList.length) * 12}%`; // Adjust the vertical position based on the number of nodes
    node.style.display = 'flex';
    document.body.appendChild(node);
    nodeList.push(id);
    if (nodeList.length > 1) {
        drawArrow(nodeList.length - 2);
    }
}

function drawArrow(fromIndex) {
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.id = `arrow-${arrowList.length}`;
    arrow.style.position = 'absolute';
    arrow.style.top = `${12 + fromIndex * 12}%`; // Position the arrow between the two nodes
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.innerHTML = '&darr;'; // Downward arrow symbol
    document.body.appendChild(arrow);
    arrowList.push(arrow.id);
}