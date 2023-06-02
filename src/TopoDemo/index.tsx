import { useRef, useState, useCallback, useMemo, useEffect, memo } from 'react';

import Topo, { TopoConfig, TopoNode, TopoLink, TopoGroupData, TopoGroupNode } from '../topo';

import Action from './Action';
import DataList from './DataList';

interface Menu {
  show: boolean;
  x: number;
  y: number;
  node: TopoNode | null;
}

const TopoDemo = memo(() => {
  const buttonClass = 'px-2 py-0.5 text-white bg-sky-500 active:bg-sky-600';

  const topo = useRef<Topo | null>(null);
  const [topoData, setTopoData] = useState<TopoGroupData | null>(null);
  const [newNode, setNewNode] = useState<TopoNode>({ id: 'new node', x: 0, y: 0, radius: 1, color: 'node color' });
  const [newLink, setNewLink] = useState<TopoLink>({ source: '', target: '', width: 1, color: 'link color' });
  const [menu, setMenu] = useState<Menu>({ show: false, x: 0, y: 0, node: null });

  const nodeOnContextmenu = useCallback((event: PointerEvent, groupNode: TopoGroupNode) => {
    setMenu(() => ({ show: true, x: event.clientX, y: event.clientY, node: groupNode }));
  }, []);

  const config: TopoConfig = useMemo(() => ({
    root: '#topo',
    width: 600,
    height: 600,
    onClick: () => setMenu(() => ({ show: false, x: 0, y: 0, node: null })),
    onContextmenu: (event) => event.preventDefault(),
  }), []);
  const data = useMemo(() => ({
    nodes: [
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
    ],
    links: [
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
    ],
  }), []);

  useEffect(() => {
    if (topo.current) return;

    topo.current = new Topo(config);
    topo.current.addData(data).then((result) => setTopoData(() => ({ ...result.data })));
  }, []);

  function addNode(node: TopoNode) {
    if (!node.id) return;
    topo.current?.addNode({ ...node, onContextmenu: nodeOnContextmenu }).then((data) => setTopoData(() => ({ ...data })));
  }

  function addLink(link: TopoLink) {
    if (!link.source || !link.target) return;
    topo.current?.addLink(link).then((data) => setTopoData(() => ({ ...data })));
  }

  function removeNode(id: number | string) {
    topo.current?.removeNodes([id]).then((data) => setTopoData(() => ({ ...data })));
  }

  function removeLink(source: number | string, target: number | string) {
    topo.current?.removeLinks([{ source, target }]).then((data) => setTopoData(() => ({ ...data })));
  }

  return (<>
    <div className="flex px-2">
      <div className="flex-none mx-2 my-4">
        <Action
          buttonClass={buttonClass}
          config={config}
          topoData={topoData}
          newNode={newNode}
          newLink={newLink}
          setNewNode={(node) => setNewNode(() => node)}
          setNewLink={(link) => setNewLink(() => link)}
          addNode={addNode}
          addLink={addLink}
        ></Action>
      </div>
      <div className="flex-none mx-2 my-4">
        <DataList
          buttonClass={buttonClass}
          topoData={topoData}
          newLink={newLink}
          removeNode={removeNode}
          removeLink={removeLink}
        ></DataList>
      </div>
      <div className="flex-none mx-2 my-4">
        <div id="topo" className="border border-black"></div>
        <div className="mt-1 text-right">
          <button className={`${buttonClass} mr-2`} onClick={() => topo.current?.startSimulation()}>Start</button>
          <button className={buttonClass} onClick={() => topo.current?.stopSimulation()}>Stop</button>
        </div>
      </div>
    </div>
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
});

export default TopoDemo;
