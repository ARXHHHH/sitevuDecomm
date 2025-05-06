componentDidUpdate(prevProps) {
  // ... existing code
  
  // Auto-expansion logic
  const { expansionPath, currentExpansionLevel } = this.props;
  if (expansionPath && 
      currentExpansionLevel === this.props.parentLevel &&
      this.nodeMatchesPath() &&
      !this.props.rowData.expanded) {
    this.props.onExpandClick(
      this.props.rowData,
      this.props.index,
      this.props.parentLevel,
      this.props.ancestorData
    );
  }
}

nodeMatchesPath() {
  const { expansionPath, parentLevel, rowData } = this.props;
  if (!expansionPath) return false;
  
  const pathValue = expansionPath[parentLevel];
  switch(parentLevel) {
    case 0: return rowData.siteCd === pathValue;
    case 1: return rowData.sctructNmTxt === pathValue;
    case 2: return rowData.floorNmTxt === pathValue;
    case 3: return rowData.subClass === pathValue;
    case 4: return rowData.vendor === pathValue;
    default: return false;
  }
}

// Add highlight logic in render method
const isTargetNode = this.props.expansionPath && 
  this.props.parentLevel === this.props.expansionPath.length - 1 &&
  this.nodeMatchesPath();

// Add to your className
<div className={`tree-label-container ${isTargetNode ? 'highlight-node' : ''}`}>
