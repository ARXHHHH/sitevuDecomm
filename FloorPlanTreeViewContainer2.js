import { connect } from 'react-redux';
import FloorPlanTreeView from 'components/FloorPlan/FloorPlanTreeView/Structure2/TreeStructure2';
import * as floorPlanActions from 'store/actions/floorPlanActions';


const mapStateToProps = (state) => {
  const { floorPlan: { sitesList2, structuresList2, floorsList2, eqpTypeList2, vendorList2, racksList2, shelvesList, cardsList, subcardsList, indexPath } } = state;
  return {
    indexPath: indexPath,
    tree: [sitesList2, structuresList2, floorsList2, eqpTypeList2, vendorList2, racksList2, shelvesList, cardsList, subcardsList],
    keyIds: ['siteId', 'structId', 'floorKeyId', 'eqpType', 'vendorKeyId', 'footPrintInstId', 'itemInstncId', 'cardInstncId'],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getDataForTree2: (index, list, rowData, ancestorData, filteredRackResults) => dispatch(floorPlanActions.getDataForTree2(index, list, rowData, ancestorData,filteredRackResults)),
    setFloorPlan: (selectedSite, selectedBuilding, selectedFloor) => dispatch(floorPlanActions.setFloorPlan(selectedSite, selectedBuilding, selectedFloor)),
    setSelectedData: (selectedInfo) => dispatch(floorPlanActions.setSelectedData(selectedInfo)),
    setRightSelectedData: (selectedInfo) => dispatch(floorPlanActions.setRightSelectedData(selectedInfo)),
    getSiteDetails: siteId => dispatch(floorPlanActions.getSiteDetails(siteId)),
    getSubDetails: siteId => dispatch(floorPlanActions.getSubDetails(siteId)),
    requestFloorplanFloors2: structId => dispatch(floorPlanActions.requestFloorplanFloors2(structId)),
    getFloorplanSites: searchStr => dispatch(floorPlanActions.getDefaultFloorplanSites(searchStr)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FloorPlanTreeView);
