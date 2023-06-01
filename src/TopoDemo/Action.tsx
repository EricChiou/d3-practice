import { FC } from 'react';
import { TopoConfig, TopoGroupData, TopoLink, TopoNode } from '../topo';

interface Props {
  buttonClass: string;
  config: TopoConfig;
  topoData: TopoGroupData | null;
  newNode: TopoNode;
  newLink: TopoLink;
  setNewNode(node: TopoNode): void;
  setNewLink(link: TopoLink): void;
  addNode(node: TopoNode): void;
  addLink(link: TopoLink): void;
}

const Action: FC<Props> = ({
  buttonClass,
  config,
  topoData,
  newNode,
  newLink,
  setNewNode,
  setNewLink,
  addNode,
  addLink,
}) => {
  const inputClass = 'px-1 w-48 text-right border border-black outline-none';

  function renderSelectedNode(id: number | string) {
    const node = topoData?.nodes.find((node) => node.id === id);
    node && (
      node.el.attr('stroke', 'rgb(74 222 128)'),
      node.el.attr('stroke-width', 2)
    );
  }

  return (<>
    <div className="mb-8">
      <div className="mb-2">
        <span className="inline-block w-32">Node ID:</span>
        <input
          className={inputClass}
          value={newNode.id}
          onChange={(e) => setNewNode({ ...newNode, id: e.target.value })}
        ></input>
      </div>
      <div className="mb-2">
        <span className="inline-block w-32">Node X:</span>
        <input
          className={inputClass}
          value={newNode.x}
          type="number"
          min="0"
          max={config.width}
          onChange={(e) => setNewNode({ ...newNode, x: Number(e.target.value) })}
        ></input>
      </div>
      <div className="mb-2">
        <span className="inline-block w-32">Node Y:</span>
        <input
          className={inputClass}
          value={newNode.y}
          type="number"
          min="0"
          max={config.height}
          onChange={(e) => setNewNode({ ...newNode, y: Number(e.target.value) })}
        ></input>
      </div>
      <div className="mb-2">
        <span className="inline-block w-32">Node Radius:</span>
        <input
          className={inputClass}
          type="number"
          min="1"
          value={newNode.radius}
          onChange={(e) => setNewNode({ ...newNode, radius: Number(e.target.value) })}
        ></input>
      </div>
      <div className="mb-2">
        <span className="inline-block w-32">Node Color:</span>
        <input
          className={inputClass}
          value={newNode.color}
          onChange={(e) => setNewNode({ ...newNode, color: e.target.value })}
        ></input>
      </div>
      <div className="text-right">
        <button className={buttonClass} onClick={() => addNode(newNode)}>Add Node</button>
      </div>
    </div>
    <div>
      <div className="mb-2">
        <span className="inline-block w-32">Link Source:</span>
        <select
          className={inputClass}
          value={newLink.source}
          onChange={(e) => {
            const node = topoData?.nodes.find((node) => node.id === newLink.source && node.id !== newLink.target);
            node && node.el.attr('stroke', 'none');

            renderSelectedNode(e.target.value);
            setNewLink({ ...newLink, source: e.target.value });
          }}
        >
          <option value=""></option>
          {topoData?.nodes.map((node) =>
            <option key={node.id} value={node.id}>
              {node.id}
            </option>,
          )}
        </select>
      </div>
      <div className="mb-2">
        <span className="inline-block w-32">Link Target:</span>
        <select
          className={inputClass}
          value={newLink.target}
          onChange={(e) => {
            const node = topoData?.nodes.find((node) => node.id === newLink.target && node.id !== newLink.source);
            node && node.el.attr('stroke', 'none');

            renderSelectedNode(e.target.value);
            setNewLink({ ...newLink, target: e.target.value });
          }}
        >
          <option value=""></option>
          {topoData?.nodes.map((node) =>
            <option key={node.id} value={node.id}>
              {node.id}
            </option>,
          )}
        </select>
      </div>
      <div className="mb-2">
        <span className="inline-block w-32">Link Width:</span>
        <input
          className={inputClass}
          value={newLink.width}
          type="number"
          min="1"
          onChange={(e) => setNewLink({ ...newLink, width: Number(e.target.value) })}
        ></input>
      </div>
      <div className="mb-2">
        <span className="inline-block w-32">Link Color:</span>
        <input
          className={inputClass}
          value={newLink.color}
          onChange={(e) => setNewLink({ ...newLink, color: e.target.value })}
        ></input>
      </div>
      <div className="text-right">
        <button className={buttonClass} onClick={() => addLink(newLink)}>Add Link</button>
      </div>
    </div>
  </>);
};

export default Action;
