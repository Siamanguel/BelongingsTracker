// utils.js
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const findNodePath = (nodes, targetId, path = []) => {
  for (const node of nodes) {
    const currentPath = [...path, node.name];
    if (node.id === targetId) return currentPath;
    const found = findNodePath(node.children, targetId, currentPath);
    if (found) return found;
  }
  return null;
};

export const searchNodes = (nodes, term) => {
  const results = [];
  const searchRecursive = (nodeList, path = []) => {
    nodeList.forEach(node => {
      const currentPath = [...path, node.name];
      if (node.name.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          node,
          path: currentPath,
          hasChildren: node.children.length > 0
        });
      }
      if (node.children.length > 0) {
        searchRecursive(node.children, currentPath);
      }
    });
  };
  searchRecursive(nodes);
  return results;
};

export const deleteFromNodes = (nodes, nodeId) => {
  return nodes.filter(node => {
    if (node.id === nodeId) return false;
    node.children = deleteFromNodes(node.children, nodeId);
    return true;
  });
};

export const updateNodeInTree = (nodes, nodeId, updates) => {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return { ...node, ...updates };
    }
    return { ...node, children: updateNodeInTree(node.children, nodeId, updates) };
  });
};

export const addItemToNode = (nodes, parentId, newItem) => {
  return nodes.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, newItem] };
    }
    return { ...node, children: addItemToNode(node.children, parentId, newItem) };
  });
};

// NEW: Move item between parents
export const moveItemToNode = (nodes, itemId, newParentId) => {
  let itemToMove = null;

  // First, find and remove the item
  const removeItem = (nodeList) => {
    return nodeList.filter(node => {
      if (node.id === itemId) {
        itemToMove = node;
        return false;
      }
      node.children = removeItem(node.children);
      return true;
    });
  };

  let newNodes = removeItem(nodes);

  // Then add it to the new parent (or root if newParentId is null)
  if (itemToMove) {
    if (newParentId) {
      newNodes = addItemToNode(newNodes, newParentId, itemToMove);
    } else {
      newNodes = [...newNodes, itemToMove];
    }
  }

  return newNodes;
};

// NEW: Toggle checkout status
export const toggleCheckout = (nodes, nodeId) => {
  return updateNodeInTree(nodes, nodeId, (node) => ({
    ...node,
    checkedOut: !node.checkedOut,
    checkoutDate: !node.checkedOut ? new Date().toISOString() : null
  }));
};

// NEW: Get all nodes as flat list for move dropdown
export const getAllNodes = (nodes, level = 0) => {
  const result = [];
  nodes.forEach(node => {
    result.push({ ...node, level });
    if (node.children.length > 0) {
      result.push(...getAllNodes(node.children, level + 1));
    }
  });
  return result;
};

export const getSampleData = () => [
  {
    id: '1',
    name: 'House',
    children: [
      {
        id: '2',
        name: 'Kitchen',
        children: [
          {
            id: '3',
            name: 'Pantry',
            children: [
              { id: '4', name: 'Superglue', children: [], checkedOut: false }
            ]
          },
          {
            id: '5',
            name: 'Drawer 1',
            children: [
              { id: '6', name: 'Measuring spoons', children: [], checkedOut: false },
              { id: '7', name: 'Can opener', children: [], checkedOut: true, checkoutDate: new Date().toISOString() }
            ]
          }
        ]
      },
      {
        id: '8',
        name: 'Bedroom',
        children: [
          {
            id: '9',
            name: 'Bedside table',
            children: [
              { id: '10', name: 'Passport', children: [], checkedOut: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '11',
    name: 'Office',
    children: [
      {
        id: '12',
        name: 'Desk',
        children: [
          { id: '13', name: 'Stapler', children: [], checkedOut: false },
          { id: '14', name: 'USB Cable', children: [], checkedOut: false }
        ]
      }
    ]
  }
];