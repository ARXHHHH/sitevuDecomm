// TreeViewRowRightClick.js (nodeMatchesPath)
nodeMatchesPath() {
  const { expansionPath, parentLevel, rowData } = this.props;
  if (!expansionPath) return false;

  const expectedValue = expansionPath[parentLevel];
  let actualValue;

  switch(parentLevel) {
    case 0: 
      actualValue = rowData.siteCd; 
      break;
    case 1: 
      actualValue = rowData.sctructNmTxt; // Use sctructNmTxt instead of struct
      break;
    case 2: 
      actualValue = rowData.floorNmTxt;   // Use floorNmTxt instead of floor
      break;
    case 3: 
      actualValue = rowData.subClass;     // Use subClass instead of eqpType
      break;
    case 4: 
      actualValue = rowData.vendorName;   // Use vendorName instead of vendor
      break;
    default: 
      return false;
  }

  console.log(`[MATCH] Level ${parentLevel}:`, { expectedValue, actualValue });
  return actualValue === expectedValue;
}
