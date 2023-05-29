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

export interface TopoLink extends SimulationLinkDatum<TopoNode> {
  source: TopoNode['id'];
  target: TopoNode['id'];
  width?: number;
  color?: string;
  opacity?: number;
}

export interface TopoGroupNode extends TopoNode {
  el: Selection<SVGCircleElement, unknown, HTMLElement, unknown>;
}

export interface TopoGroupLink extends SimulationLinkDatum<TopoGroupNode> {
  el: Selection<SVGLineElement, unknown, HTMLElement, unknown>;
  source: TopoGroupNode;
  target: TopoGroupNode;
  width?: number;
  color?: string;
  opacity?: number;
}

export interface TopoGroupData {
  nodes: TopoGroupNode[];
  links: TopoGroupLink[];
}
