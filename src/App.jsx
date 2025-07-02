// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

// Inline icons as SVG components since lucide-react might not be available
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7,10 12,15 17,10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17,8 12,3 7,8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const InventoryTracker = () => {
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemParent, setNewItemParent] = useState(null);

  // Load data from localStorage on startup
  useEffect(() => {
    const savedLocations = localStorage.getItem('inventoryTrackerData');
    const savedExpanded = localStorage.getItem('inventoryTrackerExpanded');

    if (savedLocations) {
      try {
        setLocations(JSON.parse(savedLocations));
        if (savedExpanded) {
          setExpandedNodes(new Set(JSON.parse(savedExpanded)));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        loadSampleData();
      }
    } else {
      loadSampleData();
    }
  }, []);

  const loadSampleData = () => {
    const sampleData = [
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
                  { id: '4', name: 'Superglue', children: [] }
                ]
              },
              {
                id: '5',
                name: 'Drawer 1',
                children: [
                  { id: '6', name: 'Measuring spoons', children: [] },
                  { id: '7', name: 'Can opener', children: [] }
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
                  { id: '10', name: 'Passport', children: [] }
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
              { id: '13', name: 'Stapler', children: [] },
              { id: '14', name: 'USB Cable', children: [] }
            ]
          }
        ]
      }
    ];
    setLocations(sampleData);
    setExpandedNodes(new Set(['1', '2', '8', '11']));
  };

  // Save data to localStorage whenever locations change
  useEffect(() => {
    if (locations.length > 0) {
      localStorage.setItem('inventoryTrackerData', JSON.stringify(locations));
    }
  }, [locations]);

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('inventoryTrackerExpanded', JSON.stringify([...expandedNodes]));
  }, [expandedNodes]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const findNodePath = (nodes, targetId, path = []) => {
    for (const node of nodes) {
      const currentPath = [...path, node.name];
      if (node.id === targetId) return currentPath;
      const found = findNodePath(node.children, targetId, currentPath);
      if (found) return found;
    }
    return null;
  };

  const searchNodes = (nodes, term) => {
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

  const toggleExpand = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const addItem = () => {
    if (!newItemName.trim()) return;

    const newItem = {
      id: generateId(),
      name: newItemName.trim(),
      children: []
    };

    if (newItemParent) {
      const updateNode = (nodes) => {
        return nodes.map(node => {
          if (node.id === newItemParent.id) {
            return { ...node, children: [...node.children, newItem] };
          }
          return { ...node, children: updateNode(node.children) };
        });
      };
      setLocations(updateNode(locations));
    } else {
      setLocations([...locations, newItem]);
    }

    setNewItemName('');
    setNewItemParent(null);
  };

  const deleteNode = (nodeId) => {
    const deleteFromNodes = (nodes) => {
      return nodes.filter(node => {
        if (node.id === nodeId) return false;
        node.children = deleteFromNodes(node.children);
        return true;
      });
    };
    setLocations(deleteFromNodes(locations));
  };

  const updateNodeName = (nodeId, newName) => {
    if (!newName.trim()) return;

    const updateNode = (nodes) => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, name: newName.trim() };
        }
        return { ...node, children: updateNode(node.children) };
      });
    };
    setLocations(updateNode(locations));
    setEditingNode(null);
  };

  const exportData = () => {
    const dataToExport = {
      locations,
      expandedNodes: [...expandedNodes],
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.locations && Array.isArray(importedData.locations)) {
          setLocations(importedData.locations);
          if (importedData.expandedNodes) {
            setExpandedNodes(new Set(importedData.expandedNodes));
          }
          localStorage.setItem('inventoryTrackerData', JSON.stringify(importedData.locations));
          if (importedData.expandedNodes) {
            localStorage.setItem('inventoryTrackerExpanded', JSON.stringify(importedData.expandedNodes));
          }
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format. Please select a valid backup file.');
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone. Consider exporting your data first.')) {
      setLocations([]);
      setExpandedNodes(new Set());
      setSelectedNode(null);
      setNewItemParent(null);
      localStorage.removeItem('inventoryTrackerData');
      localStorage.removeItem('inventoryTrackerExpanded');
    }
  };

  const renderNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isEditing = editingNode === node.id;

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`tree-node ${selectedNode?.id === node.id ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            setSelectedNode(node);
            setNewItemParent(node);
            if (hasChildren && !isExpanded) {
              setExpandedNodes(prev => new Set([...prev, node.id]));
            }
          }}
        >
          {hasChildren ? (
            <div 
              className="expand-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </div>
          ) : (
            <div className="expand-placeholder" />
          )}

          {level === 0 && <div className="location-icon"><MapPinIcon /></div>}

          {isEditing ? (
            <input
              type="text"
              defaultValue={node.name}
              className="edit-input"
              autoFocus
              onBlur={(e) => updateNodeName(node.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateNodeName(node.id, e.target.value);
                } else if (e.key === 'Escape') {
                  setEditingNode(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="node-name">{node.name}</span>
          )}

          <div className="node-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingNode(node.id);
              }}
              className="action-button edit-button"
              title="Edit name"
            >
              <EditIcon />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${node.name}" and all its contents?`)) {
                  deleteNode(node.id);
                }
              }}
              className="action-button delete-button"
              title="Delete item"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const searchResults = searchTerm ? searchNodes(locations, searchTerm) : [];

  return (
    <div className="app">
      <div className="header">
        <h1>Inventory Tracker</h1>
        <p>Keep track of where you store your belongings across all locations</p>
      </div>

      <div className="search-container">
        <div className="search-input">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search for items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="toolbar">
        <button
          onClick={() => {
            const name = prompt('Enter new location name:');
            if (name?.trim()) {
              const newItem = {
                id: generateId(),
                name: name.trim(),
                children: []
              };
              setLocations([...locations, newItem]);
            }
          }}
          className="btn btn-primary"
        >
          <PlusIcon />
          Add New Location
        </button>

        <button onClick={exportData} className="btn btn-success">
          <DownloadIcon />
          Export Data
        </button>

        <label className="btn btn-purple">
          <UploadIcon />
          Import Data
          <input
            type="file"
            accept=".json"
            onChange={importData}
            style={{ display: 'none' }}
          />
        </label>

        <button onClick={clearAllData} className="btn btn-danger">
          <TrashIcon />
          Clear All
        </button>
      </div>

      <div className="add-item-form">
        {newItemParent ? (
          <>
            <h3>Add item to "{newItemParent.name}"</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Item name..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addItem();
                  if (e.key === 'Escape') {
                    setNewItemName('');
                    setNewItemParent(null);
                  }
                }}
              />
              <button onClick={addItem} className="btn btn-success">
                Add
              </button>
              <button
                onClick={() => {
                  setNewItemName('');
                  setNewItemParent(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="form-placeholder">
            Click on an item to add subitems
          </div>
        )}
      </div>

      <div className="main-content">
        <div className="tree-panel">
          <div className="panel-header">
            <h2>{searchTerm ? `Search Results (${searchResults.length})` : 'All Locations'}</h2>
          </div>
          <div className="panel-content">
            {searchTerm ? (
              searchResults.length > 0 ? (
                <div className="search-results">
                  {searchResults.map(result => (
                    <div key={result.node.id} className="search-result">
                      <div className="result-name">{result.node.name}</div>
                      <div className="result-path">
                        📍 {result.path.join(' → ')}
                      </div>
                      {result.hasChildren && (
                        <div className="result-children">
                          Contains {result.node.children.length} item(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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

        <div className="details-panel">
          <div className="panel-header">
            <h2>Item Details</h2>
          </div>
          <div className="panel-content">
            {selectedNode ? (
              <div>
                <h3>{selectedNode.name}</h3>
                <div className="item-path">
                  📍 {findNodePath(locations, selectedNode.id)?.join(' → ')}
                </div>

                {selectedNode.children.length > 0 && (
                  <div>
                    <h4>Contains ({selectedNode.children.length}):</h4>
                    <ul className="children-list">
                      {selectedNode.children.map(child => (
                        <li key={child.id}>
                          • {child.name}
                          {child.children.length > 0 && (
                            <span className="child-count">
                              (+{child.children.length})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                Select an item to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTracker;