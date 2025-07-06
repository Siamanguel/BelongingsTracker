// App.js
import React, { useState } from 'react';
import './App.css';
import { 
  Header, 
  SearchBar, 
  Toolbar, 
  AddItemForm, 
  TreeNode, 
  SearchResults, 
  DetailsPanel,
  MoveModal 
} from './components';
import { useInventoryData, useDataManagement } from './hooks';
import { 
  generateId, 
  findNodePath, 
  searchNodes, 
  deleteFromNodes, 
  updateNodeInTree, 
  addItemToNode,
  moveItemToNode,
  toggleCheckout,
  getAllNodes
} from './utils';

const InventoryTracker = () => {
  const { locations, setLocations, expandedNodes, setExpandedNodes } = useInventoryData();
  const { exportData, importData, clearAllData } = useDataManagement(locations, setLocations, setExpandedNodes);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemParent, setNewItemParent] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);

  const toggleExpand = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAddLocation = () => {
    const name = prompt('Enter new location name:');
    if (name?.trim()) {
      const newItem = {
        id: generateId(),
        name: name.trim(),
        children: [],
        checkedOut: false
      };
      setLocations([...locations, newItem]);
    }
  };

  const handleClearAll = () => {
    if (clearAllData()) {
      setSelectedNode(null);
      setNewItemParent(null);
    }
  };

  const addItem = () => {
    if (!newItemName.trim()) return;

    const newItem = {
      id: generateId(),
      name: newItemName.trim(),
      children: [],
      checkedOut: false
    };

    if (newItemParent) {
      setLocations(addItemToNode(locations, newItemParent.id, newItem));
    } else {
      setLocations([...locations, newItem]);
    }

    setNewItemName('');
    setNewItemParent(null);
  };

  const deleteNode = (nodeId) => {
    setLocations(deleteFromNodes(locations, nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const updateNodeName = (nodeId, newName) => {
    if (!newName.trim()) return;
    setLocations(updateNodeInTree(locations, nodeId, { name: newName.trim() }));
    setEditingNode(null);
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setNewItemParent(node);
    const hasChildren = node.children.length > 0;
    if (hasChildren && !expandedNodes.has(node.id)) {
      setExpandedNodes(prev => new Set([...prev, node.id]));
    }
  };

  const handleMoveItem = (nodeId) => {
    setItemToMove(nodeId);
    setMoveModalOpen(true);
  };

  const executeMove = (newParentId) => {
    if (itemToMove) {
      setLocations(moveItemToNode(locations, itemToMove, newParentId));
      setMoveModalOpen(false);
      setItemToMove(null);
    }
  };

  const handleToggleCheckout = (nodeId) => {
    setLocations(toggleCheckout(locations, nodeId));
  };

  const renderNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isEditing = editingNode === node.id;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id}>
        <TreeNode
          node={node}
          level={level}
          isExpanded={isExpanded}
          isSelected={isSelected}
          isEditing={isEditing}
          hasChildren={hasChildren}
          onToggleExpand={(e) => {
            e.stopPropagation();
            toggleExpand(node.id);
          }}
          onSelect={() => handleNodeSelect(node)}
          onEdit={setEditingNode}
          onDelete={deleteNode}
          onMove={handleMoveItem}
          onToggleCheckout={handleToggleCheckout}
          onUpdateName={(name) => updateNodeName(node.id, name)}
        />

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const searchResults = searchTerm ? searchNodes(locations, searchTerm) : [];
  const selectedNodePath = selectedNode ? findNodePath(locations, selectedNode.id) : null;
  const allNodes = getAllNodes(locations);

  return (
    <div className="app">
      <Header />

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <Toolbar
        onAddLocation={handleAddLocation}
        onExport={exportData}
        onImport={importData}
        onClearAll={handleClearAll}
      />

      <AddItemForm
        newItemParent={newItemParent}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        onAddItem={addItem}
        onCancel={() => {
          setNewItemName('');
          setNewItemParent(null);
        }}
      />

      <div className="main-content">
        <div className="tree-panel">
          <div className="panel-header">
            <h2>{searchTerm ? `Search Results (${searchResults.length})` : 'All Locations'}</h2>
          </div>
          <div className="panel-content">
            {searchTerm ? (
              searchResults.length > 0 ? (
                <SearchResults results={searchResults} />
              ) : (
                <div className="empty-state">
                  No items found matching "{searchTerm}"
                </div>
              )
            ) : (
              locations.length > 0 ? (
                <div className="tree-view">
                  {locations.map(location => renderNode(location))}
                </div>
              ) : (
                <div className="empty-state">
                  No locations yet. Add your first location to get started!
                </div>
              )
            )}
          </div>
        </div>

        <DetailsPanel 
          selectedNode={selectedNode} 
          path={selectedNodePath}
        />
      </div>

      {moveModalOpen && (
        <MoveModal
          itemToMove={itemToMove}
          allNodes={allNodes}
          locations={locations}
          onMove={executeMove}
          onClose={() => {
            setMoveModalOpen(false);
            setItemToMove(null);
          }}
        />
      )}
    </div>
  );
};

export default InventoryTracker;