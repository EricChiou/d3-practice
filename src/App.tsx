import { useState, FC, useEffect, useRef } from 'react';

import Topo, { TopoConfig, TopoNode, TopoLink } from './topo';

const App: FC = () => {
  const [menu, setMenu] = useState<{ show: boolean, x: number, y: number, node: TopoNode | null }>({
    show: false,
    x: 0,
    y: 0,
    node: null,
  });
  const topo = useRef<Topo | null>(null);
  const config: TopoConfig = {
    root: '#topo',
    width: 600,
    height: 600,
    onClick: () => setMenu(() => ({ show: false, x: 0, y: 0, node: null })),
    onContextmenu: (event) => event.preventDefault(),
  };
  const nodes: TopoNode[] = [
    {
      id: 0,
      x: 250,
      y: 250,
      radius: 5,
      color: 'red',
      onContextmenu: (event, groupNode) =>
        setMenu(() => ({ show: true, x: event.clientX, y: event.clientY, node: groupNode })),
    },
    {
      id: 1,
      x: 300,
      y: 300,
      radius: 10,
      color: 'green',
      onContextmenu: (event, groupNode) =>
        setMenu(() => ({ show: true, x: event.clientX, y: event.clientY, node: groupNode })),
    },
    {
      id: 2,
      x: 370,
      y: 170,
      radius: 15,
      color: 'blue',
      onContextmenu: (event, groupNode) =>
        setMenu(() => ({ show: true, x: event.clientX, y: event.clientY, node: groupNode })),
    },
  ];
  const links: TopoLink[] = [
    {
      source: 0,
      target: 1,
      width: 2,
      color: '#aaa',
    },
    {
      source: 1,
      target: 2,
      width: 6,
      color: 'red',
    },
  ];
  const data = useRef({ nodes, links });

  useEffect(() => {
    if (topo.current) return;

    topo.current = new Topo(config);
    topo.current.addData(data.current);
  }, []);

  function addNode() {
    const node: TopoNode = { id: 3, x: 300, y: 300, radius: 6, color: '#598' };
    topo.current?.addNode(node);
  }

  function addLink() {
    const link = { source: 1, target: 3 };
    topo.current?.addLink(link);
  }

  return (<>
    <div>
      <button onClick={() => addNode()}>add node</button>
      <button onClick={() => addLink()}>add link</button>
    </div>
    <div id="topo" style={{ display: 'inline-block', border: '1px solid black' }}></div>
    <div
      style={{
        display: menu.show ? 'block' : 'none',
        position: 'fixed',
        left: menu.x,
        top: menu.y,
        padding: '0.5rem 0.75rem',
        width: '50px',
        height: '50px',
        border: 'solid 1px #000',
        backgroundColor: '#aaa',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >{menu.node?.id}</div>
  </>);
};

export default App;
