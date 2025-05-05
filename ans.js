import { put, select, takeLatest } from 'redux-saga/effects';

function* handleAutoExpand() {
  const { expansionPath, currentExpansionLevel } = yield select(state => state.floorPlan);
  
  if (!expansionPath || currentExpansionLevel >= expansionPath.length) return;

  // Get the current level data needed for expansion
  const levelData = yield select(state => {
    switch(currentExpansionLevel) {
      case 0: return state.floorPlan.sitesList2;
      case 1: return state.floorPlan.structuresList2;
      case 2: return state.floorPlan.floorsList2;
      case 3: return state.floorPlan.eqpTypeList2;
      case 4: return state.floorPlan.vendorList2;
      default: return null;
    }
  });

  // Find the matching node index
  const targetValue = expansionPath[currentExpansionLevel];
  const nodeIndex = levelData.findIndex(item => 
    item.siteCd === targetValue || 
    item.sctructNmTxt === targetValue ||
    item.floorNmTxt === targetValue ||
    item.subClass === targetValue ||
    item.vendor === targetValue
  );

  if (nodeIndex > -1) {
    // Trigger expansion for this level
    yield put({
      type: types.GET_FLOORPLAN_TREE_DATA_SAGA_2,
      index: nodeIndex,
      list: ['sitesList2', 'structuresList2', 'floorsList2', 'eqpTypeList2', 'vendorList2'][currentExpansionLevel],
      rowData: levelData[nodeIndex],
      ancestorData: [],
      filteredRackResults: []
    });

    // Move to next level after short delay
    yield new Promise(resolve => setTimeout(resolve, 300));
    yield put({ type: types.INCREMENT_EXPANSION_LEVEL });
  }
}

// Add to your existing watch functions
export function* floorPlanSaga() {
  yield takeLatest(types.SET_EXPANSION_PATH, handleAutoExpand);
  yield takeLatest(types.GET_FLOORPLAN_TREE_DATA_SAGA_2_SUCCESS, handleAutoExpand);
  // ... keep existing yield statements
}
