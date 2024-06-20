displayedNodes = new Set();
targetNode = null;
nodeList = [];
arrowList = [];

document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.button');
    const titleDiv = document.getElementById('title');
    const buttonContainer = document.getElementById('button-container');
    const checkbox = document.getElementById('checkbox');


    button.addEventListener('click', () => {
        titleDiv.style.display = 'none';
        buttonContainer.style.display = 'none';
        checkbox.style.display = 'none';

        fetch('https://six-degrees-api.vercel.app/api/football?path=endpoints')
        .then(response => response.json())
        .then(data => {
            displayGame(data.target[1]);
            fetchNeighbors(data.source[0]);
            displayedNodes.add(data.source[0]);
            targetNode = data.target[0];
            spawnSourceNode(data.source[1]);
        })
        .catch(error => console.error('Error fetching data:', error));
    });
    
    var checkboxToggle = document.getElementById('checkbox-toggle');

    checkboxToggle.addEventListener('change', function() {
        document.body.classList.toggle('red-theme');
    });

    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', () => {
        const neighborsContainer = document.getElementById('right-side-container');
        const leftSideContainer = document.getElementById('left-side-container');
        const targetDisplay = document.getElementById('target-display');
        buttonContainer.style.display = 'none';
        neighborsContainer.style.display = 'none';
        leftSideContainer.style.display = 'none';
        targetDisplay.style.display = 'none';
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

        titleDiv.style.display = 'flex';
        buttonContainer.style.display = 'flex';
        checkbox.style.display = 'flex';
    });
});

function displayGame(target) {
    displayLeft();
    displayRight();
    displayTarget(target);
}
function displayLeft() {
    const searchContainer = document.getElementById('left-side-container');
    searchContainer.style.display = 'flex';
}

function displayRight() {
    const neighborsContainer = document.getElementById('right-side-container');
    neighborsContainer.style.display = 'flex';
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
    displayedNodes.add(id);
    spawnNode(name);
    if (targetNode === id || displayedNodes.size === 7) {
        const neighborsList = document.getElementById('neighbors-list');
        neighborsList.innerHTML = '';
        neighborsList.style.borderRight = '0.3em solid var(--primary-color)';
        if (targetNode === id) {
            const winMessage = document.createElement('h1');
            winMessage.textContent = 'You win!';
            winMessage.style.color = 'var(--text-color)';
            winMessage.style.marginTop = '1em';
            winMessage.style.webkitTextStroke = '2px var(--primary-color)';
            neighborsList.appendChild(winMessage);
        } else {
            const loseMessage = document.createElement('h1');
            loseMessage.textContent = 'You lose!';
            loseMessage.style.color = 'var(--text-color)';
            loseMessage.style.marginTop = '1em';
            loseMessage.style.webkitTextStroke = '2px var(--primary-color)';
            neighborsList.appendChild(loseMessage);
        }
        return;
    }
    fetchNeighbors(id);
}

function spawnSourceNode(source) {
    spawnNode(source);
}

function spawnNode(name, id = `node-${displayedNodes.size}`) {
    const node = document.createElement('h1');
    node.className = 'node';
    node.id = id;
    node.textContent = name;
    node.style.top = `${5 + (displayedNodes.size-1) * 12}%`; // Adjust the vertical position based on the number of nodes
    node.style.display = 'flex';
    document.body.appendChild(node);
    nodeList.push(id);
    if (displayedNodes.size > 1) {
        drawArrow(displayedNodes.size - 2);
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