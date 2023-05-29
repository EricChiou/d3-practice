import * as d3 from 'd3';

import { TopoConfig, TopoNode, TopoLink, TopoGroupData, TopoGroupLink, TopoGroupNode } from './types';

export default class Topo {
  private static readonly NodePreClass = 'node';
  private static readonly LinkPreClass = 'link';
  private static readonly NodeG = 'nodes';
  private static readonly LinkG = 'links';

  private static readonly DefaultNodeRadius = 5;
  private static readonly DefaultNodeColor = '#000';
  private static readonly DefaultNodeOpacity = 1;

  private static readonly DefaultLinkWidth = 2;
  private static readonly DefaultLinkColor = '#aaa';
  private static readonly DefaultLinkOpacity = 1;

  private static GetLinkClassName(link: TopoLink): string {
    return `${Topo.LinkPreClass}-${link.source}-${link.target}`;
  }

  private static GetNodeClassName(node: TopoNode): string {
    return `${Topo.NodePreClass}-${node.id}`;
  }

  private simulation: d3.Simulation<TopoGroupNode, TopoGroupLink>;
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private groupData: TopoGroupData;

  private renderSVG(config: TopoConfig): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    const { root, width, height, onClick, onContextmenu } = config;
    const svg = d3.select(root).append('svg')
      .attr('display', 'block')
      .attr('width', width)
      .attr('height', height)
      .on('click', (e: PointerEvent) => onClick?.(e, this.groupData))
      .on('contextmenu', (e: PointerEvent) => onContextmenu?.(e, this.groupData));
    svg.append('g').attr('class', Topo.LinkG);
    svg.append('g').attr('class', Topo.NodeG);
    return svg;
  }

  private createSimulation(config: TopoConfig): d3.Simulation<TopoGroupNode, TopoGroupLink> {
    return d3.forceSimulation<TopoGroupNode, TopoGroupLink>()
      .force(
        'collide',
        d3.forceCollide<TopoGroupNode>().radius((node) => (node.radius || Topo.DefaultNodeRadius) + 1).iterations(3),
      )
      .force('charge', d3.forceManyBody())
      .on('tick', () => this.ticked(config, this.groupData));
  }

  private ticked(config: TopoConfig, groupData: typeof this.groupData) {
    groupData.nodes.forEach((node) => {
      let x = node.x;
      if (node.x < 0) { x = 0; }
      if (node.x > config.width) { x = config.width; }

      let y = node.y;
      if (node.y < 0) { y = 0; }
      if (node.y > config.height) { y = config.height; }

      node.el.attr('cx', x).attr('cy', y);
    });
    groupData.links.forEach((link) => link.el
      .attr('x1', link.source.x).attr('y1', link.source.y)
      .attr('x2', link.target.x).attr('y2', link.target.y),
    );
  }

  constructor(config: TopoConfig) {
    this.groupData = { nodes: [], links: [] };
    this.svg = this.renderSVG(config);
    this.simulation = this.createSimulation(config);
  }

  private renderLink(
    svg: typeof this.svg,
    nodes: TopoGroupNode[],
    link: TopoLink,
  ): string | undefined {
    if (this.groupData.links.some((groupData) => groupData.source.id === link.source && groupData.target.id === link.target)
      || this.groupData.links.some((groupData) => groupData.target.id === link.source && groupData.source.id === link.target)
    ) return `link(source: ${link.source}, target: ${link.target}) duplicated`;

    const source = nodes.find((node) => node.id === link.source);
    const target = nodes.find((node) => node.id === link.target);
    if (!source || !target) return `can not find link's source or target (source: ${link.source}, target: ${link.target})`;

    const line = svg.select(`.${Topo.LinkG}`)
      .append('line')
      .attr('class', Topo.GetLinkClassName(link))
      .attr('x1', source.x)
      .attr('y1', source.y)
      .attr('x2', target.x)
      .attr('y2', target.y)
      .attr('stroke-width', link.width || Topo.DefaultLinkWidth)
      .attr('stroke', link.color || Topo.DefaultLinkColor)
      .attr('opacity', link.opacity || Topo.DefaultLinkOpacity);
    this.groupData.links.push({ el: line, ...link, source, target });
  }

  private renderNode(simulation: typeof this.simulation, svg: typeof this.svg, node: TopoNode): string | undefined {
    if (this.groupData.nodes.some((groupData) => groupData.id === node.id)) return `node(id: ${node.id}) duplicated`;

    const { x, y, radius, color, opacity, onClick, onContextmenu } = node;
    const circle = svg.select(`.${Topo.NodeG}`)
      .append('circle')
      .attr('class', Topo.GetNodeClassName(node))
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', radius || Topo.DefaultNodeRadius)
      .attr('fill', color || Topo.DefaultNodeColor)
      .attr('opacity', opacity || Topo.DefaultNodeOpacity)
      .on('click', (e: PointerEvent) => onClick?.(e, groupNode, this.groupData))
      .on('contextmenu', (e: PointerEvent) => onContextmenu?.(e, groupNode, this.groupData));
    const groupNode = { el: circle, ...node };
    circle.call(this.drag(simulation, groupNode) as any);
    this.groupData.nodes.push(groupNode);
  }

  private drag(simulation: typeof this.simulation, node: TopoGroupNode): d3.DragBehavior<Element, unknown, unknown> {
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

  private render(nodes: TopoNode[], links: TopoLink[]): string[] {
    const errorMsg: string[] = [];

    nodes.forEach((node) => {
      const msg = this.renderNode(this.simulation, this.svg, node);
      msg && errorMsg.push(msg);
    });

    links.forEach((link) => {
      const msg = this.renderLink(this.svg, this.groupData.nodes, link);
      msg && errorMsg.push(msg);
    });

    this.simulation
      .nodes(this.groupData.nodes)
      .force('link', d3.forceLink<TopoGroupNode, TopoGroupLink>(this.groupData.links));

    return errorMsg;
  }

  public addData(data: { nodes: TopoNode[], links: TopoLink[] }): Promise<string[]> {
    return new Promise((resolve) => resolve(this.render(data.nodes, data.links)));
  }

  public addNode(node: TopoNode): Promise<void> {
    return new Promise((resolve, reject) => {
      const errorMsg = this.renderNode(this.simulation, this.svg, node);
      if (errorMsg) return reject(errorMsg);

      this.simulation.nodes(this.groupData.nodes);
      resolve();
    });
  }

  public addLink(link: TopoLink): Promise<void> {
    return new Promise((resolve, reject) => {
      const errorMsg = this.renderLink(this.svg, this.groupData.nodes, link);
      if (errorMsg) return reject(errorMsg);

      this.simulation.force('link', d3.forceLink<TopoGroupNode, TopoGroupLink>(this.groupData.links));
      resolve();
    });
  }
}
