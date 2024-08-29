class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(element, priority) {
        this.queue.push({ element, priority });
        this.queue.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.queue.shift().element;
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}

function limparDestacarArestas(cy) {
    cy.edges().style({
        'line-color': '#ccc', 
        'target-arrow-color': '#ccc',
        'width': 3
    });
}

class Grafo {
    constructor(vertices) {
        this.V = vertices;
        this.grafo = [];
        this.edges = [];
    }

    adicionarAresta(u, v, w) {
        this.grafo.push([u, v, w]);
        this.edges.push({ data: { source: `${u}`, target: `${v}`, weight: w } });
    }

    bellmanFord(start) {
        const dist = Array(this.V).fill(Infinity);
        const prev = Array(this.V).fill(null);
        dist[start] = 0;

        for (let i = 0; i < this.V - 1; i++) {
            for (const [u, v, w] of this.grafo) {
                if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    prev[v] = u;
                }
            }
        }

        return { dist, prev };
    }

    dijkstra(start) {
        const distances = {};
        const previous = {};
        const priorityQueue = new PriorityQueue();
    
        for (let node = 0; node < this.V; node++) {
            const nodeStr = `${node}`;
            distances[nodeStr] = nodeStr === start ? 0 : Infinity;
            priorityQueue.enqueue(nodeStr, distances[nodeStr]);
            previous[nodeStr] = null;
        }
    
        while (!priorityQueue.isEmpty()) {
            const currentNode = priorityQueue.dequeue();
    
            for (const [neighbor, weight] of this.getAdjacencyList(currentNode)) {
                const distance = distances[currentNode] + weight;
    
                if (distance < distances[neighbor]) {
                    distances[neighbor] = distance;
                    previous[neighbor] = currentNode;
                    priorityQueue.enqueue(neighbor, distance);
                }
            }
        }
    
        return { distances, previous };
    }
    
    johnson() {
        this.adicionarAresta(this.V, 0, 0);
        const { dist: h, prev } = this.bellmanFord(this.V);
        this.grafo.pop();
    
        const novaGrafo = Array.from({ length: this.V }, () => []);
    
        for (const [u, v, w] of this.grafo) {
            if (u < this.V && v < this.V) {
                novaGrafo[u].push([v, w + h[u] - h[v]]);
            }
        }
    
        const distancias = [];
        for (let u = 0; u < this.V; u++) {
            distancias.push(this.dijkstra(u));
        }
    
        return distancias;
    }
    
    getAdjacencyList(node) {
        const adjacencyList = [];
        for (const [u, v, w] of this.grafo) {
            if (u === node) {
                adjacencyList.push([v, w]);
            }
        }
        return adjacencyList;
    }

    getPath(prev, start, end) {
        const path = [];
        for (let at = end; at != null; at = prev[at]) {
            path.push(at);
        }
        return path.reverse();
    }
       
    visualizarGrafo(cy) {
  
        const nodes = Array.from(new Set(this.edges.flatMap(edge => [edge.data.source, edge.data.target])))
            .map(id => ({ data: { id } }));
        cy.add(nodes);
    

        const edgesWithIds = this.edges.map(edge => ({
            data: {
                id: `${edge.data.source}-${edge.data.target}`, 
                source: edge.data.source,
                target: edge.data.target,
                weight: edge.data.weight
            }
        }));
        
        cy.add(edgesWithIds);
    
        cy.layout({ name: 'grid', rows: 2 }).run();
    }
    
    destacarCaminho(cy, caminho, cor) {


        limparDestacarArestas(cy); 

        caminho.forEach(edge => {
            const edgeId = `${edge.source}-${edge.target}`;
            console.log(`Destacando aresta com ID ${edgeId}`); 
            cy.edges(`#${edgeId}`).style({
                'line-color': cor,
                'target-arrow-color': cor,
                'width': 6
            });
        });
        
    }
}

function atualizarResultados(caminhoBF, caminhoDijkstra, caminhoJohnson) {
    document.getElementById('bellman-ford').textContent = `Caminho de Bellman-Ford: ${caminhoBF.join(' -> ')}`;
    document.getElementById('dijkstra').textContent = `Caminho de Dijkstra: ${caminhoDijkstra.join(' -> ')}`;
    document.getElementById('johnson').textContent = `Caminho de Johnson: ${caminhoJohnson.join(' -> ')}`;
}

document.addEventListener('DOMContentLoaded', function () {
    const cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'label': 'data(id)',
                    'text-valign': 'center',
                    'color': '#fff'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'label': 'data(weight)'
                }
            }
        ]
    });

    const grafo = new Grafo(4);
    grafo.adicionarAresta(0, 1, 4);
    grafo.adicionarAresta(0, 2, 1);
    grafo.adicionarAresta(2, 1, -2);
    grafo.adicionarAresta(1, 3, 2);
    grafo.adicionarAresta(2, 3, 5);

    grafo.visualizarGrafo(cy);

    const startNode = '0';
    const endNode = '3';

    // Bellman-Ford
    const { dist: distBF, prev: prevBF } = grafo.bellmanFord(startNode);
    const caminhoBF = grafo.getPath(prevBF, startNode, endNode);
    grafo.destacarCaminho(cy, caminhoBF.map((node, index) => ({
        source: prevBF[node] !== null ? prevBF[node] : startNode, 
        target: node
    })), 'red');

    // Dijkstra
    const { distances: distDijkstra, previous: prevDijkstra } = grafo.dijkstra(startNode);
    const caminhoDijkstra = grafo.getPath(prevDijkstra, startNode, endNode);
    grafo.destacarCaminho(cy, caminhoDijkstra.map((node, index) => ({
        source: prevDijkstra[node] !== null ? prevDijkstra[node] : startNode, 
        target: node
    })), 'blue');

    // Johnson
    const distanciasJohnson = grafo.johnson();
    const caminhoJohnson = grafo.getPath(distanciasJohnson[startNode].previous, startNode, endNode);
    grafo.destacarCaminho(cy, caminhoJohnson.map((node, index) => ({
        source: distanciasJohnson[startNode].previous[node] !== null ? distanciasJohnson[startNode].previous[node] : startNode, 
        target: node
    })), 'green');

    atualizarResultados(caminhoBF, caminhoDijkstra, caminhoJohnson);
});
