// hooks.js
import { useState, useEffect } from 'react';
import { getSampleData } from './utils';

export const useInventoryData = () => {
  const [locations, setLocations] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

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
    const sampleData = getSampleData();
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

  return {
    locations,
    setLocations,
    expandedNodes,
    setExpandedNodes,
    loadSampleData
  };
};

export const useDataManagement = (locations, setLocations, setExpandedNodes) => {
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
      localStorage.removeItem('inventoryTrackerData');
      localStorage.removeItem('inventoryTrackerExpanded');
      return true;
    }
    return false;
  };

  return { exportData, importData, clearAllData };
};