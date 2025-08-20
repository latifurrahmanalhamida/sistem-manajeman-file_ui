// src/components/FolderCard/FolderCard.js
import React from 'react';
import { FaFolder } from 'react-icons/fa';
import './FolderCard.css';

const FolderCard = ({ folder }) => {
  return (
    <div className="folder-card">
      <FaFolder className="folder-icon" />
      <span className="folder-name">{folder.name}</span>
    </div>
  );
};

export default FolderCard;
