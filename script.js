displayedNodes = new Set();
targetNode = null;

document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.button');
    const titleDiv = document.getElementById('title');
    const buttonContainer = document.getElementById('button-container');

    button.addEventListener('click', () => {
        titleDiv.style.display = 'none';
        buttonContainer.style.display = 'none';

        fetch('http://127.0.0.1:5000/api/random')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayGame(data.target[1]);
            fetchNeighbors(data.source[0]);
            displayedNodes.add(data.source[0]);
            targetNode = data.target[0];
            spawnSourceNode(data.source[1]);
        })
        .catch(error => console.error('Error fetching data:', error));
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
    fetch(`http://127.0.0.1:5000/api/neighbors?key=${key}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
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
            neighborsList.appendChild(listItem);
        }
    });
}

function spawnSourceNode(source) {
    // Create a new node element
    const node = document.createElement('h1');
    node.className = 'node';
    node.id = `current-node`;
    node.textContent = source;
    node.style.display = 'flex';
    document.body.appendChild(node);
}
