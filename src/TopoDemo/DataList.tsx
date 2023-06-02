import { useRef, useEffect } from 'react';
import Topo, { TopoGroupData, TopoGroupLink, TopoGroupNode, TopoLink, TopoNode } from '../topo';

interface Props {
  buttonClass: string;
  topoData: TopoGroupData | null;
  newLink: TopoLink;
  removeNode(id: TopoNode['id']): void;
  removeLink(source: TopoNode['id'], target: TopoNode['id']): void;
}

const DataList = ({ buttonClass, topoData, newLink, removeNode, removeLink }: Props) => {
  const dataClassName = 'flex py-1 border-b border-gray-400 hover:bg-gray-200';

  const interval = useRef<number | null>(null);

  useEffect(() => () => {
    interval.current && clearInterval(interval.current);
  }, []);

  function nodeOnMouseEnter(node: TopoGroupNode) {
    node.el.attr('stroke', 'gray');
    node.el.attr('stroke-width', 2);

    interval.current && clearInterval(interval.current);
    interval.current = setInterval(() => {
      const currentStroke = node.el.attr('stroke');
      currentStroke === 'none'
        ? node.el.attr('stroke', 'gray')
        : node.el.attr('stroke', 'none');
    }, 500);
  }

  function nodeOnMouseLeave(node: TopoGroupNode) {
    interval.current && clearInterval(interval.current);
    newLink.source === node.id || newLink.target === node.id
      ? node.el.attr('stroke', 'rgb(74 222 128)')
      : node.el.attr('stroke', 'none');
  }

  function linkOnMouseEnter(link: TopoGroupLink) {
    const width = (link.width || Topo.DefaultLinkWidth);
    link.el.attr('stroke-width', width * 2);

    interval.current && clearInterval(interval.current);
    interval.current = setInterval(() => {
      link.el.attr('stroke-width', Number(link.el.attr('stroke-width')) > width ? width : width * 2);
    }, 500);
  }

  function linkOnMouseLeave(link: TopoGroupLink) {
    interval.current && clearInterval(interval.current);
    link.el.attr('stroke-width', link.width || Topo.DefaultLinkWidth);
  }

  return (<>
    <div className="mb-4">
      <div className="text-xl">Node List</div>
      {topoData?.nodes.map((node) =>
        <div
          className={dataClassName}
          key={node.id}
          onMouseEnter={() => nodeOnMouseEnter(node)}
          onMouseLeave={() => nodeOnMouseLeave(node)}
        >
          <div className="flex-none w-40">
            ID: {node.id}
          </div>
          <div className="flex-none">
            <button className={buttonClass} onClick={() => removeNode(node.id)}>Remove</button>
          </div>
        </div>,
      )}
    </div>
    <div>
      <div className="text-xl">Link List</div>
      {topoData?.links.map((link) =>
        <div
          className={dataClassName}
          key={`${link.source.id}-${link.target.id}`}
          onMouseEnter={() => linkOnMouseEnter(link)}
          onMouseLeave={() => linkOnMouseLeave(link)}
        >
          <div className="flex-none w-40">
            Source: {link.source.id}<br />
            Target: {link.target.id}
          </div>
          <div className="flex-none">
            <button className={buttonClass} onClick={() => removeLink(link.source.id, link.target.id)}>Remove</button>
          </div>
        </div>,
      )}
    </div>
  </>);
};

export default DataList;
