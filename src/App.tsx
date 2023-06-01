import { useState, FC, useEffect, useRef } from 'react';

import Topo, { TopoConfig, TopoNode, TopoLink, TopoGroupData, TopoGroupNode } from './topo';

const App: FC = () => {
  const buttonClass = 'px-2 py-0.5 text-white bg-sky-500 active:bg-sky-600';
  const inputClass = 'px-1 w-48 text-right border border-black outline-none';
  const [menu, setMenu] = useState<{ show: boolean, x: number, y: number, node: TopoNode | null }>({
    show: false,
    x: 0,
    y: 0,
    node: null,
  });
  const topo = useRef<Topo | null>(null);
  const [topoData, setTopoData] = useState<TopoGroupData | null>(null);
  const [newNode, setNewNode] = useState({ id: 'new node', x: 0, y: 0, radius: 1, color: 'node color' });
  const [newLink, setNewLink] = useState({ source: '', target: '', width: 1, color: 'link color' });
  const interval = useRef<number | null>(null);
  const config: TopoConfig = {
    root: '#topo',
    width: 600,
    height: 600,
    onClick: () => setMenu(() => ({ show: false, x: 0, y: 0, node: null })),
    onContextmenu: (event) => event.preventDefault(),
  };
  const nodes: TopoNode[] = [
    {
      id: 'red',
      x: 250,
      y: 250,
      radius: 5,
      color: 'red',
      onContextmenu: nodeOnContextmenu,
    },
    {
      id: 'green',
      x: 300,
      y: 300,
      radius: 10,
      color: 'green',
      onContextmenu: nodeOnContextmenu,
    },
    {
      id: 'blue',
      x: 370,
      y: 170,
      radius: 15,
      color: 'blue',
      onContextmenu: nodeOnContextmenu,
    },
  ];
  const links: TopoLink[] = [
    {
      source: 'red',
      target: 'green',
      width: 2,
      color: '#aaa',
    },
    {
      source: 'green',
      target: 'blue',
      width: 6,
      color: 'red',
    },
  ];
  const data = useRef({ nodes, links });

  useEffect(() => {
    if (topo.current) return;

    topo.current = new Topo(config);
    topo.current.addData(data.current).then((result) => setTopoData(() => ({ ...result.data })));

    return () => { interval.current && clearInterval(interval.current); };
  }, []);

  function nodeOnContextmenu(event: PointerEvent, groupNode: TopoGroupNode) {
    setMenu(() => ({ show: true, x: event.clientX, y: event.clientY, node: groupNode }));
  }

  function addNode() {
    if (!newNode.id) return;
    topo.current?.addNode({ ...newNode, onContextmenu: nodeOnContextmenu }).then((data) => setTopoData(() => ({ ...data })));
  }

  function addLink() {
    if (!newLink.source || !newLink.target) return;
    topo.current?.addLink(newLink).then((data) => setTopoData(() => ({ ...data })));
  }

  function removeNode(id: number | string) {
    topo.current?.removeNodes([id]).then((data) => setTopoData(() => ({ ...data })));
  }

  function removeLink(source: number | string, target: number | string) {
    topo.current?.removeLinks([{ source, target }]).then((data) => setTopoData(() => ({ ...data })));
  }

  function renderSelectedNode(id: number | string) {
    const node = topoData?.nodes.find((node) => node.id === id);
    node && (
      node.el.attr('stroke', 'rgb(74 222 128)'),
      node.el.attr('stroke-width', 2)
    );
  }

  return (<>
    <div className="flex">
      <div className="flex-none m-4">
        <div className="mb-8">
          <div className="mb-2">
            <span className="inline-block w-32">Node ID:</span>
            <input
              className={inputClass}
              value={newNode.id}
              onChange={(e) => setNewNode((value) => ({ ...value, id: e.target.value }))}
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
              onChange={(e) => setNewNode((value) => ({ ...value, x: Number(e.target.value) }))}
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
              onChange={(e) => setNewNode((value) => ({ ...value, y: Number(e.target.value) }))}
            ></input>
          </div>
          <div className="mb-2">
            <span className="inline-block w-32">Node Radius:</span>
            <input
              className={inputClass}
              type="number"
              min="1"
              value={newNode.radius}
              onChange={(e) => setNewNode((value) => ({ ...value, radius: Number(e.target.value) }))}
            ></input>
          </div>
          <div className="mb-2">
            <span className="inline-block w-32">Node Color:</span>
            <input
              className={inputClass}
              value={newNode.color}
              onChange={(e) => setNewNode((value) => ({ ...value, color: e.target.value }))}
            ></input>
          </div>
          <div className="text-right">
            <button className={buttonClass} onClick={() => addNode()}>Add Node</button>
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
                setNewLink((value) => ({ ...value, source: e.target.value }));
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
                setNewLink((value) => ({ ...value, target: e.target.value }));
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
              onChange={(e) => setNewLink((value) => ({ ...value, width: Number(e.target.value) }))}
            ></input>
          </div>
          <div className="mb-2">
            <span className="inline-block w-32">Link Color:</span>
            <input
              className={inputClass}
              value={newLink.color}
              onChange={(e) => setNewLink((value) => ({ ...value, color: e.target.value }))}
            ></input>
          </div>
          <div className="text-right">
            <button className={buttonClass} onClick={() => addLink()}>Add Link</button>
          </div>
        </div>
      </div>
      <div className="flex-none m-4 ml-0">
        <div className="mb-4">
          <div className="text-xl">Node List</div>
          {topoData?.nodes.map((node) =>
            <div
              className="flex py-1 border-b border-gray-400 hover:bg-gray-200"
              key={node.id}
              onMouseEnter={() => {
                node.el.attr('stroke', 'gray');
                node.el.attr('stroke-width', 2);

                interval.current && clearInterval(interval.current);
                interval.current = setInterval(() => {
                  const currentStroke = node.el.attr('stroke');
                  currentStroke === 'none'
                    ? node.el.attr('stroke', 'gray')
                    : node.el.attr('stroke', 'none');
                }, 500);
              }}
              onMouseLeave={() => {
                interval.current && clearInterval(interval.current);
                newLink.source === node.id || newLink.target === node.id
                  ? node.el.attr('stroke', 'rgb(74 222 128)')
                  : node.el.attr('stroke', 'none');
              }}
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
              className="flex py-1 border-b border-gray-400 hover:bg-gray-200"
              key={`${link.source.id}-${link.target.id}`}
              onMouseEnter={() => {
                const width = (link.width || Topo.DefaultLinkWidth);
                link.el.attr('stroke-width', width * 2);

                interval.current && clearInterval(interval.current);
                interval.current = setInterval(() => {
                  link.el.attr('stroke-width', Number(link.el.attr('stroke-width')) > width ? width : width * 2);
                }, 500);
              }}
              onMouseLeave={() => {
                interval.current && clearInterval(interval.current);
                link.el.attr('stroke-width', link.width || Topo.DefaultLinkWidth);
              }}
            >
              <div className="flex-none w-40">
                Source: {link.source.id}<br></br>
                Target: {link.target.id}
              </div>
              <div className="flex-none">
                <button className={buttonClass} onClick={() => removeLink(link.source.id, link.target.id)}>Remove</button>
              </div>
            </div>,
          )}
        </div>
      </div>
      <div className="flex-none mt-4">
        <div id="topo" className="border border-black"></div>
        <div className="mt-1 text-right">
          <button className={`${buttonClass} mr-2`} onClick={() => topo.current?.startSimulation()}>Start</button>
          <button className={buttonClass} onClick={() => topo.current?.stopSimulation()}>Stop</button>
        </div>
      </div>
    </div >
    <div
      className="fixed py-2 px-3 border border-black bg-gray-300"
      style={{ display: menu.show ? 'block' : 'none', left: menu.x, top: menu.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      ID: {menu.node?.id}
      <br />
      <button
        className="px-1 hover:bg-gray-400 active:bg-gray-500"
        onClick={() => {
          menu.node && topo.current?.startAddLink(menu.node.id);
          setMenu(() => ({ show: false, x: 0, y: 0, node: null }));
        }}
      >
        Add Link
      </button>
      <br />
      <button
        className="px-1 hover:bg-gray-400 active:bg-gray-500"
        onClick={() => {
          menu.node && removeNode(menu.node.id);
          setMenu(() => ({ show: false, x: 0, y: 0, node: null }));
        }}
      >
        Remove
      </button>
    </div>
  </>);
};

export default App;
