import { SimulationNodeDatum, SimulationLinkDatum, Selection } from 'd3';

export interface TopoConfig {
  root: string;
  width: number;
  height: number;
  onClick?: (event: PointerEvent, groupData: TopoGroupData) => void;
  onContextmenu?: (event: PointerEvent, groupData: TopoGroupData) => void;
  nodeOnContextmenu?: (event: PointerEvent, groupNode: TopoGroupNode, groupData: TopoGroupData) => void;
  nodeOnClick?: (event: PointerEvent, groupNode: TopoGroupNode, groupData: TopoGroupData) => void;
}

export interface TopoNode extends SimulationNodeDatum {
  id: number | string;
  x: number;
  y: number;
  radius?: number;
  color?: string;
  opacity?: number;
}

export interface TopoLink extends SimulationLinkDatum<TopoNode> {
  source: TopoNode;
  target: TopoNode;
  width?: number;
  color?: string;
  opacity?: number;
}

export interface TopoData {
  nodes: TopoNode[];
  links: TopoLink[];
}

export interface TopoGroupNode {
  el: Selection<SVGCircleElement, unknown, HTMLElement, unknown>;
  data: TopoNode;
}

export interface TopoGroupLink {
  el: Selection<SVGLineElement, unknown, HTMLElement, unknown>,
  data: TopoLink,
}

export interface TopoGroupData {
  nodes: TopoGroupNode[];
  links: TopoGroupLink[];
}
