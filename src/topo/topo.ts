import * as d3 from 'd3';

import { TopoConfig, TopoData, TopoNode, TopoLink, TopoGroupData } from './types';

export default class Topo {
  private static readonly NodePreClass = 'node';
  private static readonly LinkPreClass = 'link';
  private static readonly NodeG = 'nodes';
  private static readonly LinkG = 'links';
  private static readonly DefaultConfig = {
    NodeRadius: 5,
    NodeColor: '#000',
    NodeOpacity: 1,
    LinkWidth: 2,
    LinkColor: '#aaa',
    LinkOpacity: 1,
  };

  private static GetLinkClassName(link: TopoLink): string {
    return `${Topo.LinkPreClass}-${link.source.id}-${link.target.id}`;
  }

  private static GetNodeClassName(node: TopoNode): string {
    return `${Topo.NodePreClass}-${node.id}`;
  }

  private config: TopoConfig = { root: '', width: 200, height: 200 };
  private data: TopoData = { nodes: [], links: [] };
  private groupData: TopoGroupData = { nodes: [], links: [] };
  private simulation: d3.Simulation<TopoNode, TopoLink> | null = null;
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null;

  constructor(config?: TopoConfig, data?: TopoData) {
    this.setData(config, data);
  }

  private setData(config?: TopoConfig, data?: TopoData) {
    if (config) this.config = config;
    if (data) this.data = data;
  }

  public render(config?: TopoConfig, data?: TopoData): string[] | undefined {
    this.setData(config, data);
    if (!this.config || !this.data) return ['No topo config or topo data'];

    const errorMsg: string[] = [];
    const { root, width, height, onClick, onContextmenu, nodeOnClick, nodeOnContextmenu } = this.config;
    const { nodes, links } = this.data;

    const groupData: TopoGroupData = { nodes: [], links: [] };
    const simulation = d3.forceSimulation<TopoNode, TopoLink>()
      .force('collide', d3.forceCollide<TopoNode>().radius((node) => (node.radius || 5) + 1).iterations(3))
      .force('charge', d3.forceManyBody())
      .nodes(nodes)
      .force('link', d3.forceLink<TopoNode, TopoLink>(links))
      .on('tick', () => this.ticked(this.config, groupData));

    // create svg
    const svg = d3.select(root).append('svg')
      .attr('display', 'block')
      .attr('width', width)
      .attr('height', height)
      .on('click', (e: PointerEvent) => onClick?.(e, groupData))
      .on('contextmenu', (e: PointerEvent) => onContextmenu?.(e, groupData));
    svg.append('g').attr('class', Topo.LinkG);
    svg.append('g').attr('class', Topo.NodeG);

    // render links
    links.forEach((link) => {
      const source = nodes.find((node) => node.id === link.source.id);
      const target = nodes.find((node) => node.id === link.target.id);
      if (!source || !target) {
        errorMsg.push(`can not find link's source or target, ${JSON.stringify(link)}`);
        return;
      }

      const line = svg.select(`.${Topo.LinkG}`)
        .append('line')
        .attr('class', Topo.GetLinkClassName(link))
        .attr('x1', source.x)
        .attr('y1', source.y)
        .attr('x2', target.x)
        .attr('y2', target.y)
        .attr('stroke-width', link.width || Topo.DefaultConfig.LinkWidth)
        .attr('stroke', link.color || Topo.DefaultConfig.LinkColor)
        .attr('opacity', link.opacity || Topo.DefaultConfig.LinkOpacity);
      groupData.links.push({ el: line, data: link });
    });

    // render nodes
    nodes.forEach((node) => {
      const circle = svg.select(`.${Topo.NodeG}`)
        .append('circle')
        .attr('class', Topo.GetNodeClassName(node))
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('r', node.radius || Topo.DefaultConfig.NodeRadius)
        .attr('fill', node.color || Topo.DefaultConfig.NodeColor)
        .attr('opacity', node.opacity || Topo.DefaultConfig.NodeOpacity)
        .call(this.drag(simulation, node) as any)
        .on('click', (e: PointerEvent) => nodeOnClick?.(e, groupNode, groupData))
        .on('contextmenu', (e: PointerEvent) => nodeOnContextmenu?.(e, groupNode, groupData));
      const groupNode = { el: circle, data: node };
      groupData.nodes.push(groupNode);
    });

    // save data
    this.groupData = groupData;
    this.svg = svg;
    this.simulation = simulation;
    return errorMsg.length ? errorMsg : undefined;
  }

