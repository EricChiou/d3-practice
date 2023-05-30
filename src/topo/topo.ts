import * as d3 from 'd3';

import { TopoConfig, TopoNode, TopoLink, TopoGroupData, TopoGroupLink, TopoGroupNode } from './types';

export default class Topo {
  public static readonly NodePreClassName = 'node';
  public static readonly LinkPreClassName = 'link';
  public static readonly NodeGClassName = 'nodes';
  public static readonly LinkGClassName = 'links';

  public static readonly DefaultNodeRadius = 5;
  public static readonly DefaultNodeColor = '#000';
  public static readonly DefaultNodeOpacity = 1;

  public static readonly DefaultLinkWidth = 2;
  public static readonly DefaultLinkColor = '#aaa';
  public static readonly DefaultLinkOpacity = 1;

  private static GetLinkClassName(link: TopoLink): string {
    return `${Topo.LinkPreClassName}-${link.source}-${link.target}`;
  }

  private static GetNodeClassName(node: TopoNode): string {
    return `${Topo.NodePreClassName}-${node.id}`;
  }

  private simulation: d3.Simulation<TopoGroupNode, TopoGroupLink>;
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private groupData: TopoGroupData;
  private run = true;

  private renderSVG(config: TopoConfig): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    const { root, width, height, onClick, onContextmenu } = config;
    const svg = d3.select(root).append('svg')
      .attr('display', 'block')
      .attr('width', width)
      .attr('height', height)
      .on('click', (e: PointerEvent) => onClick?.(e, this.groupData))
      .on('contextmenu', (e: PointerEvent) => onContextmenu?.(e, this.groupData));
    svg.append('g').attr('class', Topo.LinkGClassName);
    svg.append('g').attr('class', Topo.NodeGClassName);
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
    if (link.source === link.target)
      return `link(source: ${link.source}, target: ${link.target}) source can't equal to target`;

    const source = nodes.find((node) => node.id === link.source);
    const target = nodes.find((node) => node.id === link.target);
    if (!source || !target) return `can not find link's source or target (source: ${link.source}, target: ${link.target})`;

    const line = svg.select(`.${Topo.LinkGClassName}`)
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
    const circle = svg.select(`.${Topo.NodeGClassName}`)
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
      this.run && (node.fx = null, node.fy = null);
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
      .force('link', d3.forceLink(this.groupData.links));

    return errorMsg;
  }

  public addData(data: { nodes: TopoNode[], links: TopoLink[] }): Promise<{ data: TopoGroupData, errorMsg: string[] }> {
    return new Promise((resolve) => resolve({ data: this.groupData, errorMsg: this.render(data.nodes, data.links) }));
  }

  public addNode(node: TopoNode): Promise<TopoGroupData> {
    return new Promise((resolve, reject) => {
      const errorMsg = this.renderNode(this.simulation, this.svg, node);
      if (errorMsg) return reject(errorMsg);

      this.simulation.nodes(this.groupData.nodes);
      resolve(this.groupData);
    });
  }

  public addLink(link: TopoLink): Promise<TopoGroupData> {
    return new Promise((resolve, reject) => {
      const errorMsg = this.renderLink(this.svg, this.groupData.nodes, link);
      if (errorMsg) return reject(errorMsg);

      this.simulation.force('link', d3.forceLink(this.groupData.links));
      resolve(this.groupData);
    });
  }

  public removeNodes(ids: (number | string)[]): Promise<TopoGroupData> {
    return new Promise((resolve) => {
      ids.forEach((id) => {
        const index = this.groupData.nodes.findIndex((node) => node.id === id);
        if (index < 0) return;

        this.groupData.nodes[index].el.remove();
        this.groupData.nodes.splice(index, 1);
        for (let i = (this.groupData.links.length - 1); i >= 0; i--) {
          if (this.groupData.links[i].source.id === id || this.groupData.links[i].target.id === id) {
            this.groupData.links[i].el.remove();
            this.groupData.links.splice(i, 1);
          }
        }
      });

      this.simulation.nodes(this.groupData.nodes);
      this.simulation.force('link', d3.forceLink(this.groupData.links));
      resolve(this.groupData);
    });
  }

  public removeLinks(ids: { source: number | string, target: number | string }[]): Promise<TopoGroupData> {
    return new Promise((resolve) => {
      ids.forEach((id) => {
        const index = this.groupData.links.findIndex((link) => link.source.id === id.source && link.target.id === id.target);
        if (index < 0) return;

        this.groupData.links[index].el.remove();
        this.groupData.links.splice(index, 1);
      });
      this.simulation.force('link', d3.forceLink(this.groupData.links));
      resolve(this.groupData);
    });
  }

  public startSimulation() {
    this.run = true;
    this.groupData.nodes.forEach((node) => { node.fx = null; node.fy = null; });
  }

  public stopSimulation() {
    this.run = false;
    this.groupData.nodes.forEach((node) => { node.fx = node.x; node.fy = node.y; });
  }
}
