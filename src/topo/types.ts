import { SimulationNodeDatum, SimulationLinkDatum, Selection } from 'd3';

export interface TopoConfig {
  root: string;
  width: number;
  height: number;
  onClick?: (event: PointerEvent, groupData: TopoGroupData) => void;
  onContextmenu?: (event: PointerEvent, groupData: TopoGroupData) => void;
}

export interface TopoNode extends SimulationNodeDatum {
  id: number | string;
  x: number;
  y: number;
  radius?: number;
  color?: string;
  opacity?: number;
  onContextmenu?: (event: PointerEvent, groupNode: TopoGroupNode, groupData: TopoGroupData) => void;
  onClick?: (event: PointerEvent, groupNode: TopoGroupNode, groupData: TopoGroupData) => void;
}

export interface LinkConfig {
  width?: number;
  color?: string;
  opacity?: number;
}

export interface TopoLink extends LinkConfig, SimulationLinkDatum<TopoNode> {
  source: TopoNode['id'];
  target: TopoNode['id'];
}

export interface TopoGroupNode extends TopoNode {
  el: Selection<SVGCircleElement, unknown, HTMLElement, unknown>;
}

export interface TopoGroupLink extends LinkConfig, SimulationLinkDatum<TopoGroupNode> {
  el: Selection<SVGLineElement, unknown, HTMLElement, unknown>;
  source: TopoGroupNode;
  target: TopoGroupNode;
}

export interface TopoGroupData {
  nodes: TopoGroupNode[];
  links: TopoGroupLink[];
}