  private ticked(config: TopoConfig, groupData: TopoGroupData) {
    groupData.nodes.forEach((node) => {
      let x = node.data.x;
      if (node.data.x < 0) { x = 0; }
      if (node.data.x > config.width) { x = config.width; }

      let y = node.data.y;
      if (node.data.y < 0) { y = 0; }
      if (node.data.y > config.height) { y = config.height; }

      node.el.attr('cx', x).attr('cy', y);
    });
    groupData.links.forEach((link) => link.el
      .attr('x1', link.data.source.x).attr('y1', link.data.source.y)
      .attr('x2', link.data.target.x).attr('y2', link.data.target.y),
    );
  }

  private drag(simulation: d3.Simulation<TopoNode, TopoLink>, node: TopoNode): d3.DragBehavior<Element, unknown, unknown> {

    const dragstarted = (event: d3.D3DragEvent<SVGCircleElement, TopoNode, d3.SubjectPosition>) => {
      if (!event.active) simulation.alphaTarget(0.1).restart();
      node.fx = node.x;
      node.fy = node.y;
    };

    const dragged = (event: d3.D3DragEvent<SVGCircleElement, TopoNode, d3.SubjectPosition>) => {
      node.fx = event.x;
      node.fy = event.y;
    };

    const dragended = (event: d3.D3DragEvent<SVGCircleElement, TopoNode, d3.SubjectPosition>) => {
      if (!event.active) simulation.alphaTarget(0);
      node.fx = null;
      node.fy = null;
    };

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  public addNode(node: TopoNode): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.data.nodes.some((data) => data.id === node.id)) return reject('node id duplicated');
      if (!this.svg || !this.simulation) return reject('topo not render yet');

      const circle = this.svg.select(`.${Topo.NodeG}`)
        .append('circle')
        .attr('class', Topo.GetNodeClassName(node))
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('r', node.radius || Topo.DefaultConfig.NodeRadius)
        .attr('fill', node.color || Topo.DefaultConfig.NodeColor)
        .attr('opacity', node.opacity || Topo.DefaultConfig.NodeOpacity)
        .call(this.drag(this.simulation, node) as any)
        .on('click', (e: PointerEvent) => this.config.nodeOnClick?.(e, groupNode, this.groupData))
        .on('contextmenu', (e: PointerEvent) => this.config.nodeOnContextmenu?.(e, groupNode, this.groupData));
      const groupNode = { el: circle, data: node };

      this.data.nodes.push(node);
      this.groupData.nodes.push(groupNode);
      this.simulation.nodes(this.data.nodes);
      resolve();
    });
  }

  public addLink(link: TopoLink): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!link.source || !link.target) return reject('can not find link\'s source or target');
      if (this.data.links.some((data) => data.source.id === link.source.id && data.target.id === link.target.id)
        || this.data.links.some((data) => data.target.id === link.source.id && data.source.id === link.target.id)
      ) return reject('link\'s source and target duplicated');
      if (!this.svg || !this.simulation) return reject('topo not render yet');

      const line = this.svg.select(`.${Topo.LinkG}`)
        .append('line')
        .attr('class', Topo.GetLinkClassName(link))
        .attr('x1', link.source.x)
        .attr('y1', link.source.y)
        .attr('x2', link.target.x)
        .attr('y2', link.target.y)
        .attr('stroke-width', link.width || Topo.DefaultConfig.LinkWidth)
        .attr('stroke', link.color || Topo.DefaultConfig.LinkColor)
        .attr('opacity', link.opacity || Topo.DefaultConfig.LinkOpacity);

      this.data.links.push(link);
      this.groupData.links.push({ el: line, data: link });
      this.simulation.force('link', d3.forceLink<TopoNode, TopoLink>(this.data.links));
      resolve();
    });
  }
}
