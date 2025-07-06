// components.js
import React, { useState } from 'react';
import { SearchIcon, PlusIcon, DownloadIcon, UploadIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon, MapPinIcon, EditIcon, MoveIcon, CheckoutIcon, CheckedOutIcon } from './Icons';
import { findNodePath } from './utils';

export const Header = () => (
  <div className="header">
    <h1>Inventory Tracker</h1>
    <p>Keep track of where you store your belongings across all locations</p>
  </div>
);

export const SearchBar = ({ searchTerm, setSearchTerm }) => (
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
);

export const Toolbar = ({ onAddLocation, onExport, onImport, onClearAll }) => (
  <div className="toolbar">
    <button onClick={onAddLocation} className="btn btn-primary">
      <PlusIcon />
      Add New Location
    </button>

    <button onClick={onExport} className="btn btn-success">
      <DownloadIcon />
      Export Data
    </button>

    <label className="btn btn-purple">
      <UploadIcon />
      Import Data
      <input
        type="file"
        accept=".json"
        onChange={onImport}
        style={{ display: 'none' }}
      />
    </label>

    <button onClick={onClearAll} className="btn btn-danger">
      <TrashIcon />
      Clear All
    </button>
  </div>
);

export const AddItemForm = ({ newItemParent, newItemName, setNewItemName, onAddItem, onCancel }) => (
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
              if (e.key === 'Enter') onAddItem();
              if (e.key === 'Escape') onCancel();
            }}
          />
          <button onClick={onAddItem} className="btn btn-success">
            Add
          </button>
          <button onClick={onCancel} className="btn btn-secondary">
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
);

export const TreeNode = ({ 
  node, 
  level = 0, 
  isExpanded, 
  isSelected, 
  isEditing,
  hasChildren,
  onToggleExpand,
  onSelect,
  onEdit,
  onDelete,
  onMove,
  onToggleCheckout,
  onUpdateName
}) => (
  <div className="select-none">
    <div 
      className={`tree-node ${isSelected ? 'selected' : ''} ${node.checkedOut ? 'checked-out' : ''}`}
      style={{ paddingLeft: `${level * 20 + 8}px` }}
      onClick={onSelect}
    >
      {hasChildren ? (
        <div className="expand-button" onClick={onToggleExpand}>
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </div>
      ) : (
        <div className="expand-placeholder" />
      )}

      {level === 0 && <div className="location-icon"><MapPinIcon /></div>}

      {node.checkedOut && (
        <div className="checkout-indicator">
          <CheckedOutIcon />
        </div>
      )}

      {isEditing ? (
        <input
          type="text"
          defaultValue={node.name}
          className="edit-input"
          autoFocus
          onBlur={(e) => onUpdateName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onUpdateName(e.target.value);
            if (e.key === 'Escape') onEdit(null);
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
            onToggleCheckout(node.id);
          }}
          className={`action-button ${node.checkedOut ? 'checkin-button' : 'checkout-button'}`}
          title={node.checkedOut ? 'Check in' : 'Check out'}
        >
          <CheckoutIcon />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(node.id);
          }}
          className="action-button move-button"
          title="Move item"
        >
          <MoveIcon />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(node.id);
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
              onDelete(node.id);
            }
          }}
          className="action-button delete-button"
          title="Delete item"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  </div>
);

export const SearchResults = ({ results }) => (
  <div className="search-results">
    {results.map(result => (
      <div key={result.node.id} className="search-result">
        <div className="result-name">
          {result.node.name}
          {result.node.checkedOut && <span className="checked-out-badge">Checked Out</span>}
        </div>
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
);

export const DetailsPanel = ({ selectedNode, path }) => (
  <div className="details-panel">
    <div className="panel-header">
      <h2>Item Details</h2>
    </div>
    <div className="panel-content">
      {selectedNode ? (
        <div>
          <h3>
            {selectedNode.name}
            {selectedNode.checkedOut && <span className="checked-out-badge">Checked Out</span>}
          </h3>
          <div className="item-path">
            📍 {path?.join(' → ')}
          </div>

          {selectedNode.checkedOut && selectedNode.checkoutDate && (
            <div className="checkout-info">
              <strong>Checked out:</strong> {new Date(selectedNode.checkoutDate).toLocaleDateString()}
            </div>
          )}

          {selectedNode.children.length > 0 && (
            <div>
              <h4>Contains ({selectedNode.children.length}):</h4>
              <ul className="children-list">
                {selectedNode.children.map(child => (
                  <li key={child.id}>
                    • {child.name}
                    {child.checkedOut && <span className="checked-out-badge small">Out</span>}
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
);

export const MoveModal = ({ itemToMove, allNodes, locations, onMove, onClose }) => {
  const [selectedParent, setSelectedParent] = useState('');

  const itemToMoveNode = allNodes.find(n => n.id === itemToMove);
  const availableParents = allNodes.filter(n => 
    n.id !== itemToMove && 
    !findNodePath([itemToMoveNode], n.id) // Can't move to own child
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Move "{itemToMoveNode?.name}"</h3>
        <div className="move-form">
          <label>Move to:</label>
          <select 
            value={selectedParent} 
            onChange={(e) => setSelectedParent(e.target.value)}
          >
            <option value="">Root Level</option>
            {availableParents.map(node => (
              <option key={node.id} value={node.id}>
                {'  '.repeat(node.level)}• {node.name}
              </option>
            ))}
          </select>
          <div className="modal-actions">
            <button 
              onClick={() => onMove(selectedParent || null)}
              className="btn btn-primary"
            >
              Move
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};