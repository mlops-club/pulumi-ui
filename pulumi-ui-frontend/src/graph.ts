import { Node, Edge, MarkerType } from '@xyflow/react';
import { Resource } from './types';
import dagre from 'dagre';

const nodeWidth = 220;
const nodeHeight = 40;

export interface GraphData {
    nodes: Node[];
    edges: Edge[];
}

interface DependencyInfo {
    source: string;
    target: string;
    relationships: { input: string; output: string; value: string }[];
}

export function createGraph(
    resources: Resource[],
    stackName: string,
    expandedNodes: Set<string>,
    algorithm: 'parent-child' | 'dependency',
    toggleNodeExpansion: (nodeId: string) => void
): GraphData {
    if (algorithm === 'parent-child') {
        return createParentChildGraph(resources, expandedNodes, toggleNodeExpansion);
    } else {
        return createDependencyGraph(resources);
    }
}

function createParentChildGraph(
    resources: Resource[],
    expandedNodes: Set<string>,
    toggleNodeExpansion: (nodeId: string) => void
): GraphData {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const addNodeAndChildren = (resource: Resource, depth: number = 0, parentX: number = 0) => {
        const isExpanded = true; // Always expanded in parent-child view
        const node: Node = {
            id: resource.urn,
            type: 'custom',
            data: {
                name: resource.urn.split('::').pop() || '',
                type: resource.type,
                hasChildren: resources.some((r) => r.parent === resource.urn),
                isExpanded,
                onToggle: () => toggleNodeExpansion(resource.urn),
                parent: resource.parent,
            },
            position: { x: parentX + nodeWidth + 50, y: 0 },
            draggable: true,
        };
        nodes.push(node);

        if (resource.parent) {
            edges.push({
                id: `${resource.parent}-${resource.urn}`,
                source: resource.parent,
                target: resource.urn,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
            });
        }

        // Always process children in parent-child view
        resources
            .filter((r) => r.parent === resource.urn)
            .forEach((child, index) => addNodeAndChildren(child, depth + 1, node.position.x));
    };

    resources.filter((r) => !r.parent).forEach((r, index) => addNodeAndChildren(r, 0, index * (nodeWidth + 50)));

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', ranksep: 60, nodesep: 30 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
}

function createDependencyGraph(resources: Resource[]): GraphData {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const dependencies = findAllDependencies(resources);

    resources.forEach((resource) => {
        nodes.push({
            id: resource.urn,
            type: 'custom',
            data: {
                name: resource.urn.split('::').pop() || '',
                type: resource.type,
                hasChildren: false,
                isExpanded: false,
                onToggle: () => { },
            },
            position: { x: 0, y: 0 },
            draggable: true,
        });
    });

    dependencies.forEach((dep) => {
        edges.push({
            id: `${dep.source}-${dep.target}`,
            source: dep.source,
            target: dep.target,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { relationships: dep.relationships },
        });
    });

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', ranksep: 80, nodesep: 40 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
}

function findAllDependencies(resources: Resource[]): DependencyInfo[] {
    const dependencies: DependencyInfo[] = [];

    for (let i = 0; i < resources.length; i++) {
        for (let j = 0; j < resources.length; j++) {
            if (i !== j) {
                const sourceResource = resources[i];
                const targetResource = resources[j];

                const arnDependencies = findArnDependencies(sourceResource, targetResource);
                const idDependencies = findIdDependencies(sourceResource, targetResource);
                const urlDependencies = findUrlDependencies(sourceResource, targetResource);

                const allDependencies = [...arnDependencies, ...idDependencies, ...urlDependencies];

                if (allDependencies.length > 0) {
                    dependencies.push({
                        source: sourceResource.urn,
                        target: targetResource.urn,
                        relationships: allDependencies,
                    });
                }
            }
        }
    }

    return dependencies;
}

function findArnDependencies(sourceResource: Resource, targetResource: Resource): { input: string; output: string; value: string }[] {
    const dependencies: { input: string; output: string; value: string }[] = [];

    for (const [inputKey, inputValue] of Object.entries(sourceResource.inputs || {})) {
        if (typeof inputValue === 'string' && inputValue.startsWith('arn:')) {
            for (const [outputKey, outputValue] of Object.entries(targetResource.outputs || {})) {
                if (inputValue === outputValue) {
                    dependencies.push({ input: inputKey, output: outputKey, value: inputValue });
                }
            }
        }
    }

    return dependencies;
}

function findIdDependencies(sourceResource: Resource, targetResource: Resource): { input: string; output: string; value: string }[] {
    const dependencies: { input: string; output: string; value: string }[] = [];
    const idRegex = /-[A-Za-z0-9]{7}$/;

    for (const [inputKey, inputValue] of Object.entries(sourceResource.inputs || {})) {
        if (typeof inputValue === 'string' && idRegex.test(inputValue)) {
            for (const [outputKey, outputValue] of Object.entries(targetResource.outputs || {})) {
                if (inputValue === outputValue) {
                    dependencies.push({ input: inputKey, output: outputKey, value: inputValue });
                }
            }
        }
    }

    return dependencies;
}

function findUrlDependencies(sourceResource: Resource, targetResource: Resource): { input: string; output: string; value: string }[] {
    const dependencies: { input: string; output: string; value: string }[] = [];
    const urlRegex = /^(http|https):\/\/[^ "]+$/;

    for (const [inputKey, inputValue] of Object.entries(sourceResource.inputs || {})) {
        if (typeof inputValue === 'string' && urlRegex.test(inputValue)) {
            for (const [outputKey, outputValue] of Object.entries(targetResource.outputs || {})) {
                if (inputValue === outputValue) {
                    dependencies.push({ input: inputKey, output: outputKey, value: inputValue });
                }
            }
        }
    }

    return dependencies;
}