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
    nodeOnContextmenu: (event, groupNode) =>
      setMenu(() => ({ show: true, x: event.clientX, y: event.clientY, node: groupNode.data })),
  };
  const nodes: TopoNode[] = [
    {
      id: 0,
      x: 250,
      y: 250,
      radius: 5,
      color: 'red',
    },
    {
      id: 1,
      x: 300,
      y: 300,
      radius: 10,
      color: 'green',
    },
    {
      id: 2,
      x: 370,
      y: 170,
      radius: 15,
      color: 'blue',
    },
  ];
  const links: TopoLink[] = [
    {
      source: nodes[0],
      target: nodes[1],
      width: 2,
      color: '#aaa',
    },
    {
      source: nodes[1],
      target: nodes[2],
      width: 6,
      color: 'red',
    },
  ];
  const data = useRef({ nodes, links });

  useEffect(() => {
    if (topo.current) return;

    topo.current = new Topo(config, data.current);
    topo.current.render();
  }, []);

  function addNode() {
    const node: TopoNode = { id: 3, x: 300, y: 300, radius: 6, color: '#598', opacity: 0.7 };
    topo.current?.addNode(node);
  }

  function addLink() {
    const link = { source: data.current.nodes[1], target: data.current.nodes[3] };
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
