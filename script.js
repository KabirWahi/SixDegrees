document.getElementById("fetchButton").addEventListener("click", function() {
    fetch('http://127.0.0.1:5000/api/random')
        .then(response => response.json())
        .then(data => console.log(data))
        .then(data => {
            createNodes(data);
        })
        .catch(error => console.error('Error fetching data:', error));
});

function createNodes(data) {
    const svg = d3.select("#viz")
                  .append("svg")
                  .attr("width", 800)
                  .attr("height", 600);

    const nodes = [
        { id: data.source[0], name: data.source[1] },
        { id: data.target[0], name: data.target[1] }
    ];

    const nodeElements = svg.selectAll("g")
                             .data(nodes)
                             .enter()
                             .append("g")
                             .attr("transform", (d, i) => `translate(${100 + i * 600}, ${300})`);

    nodeElements.append("circle")
                .attr("r", 40)
                .attr("fill", "lightblue");

    nodeElements.append("text")
                .text(d => d.name)
                .attr("text-anchor", "middle")
                .attr("y", 5);
}
