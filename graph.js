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

    bellmanFord(src) {
        const dist = Array(this.V).fill(Infinity);
        dist[src] = 0;
    
        for (let i = 0; i < this.V - 1; i++) {
            for (const [u, v, w] of this.grafo) {
                if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                }
            }
        }
    
    
        return dist;
    }
    

    dijkstra(src, novaGrafo) {
        const dist = Array(this.V).fill(Infinity);
        dist[src] = 0;
        const pq = new MinHeap();
        pq.insert([0, src]);

        while (!pq.isEmpty()) {
            const [d, u] = pq.extractMin();

            if (d > dist[u]) continue;

            for (const [v, w] of novaGrafo[u]) {
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.insert([dist[v], v]);
                }
            }
        }

        return dist;
    }

    johnson() {
        this.adicionarAresta(this.V, 0, 0);
        const h = this.bellmanFord(this.V);
        this.grafo.pop();

        const novaGrafo = Array.from({ length: this.V }, () => []);

        for (const [u, v, w] of this.grafo) {
            if (u < this.V && v < this.V) {
                novaGrafo[u].push([v, w + h[u] - h[v]]);
            }
        }

        const distancias = [];
        for (let u = 0; u < this.V; u++) {
            distancias.push(this.dijkstra(u, novaGrafo));
        }

        return distancias;
    }

    visualizarGrafo(cy) {
        const nodes = Array.from(new Set(this.edges.flatMap(edge => [edge.data.source, edge.data.target])))
            .map(id => ({ data: { id } }));
        cy.add(nodes);

        console.log("Nodes:", nodes);

        this.edges = this.edges.filter(edge => {
            const sourceExists = cy.getElementById(edge.data.source).length > 0;
            const targetExists = cy.getElementById(edge.data.target).length > 0;
            return sourceExists && targetExists;
        });
        console.log("Filtered Edges:", this.edges);
        cy.add(this.edges);
        cy.layout({ name: 'grid', rows: 2 }).run();
    }

    destacarCaminho(cy, caminho, cor) {
        caminho.forEach(edge => {
            cy.edges(`[source = "${edge.source}"][target = "${edge.target}"]`).style({
                'line-color': cor,
                'target-arrow-color': cor,
                'width': 6
            });
        });
    }
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


    const caminhoBellmanFord = [
        { source: '0', target: '2' },
        { source: '2', target: '1' },
        { source: '1', target: '3' }
    ];

    const caminhoDijkstra = [
        { source: '0', target: '2' },
        { source: '2', target: '3' }
    ];

    const caminhoJohnson = [
        { source: '0', target: '2' },
        { source: '2', target: '1' },
        { source: '1', target: '3' }
    ];


    grafo.destacarCaminho(cy, caminhoBellmanFord, 'red');
    grafo.destacarCaminho(cy, caminhoDijkstra, 'blue');
    grafo.destacarCaminho(cy, caminhoJohnson, 'green');
});

