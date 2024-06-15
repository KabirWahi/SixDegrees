let displayedNodes = new Set();  // Track nodes that are currently displayed

document.getElementById("fetchButton").addEventListener("click", function() {
    fetch('http://127.0.0.1:5000/api/random')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById("targetDisplay").innerText = `Target: ${data.target[1]}`;
            createNodes(data);
            fetchNeighbors(data.source[0]);
            displayedNodes.add(data.source[0]); // Track displayed source node
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById("submitNeighbor").addEventListener("click", function() {
    const dropdown = document.getElementById("neighborsDropdown");
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    const neighborName = selectedOption.text;
    const neighborId = selectedOption.value;
    addNode(neighborName, neighborId);
    displayedNodes.add(neighborId); // Track displayed node
    if (document.getElementById("targetDisplay").innerText.includes(neighborName)) {
        document.getElementById("winnerMessage").innerText = "Winner!";
    }
    fetchNeighbors(neighborId); // Fetch new neighbors for the selected node
});

function fetchNeighbors(key) {
    fetch(`http://127.0.0.1:5000/api/neighbors?key=${key}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error fetching neighbors:', data.error);
            } else {
                populateDropdown(data.neighbors);
            }
        })
        .catch(error => console.error('Error fetching neighbors:', error));
}

function populateDropdown(neighbors) {
    const dropdown = document.getElementById("neighborsDropdown");
    dropdown.innerHTML = '';  // Clear existing options
    neighbors.forEach(neighbor => {
        if (!displayedNodes.has(neighbor[0])) {  // Only add if not already displayed
            const option = document.createElement("option");
            option.text = neighbor[1]; // Neighbor name
            option.value = neighbor[0]; // Neighbor ID
            dropdown.add(option);
        }
    });
}

function addNode(name, id) {
    const svg = d3.select("#viz").select("svg");
    if (!svg.node()) {
        createSvg(); // Create SVG if it does not exist
    }
    const nodeElement = svg.append("g")
                           .attr("transform", `translate(${Math.random() * 750 + 25}, ${Math.random() * 550 + 25})`);
    nodeElement.append("circle")
               .attr("r", 40)
               .attr("class", "circle-node")
               .style("filter", "url(#drop-shadow)");

    nodeElement.append("text")
               .text(name)
               .attr("class", "text-node")
               .attr("text-anchor", "middle")
               .attr("y", 5);
}

function createSvg() {
    const svg = d3.select("#viz")
                  .append("svg")
                  .attr("width", 800)
                  .attr("height", 600)
                  .style("outline", "none");

    const defs = svg.append("defs");
    const filter = defs.append("filter")
                       .attr("id", "drop-shadow")
                       .attr("height", "130%");
    filter.append("feGaussianBlur")
          .attr("in", "SourceAlpha")
          .attr("stdDeviation", 3);
    filter.append("feOffset")
          .attr("dx", 2)
          .attr("dy", 2)
          .attr("result", "offsetblur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
           .attr("in", "offsetblur");
    feMerge.append("feMergeNode")
           .attr("in", "SourceGraphic");
}

function createNodes(data) {
    createSvg(); // Ensure SVG is created on initial load
    addNode(data.source[1], data.source[0]);
}
