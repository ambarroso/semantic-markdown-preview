import cytoscape from 'cytoscape';
import { Parser } from 'n3';
import hljs from 'highlight.js/lib/core';
import turtle from './turtle-highlight';

hljs.registerLanguage('turtle', turtle);

// Style for the graph container and basic HLJS styles (minimal fallback)
const style = document.createElement('style');
style.textContent = `
    .semantic-graph {
        width: 100%;
        height: 400px;
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-widget-border);
        margin-bottom: 16px;
    }
    /* Dark Theme (Default matches VS Code Dark+) */
    .vscode-dark .hljs { color: #d4d4d4; }
    
    /* 1. Prefixes/Keywords (@prefix, a): Purple/Magenta */
    .vscode-dark .hljs-keyword, .vscode-dark .hljs-meta { color: #c586c0 !important; }
    
    /* 2. URIs (<http://...>): Blue */
    .vscode-dark .hljs-link { color: #569cd6 !important; } /* VS Code Blue */
    
    /* 3. Strings ("..."): Green */
    .vscode-dark .hljs-string { color: #6a9955 !important; }
    
    /* 4. Prefix Labels (ex:): Orange/Gold */
    .vscode-dark .hljs-title { color: #d7ba7d !important; }
    
    /* 5. Local Names (Person): Light Blue (Changed from Teal #4ec9b0 to improve contrast with Green strings) */
    .vscode-dark .hljs-symbol, .vscode-dark .hljs-template-variable { color: #9cdcfe !important; }
    
    /* 6. Numbers/Booleans/Literals: Red/Orange */
    .vscode-dark .hljs-number, .vscode-dark .hljs-literal { color: #ce9178 !important; }

    /* 7. Comments: Grey/Dim */
    .vscode-dark .hljs-comment, .vscode-dark .hljs-quote { color: #808080 !important; } /* Explicit Grey */

    
    /* Light Theme (Adapted to standard Light colors but following the Logic) */
    .vscode-light .hljs { color: #000000; }
    
    /* 1. Purple/Magenta */
    .vscode-light .hljs-keyword, .vscode-light .hljs-meta { color: #af00db !important; }
    /* 2. Blue */
    .vscode-light .hljs-link { color: #0000ff !important; }
    /* 3. Green */
    .vscode-light .hljs-string { color: #098658 !important; }
    /* 4. Orange/Gold */
    .vscode-light .hljs-title { color: #795e26 !important; }
    /* 5. Cyan/Teal */
    .vscode-light .hljs-symbol { color: #0070c1 !important; }
    /* 6. Red/Orange */
    .vscode-light .hljs-number, .vscode-light .hljs-literal { color: #cd3131 !important; }
    /* 7. Grey */
    .vscode-light .hljs-comment { color: #808080 !important; }

    /* High Contrast */
    .vscode-high-contrast .hljs { color: #ffffff; }
    .vscode-high-contrast .hljs-keyword { color: #569cd6; }
`;
document.head.appendChild(style);

function getLabel(term: any): string {
    if (term.termType === 'NamedNode') {
        const value = term.value;
        // Basic splitting to get the local name
        if (value.includes('#')) return value.split('#').pop()!;
        if (value.includes('/')) return value.split('/').pop()!;
        return value;
    }
    if (term.termType === 'Literal') {
        return `"${term.value}"`;
    }
    return term.value;
}


function initCytoscape(container: HTMLElement, nodes: any[], edges: any[]) {
    // Detect Theme for edge label background
    const isDark = document.body.classList.contains('vscode-dark');
    const edgeLabelBg = isDark ? '#1e1e1e' : '#ffffff';
    const edgeLabelColor = isDark ? '#cccccc' : '#333333';

    cytoscape({
        container: container,
        elements: [...nodes, ...edges],
        layout: {
            name: 'cose',
            animate: false,
            nodeDimensionsIncludeLabels: true,
            // PHYSICS CONSTRAINTS
            idealEdgeLength: (edge: any) => {
                switch (edge.data('kind')) {
                    case 'membership': return 30; // Close clustering (Individual -> Class)
                    case 'data': return 40;       // Close clustering (Individual -> Literal)
                    case 'hierarchy': return 100; // Spaced out
                    default: return 80;
                }
            },
            edgeElasticity: (edge: any) => {
                switch (edge.data('kind')) {
                    case 'membership': return 200; // Strong pull
                    default: return 100;
                }
            },
            nodeRepulsion: (node: any) => 500000,
            nestingFactor: 5,
            gravity: 1,
        } as any,
        style: [
            // 1. INDIVIDUAL: Small Ellipse, Pink (#ffccdd)
            {
                selector: 'node[kind="instance"]',
                style: {
                    'background-color': '#ffccdd',
                    'color': '#000000',
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px',
                    'width': (ele: any) => Math.max(60, ele.data('label').length * 8 + 20),
                    'height': 60,
                    'shape': 'ellipse',
                    'border-width': 1,
                    'border-color': '#ff99bb'
                }
            },
            // 2. OWL CLASS: Ellipse, Light Blue (#aaccff)
            {
                selector: 'node[kind="class"]',
                style: {
                    'background-color': '#aaccff',
                    'color': '#000000',
                    'label': 'data(label)', // Added
                    'font-size': '14px',
                    'font-weight': 'bold',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'width': (ele: any) => Math.max(80, ele.data('label').length * 10 + 30),
                    'height': 80,
                    'shape': 'ellipse',
                    'border-width': 2,
                    'border-color': '#88aadd'
                }
            },
            // 3. EXTERNAL CLASS: Ellipse, Dark Blue (#3366cc)
            {
                selector: 'node[kind="external-class"]',
                style: {
                    'background-color': '#3366cc',
                    'color': '#ffffff',
                    'label': 'data(label)', // Added
                    'font-size': '14px',
                    'font-weight': 'bold',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'width': (ele: any) => Math.max(80, ele.data('label').length * 10 + 30),
                    'height': 80,
                    'shape': 'ellipse'
                }
            },
            // 4. LITERAL: Rectangle, Yellow (#ffffcc)
            {
                selector: 'node[kind="literal"]',
                style: {
                    'shape': 'round-rectangle',
                    'background-color': '#ffffcc',
                    'color': '#000000',
                    'label': 'data(label)', // Added
                    'border-width': 1,
                    'border-color': '#ddddaa',
                    'width': (ele: any) => Math.max(40, ele.data('label').length * 8 + 10),
                    'height': 30,
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'text-wrap': 'wrap'
                }
            },
            // 5. DATATYPE: Rectangle, Grey (#dddddd)
            {
                selector: 'node[kind="datatype"]',
                style: {
                    'shape': 'round-rectangle',
                    'background-color': '#dddddd',
                    'color': '#000000',
                    'label': 'data(label)', // Added
                    'border-width': 1,
                    'border-color': '#bbbbbb',
                    'width': (ele: any) => Math.max(40, ele.data('label').length * 6 + 10),
                    'height': 25,
                    'padding': '6px',
                    'font-size': '10px',
                    'text-valign': 'center',
                    'text-halign': 'center'
                }
            },

            // EDGES - BASE STYLE
            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'font-size': '13px', // Increased from 10px
                    'text-rotation': 'autorotate',
                    'text-background-opacity': 0.8,
                    'text-background-color': edgeLabelBg,
                    'text-background-shape': 'roundrectangle',
                    'text-background-padding': '3px', // Slightly more padding
                    'color': edgeLabelColor
                }
            },
            // Category A: Hierarchy (Hollow, Dark Grey)
            {
                selector: 'edge[kind="hierarchy"]',
                style: {
                    'width': 4, // Increased
                    'line-color': '#333333',
                    'target-arrow-color': '#333333',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-fill': 'hollow',
                    'line-style': 'solid'
                }
            },
            // Category B: Membership (Purple)
            {
                selector: 'edge[kind="membership"]',
                style: {
                    'width': 2, // Increased
                    'line-color': '#993399',
                    'target-arrow-color': '#993399',
                    'target-arrow-shape': 'triangle',
                    'line-style': 'solid'
                }
            },
            // Category C: Semantic (Blue)
            {
                selector: 'edge[kind="semantic"]',
                style: {
                    'width': 2, // Increased
                    'line-color': '#1E90FF', // Dodger Blue (Bright)
                    'target-arrow-color': '#1E90FF',
                    'target-arrow-shape': 'triangle',
                    'line-style': 'solid'
                }
            },
            // Category D: Data (Orange - distinct from Blue/Green)
            {
                selector: 'edge[kind="data"]',
                style: {
                    'width': 2, // Increased
                    'line-color': '#E67E22', // Orange
                    'target-arrow-color': '#E67E22',
                    'target-arrow-shape': 'triangle',
                    'line-style': 'solid'
                }
            }
        ]
    });
}

