// kmeans.js

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let points = [];
let centroids = [];
let clusters = [];
let k = 3;
let colors = ['#FF6347', '#4CAF50', '#1E90FF', '#FFD700', '#8A2BE2'];
let isClustersAssigned = false;

// Event listeners for buttons
document.getElementById('regeneratePoints').addEventListener('click', regeneratePoints);
document.getElementById('chooseCentroids').addEventListener('click', chooseCentroids);
document.getElementById('assignClusters').addEventListener('click', assignClusters);
canvas.addEventListener('click', predictPoint);
canvas.addEventListener('touchstart', predictPointTouch);

// Initialize with random points
regeneratePoints();

// Generate random points
function regeneratePoints() {
    points = [];
    centroids = [];
    clusters = [];
    isClustersAssigned = false;

    for (let i = 0; i < 100; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }

    drawCanvas();
    document.getElementById('status').innerText = "Points generated. Click 'Choose K Points' to select centroids.";
}

// Choose random initial centroids
function chooseCentroids() {
    centroids = [];
    clusters = [];
    isClustersAssigned = false;

    for (let i = 0; i < k; i++) {
        let centroid = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
        centroids.push(centroid);
        clusters.push([]);
    }

    drawCanvas();
    document.getElementById('status').innerText = "Centroids chosen. Click 'Assign Points to Clusters' to proceed.";
}

// Assign points to the nearest centroid
function assignClusters() {
    clusters = Array.from({ length: k }, () => []);

    points.forEach(point => {
        let minDistance = Infinity;
        let assignedCluster = -1;

        centroids.forEach((centroid, index) => {
            let distance = Math.sqrt(Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                assignedCluster = index;
            }
        });

        clusters[assignedCluster].push(point);
    });

    isClustersAssigned = true;
    updateLegend();
    drawCanvas();
    document.getElementById('status').innerText = "Points assigned to clusters. Click on the canvas to predict a point's cluster.";
}

// Predict the cluster of a clicked point
function predictPoint(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    predictAndDrawPoint(x, y);
}

// Handle touch events for mobile
function predictPointTouch(event) {
    event.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let touch = event.touches[0];
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;
    predictAndDrawPoint(x, y);
}

// Predict and draw the selected point
function predictAndDrawPoint(x, y) {
    let point = { x, y };

    let minDistance = Infinity;
    let assignedCluster = -1;

    centroids.forEach((centroid, index) => {
        let distance = Math.sqrt(Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            assignedCluster = index;
        }
    });

    // Draw the predicted point
    ctx.fillStyle = colors[assignedCluster];
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fill();

    document.getElementById('status').innerText = `Point predicted to belong to Cluster ${assignedCluster + 1}.`;
}

// Draw the points and centroids on the canvas
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw points (no color if clusters aren't assigned)
    points.forEach(point => {
        let clusterIndex = isClustersAssigned ? getClusterIndex(point) : -1;
        ctx.fillStyle = clusterIndex === -1 ? '#000' : colors[clusterIndex];
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw centroids
    centroids.forEach((centroid, index) => {
        ctx.fillStyle = colors[index];
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Get the cluster index that a point belongs to
function getClusterIndex(point) {
    let minDistance = Infinity;
    let assignedCluster = -1;

    centroids.forEach((centroid, index) => {
        let distance = Math.sqrt(Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            assignedCluster = index;
        }
    });

    return assignedCluster;
}

// Update legend for clusters
function updateLegend() {
    let legend = document.getElementById('legend');
    legend.innerHTML = "";

    centroids.forEach((_, index) => {
        let legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');

        let colorBox = document.createElement('div');
        colorBox.classList.add('legend-color');
        colorBox.style.backgroundColor = colors[index];

        let label = document.createElement('span');
        label.innerText = `Cluster ${index + 1}`;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legend.appendChild(legendItem);
    });
}
