let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let points = [];
let centroids = [];
let clusters = [];
let k = 3;
let colors = ['#FF6347', '#4CAF50', '#1E90FF', '#FFD700', '#8A2BE2'];
let isClustersAssigned = false;

document.getElementById('regeneratePoints').addEventListener('click', regeneratePoints);
document.getElementById('chooseCentroids').addEventListener('click', chooseCentroids);
document.getElementById('assignClusters').addEventListener('click', assignClusters);
document.getElementById('recalculateCentroids').addEventListener('click', recalculateCentroids);
canvas.addEventListener('click', predictPoint);
canvas.addEventListener('touchstart', predictPointTouch);

regeneratePoints();

// Generate artificial clusters with more points
function regeneratePoints() {
    points = [];
    centroids = [];
    clusters = [];
    isClustersAssigned = false;

    let clusterCenters = [
        { x: 150, y: 150 },
        { x: 350, y: 250 },
        { x: 200, y: 400 }
    ];

    for (let i = 0; i < 150; i++) {
        let cluster = clusterCenters[i % clusterCenters.length];
        points.push({
            x: cluster.x + Math.random() * 60 - 30,
            y: cluster.y + Math.random() * 60 - 30
        });
    }

    drawCanvas();
    document.getElementById('status').innerText = "Points generated. Click 'Choose K Points' to select centroids.";
}

// Pick initial k points from existing points
function chooseCentroids() {
    centroids = [];
    clusters = [];
    isClustersAssigned = false;

    let shuffledPoints = [...points].sort(() => Math.random() - 0.5);
    centroids = shuffledPoints.slice(0, k);

    drawCanvas();
    document.getElementById('status').innerText = "Centroids chosen from existing points. Click 'Assign Points to Clusters'.";
}

// Assign points to the closest centroid
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
    document.getElementById('status').innerText = "Clusters assigned. Click 'Recalculate Centroids' to update means.";
}

// Recalculate centroids based on assigned points
function recalculateCentroids() {
    if (!isClustersAssigned) {
        document.getElementById('status').innerText = "Assign clusters first!";
        return;
    }

    let newCentroids = centroids.map((_, index) => {
        let clusterPoints = clusters[index];
        if (clusterPoints.length === 0) return centroids[index]; // Avoid empty cluster issue

        let avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
        let avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;

        return { x: avgX, y: avgY };
    });

    let centroidsChanged = centroids.some((c, i) => c.x !== newCentroids[i].x || c.y !== newCentroids[i].y);
    centroids = newCentroids;

    drawCanvas();

    if (centroidsChanged) {
        document.getElementById('status').innerText = "Centroids updated. Click 'Assign Points to Clusters' to reassign points.";
    } else {
        document.getElementById('status').innerText = "Centroids stabilized. K-means has converged!";
    }
}

// Predict cluster for a clicked point
function predictPoint(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    predictAndDrawPoint(x, y);
}

// Handle touch input
function predictPointTouch(event) {
    event.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let touch = event.touches[0];
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;
    predictAndDrawPoint(x, y);
}

// Predict and mark the clicked point
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

    ctx.fillStyle = colors[assignedCluster];
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fill();

    document.getElementById('status').innerText = `Point predicted to belong to Cluster ${assignedCluster + 1}.`;
}

// Draw the points and centroids on the canvas
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    points.forEach(point => {
        let clusterIndex = isClustersAssigned ? getClusterIndex(point) : -1;
        ctx.fillStyle = clusterIndex === -1 ? '#000' : colors[clusterIndex];
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    centroids.forEach((centroid, index) => {
        ctx.fillStyle = colors[index];
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Get cluster index for a given point
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

// Update legend with cluster colors
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