async function renderSingleGraph(container: HTMLElement, content: string, config: any = {}) {
    // Clear previous graph/content
    container.innerHTML = '';

    const parser = new Parser();
    const nodes = new Map<string, any>();
    const edges: any[] = [];
    const classSet = new Set<string>();
    let parsedPrefixes: any = {};
    // ... rest of function ...

    const store = new class {
        quads: any[] = [];
        add(q: any) { this.quads.push(q); }
    }();

    // 1. Parse all quads first to build the graph model
    parser.parse(content, (error, quad, prefixes) => {
        if (error) {
            container.innerHTML = `<span style="color:red">Error parsing RDF: ${error.message}</span>`;
            return;
        }
        if (quad) {
            store.add(quad);

            // Heuristic for Classes
            // rdf:type -> object is a Class
            if (quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                classSet.add(quad.object.value);
            }
            // rdfs:subClassOf -> subject and object are Classes
            if (quad.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#subClassOf') {
                classSet.add(quad.subject.value);
                classSet.add(quad.object.value);
            }
            // owl:Class definition
            if (quad.object.value === 'http://www.w3.org/2002/07/owl#Class') {
                classSet.add(quad.subject.value);
            }
        } else {
            // Parsing complete, build elements
            if (prefixes) parsedPrefixes = prefixes;
            buildElements();
        }
    });

    function buildElements() {
        // Heuristic for Base IRI: content of empty prefix, or common example.org
        const baseIRI = parsedPrefixes[''] ? parsedPrefixes[''].value : null;

        const getKind = (term: any, id: string): string => {
            if (term.termType === 'Literal') return 'literal';

            // Check for Datatypes (XSD) distinct from just being an IRI
            if (id.startsWith('http://www.w3.org/2001/XMLSchema#')) return 'datatype';

            if (classSet.has(id)) {
                // Class Logic: Internal vs External
                if (baseIRI) {
                    if (id.startsWith(baseIRI)) return 'class'; // Internal
                    if (!id.startsWith('http')) return 'class'; // Relative/Internal
                    return 'external-class'; // External
                }
                // Fallback if no Base IRI found:
                // Assume 'http' is external unless it looks like a local relative ID
                if (!id.startsWith('http')) return 'class';

                // If it is a full URI but we don't know the base, heuristics:
                // Known externals: foaf, schema, rdfs, owl, rdf
                if (id.includes('foaf') || id.includes('schema.org') || id.includes('w3.org')) return 'external-class';

                // Default to Internal Class (Light Blue) if unsure, to ensure visibility
                return 'class';
            }
            return 'instance';
        };

        const createNode = (term: any) => {
            const id = term.value;
            if (nodes.has(id)) return true; // Already exists

            const kind = getKind(term, id);

            // DEBUG LOGGING
            console.log(`Node: ${id}, Kind: ${kind}, Config:`, config);

            // FILTER CONFIGURATION
            if (config.noLiterals && kind === 'literal') {
                console.log('Filtered Literal:', id);
                return false;
            }
            // Datatype usually goes with literals? Or distinct? Let's hide datatypes with no-literals for semantic simplicity, or no?
            // User asked "omit the literals; the external classes, all classes, the instances".
            // Let's assume literal means literal.
            // If user wants to hide datatypes, maybe no-literals covers it? Or separate flag.

            if (config.noInstances && kind === 'instance') {
                console.log('Filtered Instance:', id);
                return false;
            }
            if (config.noClasses && (kind === 'class' || kind === 'external-class')) {
                console.log('Filtered Class:', id);
                return false;
            }
            if (config.noExternal && kind === 'external-class') {
                console.log('Filtered External:', id);
                return false;
            }


            // Shorten Label for display
            let label = getLabel(term);
            if (kind === 'literal' && label.length > 20) {
                label = label.substring(0, 20) + '...';
            }

            nodes.set(id, {
                data: {
                    id: id,
                    label: label,
                    fullLabel: getLabel(term),
                    kind: kind
                }
            });
            return true;
        };

        store.quads.forEach(quad => {
            const subjectExists = createNode(quad.subject);
            const objectExists = createNode(quad.object);

            // Only add edge if both nodes exist (not filtered out)
            if (!subjectExists || !objectExists) return;

            let kind = 'semantic'; // Default: Category C
            let label = getLabel(quad.predicate);

            // Classification Logic
            if (quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                kind = 'membership'; // Category B
                label = 'a';
            } else if (quad.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#subClassOf') {
                kind = 'hierarchy'; // Category A
                label = 'subClassOf';
            } else if (quad.object.termType === 'Literal') {
                kind = 'data'; // Category D
            }

            edges.push({
                data: {
                    source: quad.subject.value,
                    target: quad.object.value,
                    label: label,
                    kind: kind
                }
            });
        });

        initCytoscape(container, Array.from(nodes.values()), edges);
    }
}

function renderGraphs() {
    const elements = document.getElementsByClassName('semantic-graph');
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const configRaw = el.dataset.config;

        // Ensure we re-render if config changed, even if processed before
        if (el.dataset.processed === 'true' && el.dataset.processedConfig === configRaw) {
            continue;
        }

        el.dataset.processed = 'true';
        el.dataset.processedConfig = configRaw; // Store config to detect changes

        const content = decodeURIComponent(el.dataset.content || '');
        const config = configRaw ? JSON.parse(decodeURIComponent(configRaw)) : {};

        renderSingleGraph(el, content, config);
    }
}

// Initial render
renderGraphs();
highlightCodeBlocks();

// Listen for updates
window.addEventListener('vscode.markdown.updateContent', () => {
    renderGraphs();
    highlightCodeBlocks();
});

function highlightCodeBlocks() {
    document.querySelectorAll('pre code').forEach((block) => {
        const el = block as HTMLElement;
        // Check if it has language-turtle or language-rdf or language-n3
        if (el.className.includes('language-turtle') ||
            el.className.includes('language-rdf') ||
            el.className.includes('language-n3')) {

            // Allow HLJS to auto-detect from class name 'language-turtle' which we registered
            hljs.highlightElement(el);
        }
    });
}
