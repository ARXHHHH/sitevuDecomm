import _ from 'lodash';

import types from 'store/constants/FloorPlanTypes';
import siteTypes from 'store/constants/siteDetailsTypes';
import equipmentTypes from 'store/constants/equipmentDetailsTypes';

export const getFloorplanSites = searchStr => ({ type: types.GET_FLOORPLAN_SITES_SAGA, searchStr });

export const getFloorPlanStructures = siteId => ({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA, siteId });

export const getFloorPlanFloors = structId => ({ type: types.GET_FLOORPLAN_FLOORS_SAGA, structId });

export const getDataForTree = (index, list, rowData, ancestorData) => ({ type: types.GET_FLOORPLAN_TREE_DATA_SAGA, index, list, rowData, ancestorData });

export const getDataForTree2 = (index, list, rowData, ancestorData,filteredRackResults) => ({ type: types.GET_FLOORPLAN_TREE_DATA_SAGA_2, index, list, rowData, ancestorData, filteredRackResults });
export const getDataForTree2Sub = (index, list, rowData, ancestorData) => ({ type: types.GET_FLOORPLAN_TREE_DATA_SAGA_2_SUB, index, list, rowData, ancestorData });

export const getDataForTree3 = (index, list, rowData, ancestorData) => ({ type: types.GET_FLOORPLAN_TREE_DATA_SAGA_3, index, list, rowData, ancestorData });
export const getDataForTree3Sub = (index, list, rowData, ancestorData) => ({ type: types.GET_FLOORPLAN_TREE_DATA_SAGA_3_SUB, index, list, rowData, ancestorData });



export const resetTree = () => ({type: types.RESET_TREE});

export const locateFloorPlan = (siteId, structId, floorId, clliCd, fromRouteInstanceSearch) => ({ type: types.LOCATE_FLOORPLAN, siteId, structId, floorId, clliCd, fromRouteInstanceSearch });

export const getDefaultFloorplanSites = searchStr => ({ type: types.GET_FLOORPLAN_DEFAULT_SITES_SAGA, searchStr });

export const getFloorplanSitesForMeLocate = (searchStr, selectedRackTID) => ({ type: types.GET_FLOORPLAN_DEFAULT_SITES_SAGA_FOR_ME, searchStr, selectedRackTID });

export const getDefaultFloorPlanStructures = siteId => ({ type: types.GET_FLOORPLAN_DEFAULT_STRUCTURES_SAGA, siteId });

export const getDefaultFloorPlanFloors = (structId, siteId) => ({ type: types.GET_FLOORPLAN_DEFAULT_FLOORS_SAGA, structId, siteId });

// export const getDefaultFloorPlanEqptcls = floorId => ({ type: types.GET_FLOORPLAN_DEFAULT_EQPTSUBCLS_SAGA, floorId });
// export const getDefaultFloorPlanvendor = eqptClsId => ({ type: types.GET_FLOORPLAN_DEFAULT_VENDOR_SAGA, eqptClsId });

export const getFloorPlanRacks = (siteId, structureName, floorName, floorId, majorVendorId) => ({ type: types.GET_FLOORPLAN_RACKS_SAGA, siteId, structureName, floorName, floorId, majorVendorId });

export const getFloorPlanShelves = (footPrintInstId) => ({ type: types.GET_FLOORPLAN_SHELVES_SAGA, footPrintInstId });

export const getFloorPlanCards = (itemInstncId) => ({ type: types.GET_FLOORPLAN_CARDS_SAGA, itemInstncId });

export const setFloorPlan = (selectedSite, selectedBuilding, selectedFloor) => ({ type: types.SET_FLOORPLAN_SAGA, selectedSite, selectedBuilding, selectedFloor });

export const getSiteDetails = siteId => ({ type: siteTypes.GET_SITEDETAILS_DATA, siteId });
export const getSubSiteDetails = footprintInstanceId => ({ type: siteTypes.GET_SUB_SITE_DETAILS_DATA, footprintInstanceId });
export const getSubDetails = siteId => ({ type: siteTypes.GET_SUBDETAILS_DATA, siteId });


export const getDediRRDetails = (clliCd) => ({ type: siteTypes.GET_DEDIRRDETAILS, clliCd });

export const locateRacksInAllSites = (sites, searchString, category,isTreeView) => ({ type: types.GET_FLOORPLAN_LOCATE_RACK_SAGA, sites, searchString, category,isTreeView });


export const setSelectionChangeModal = (selectedItem, value) => ({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem, value });

export const setSelectedData = (selectedInfo) => ({ type: types.SET_FLOORPLAN_SELECTED_INFO, selectedInfo });

export const setRightSelectedData = (rightSelectedInfo) => ({ type: types.SET_TREEVIEW_RIGHT_SELECTED_INFO, rightSelectedInfo });

export const locateSelectedEquipment = selectedEquipment => ({ type: types.LOCATE_SELECTED_EQUIPMENT, selectedEquipment });

export const setLocatedRack = (selectedLocatedIndex) => ({ type: types.SET_FLOORPLAN_LOCATED_RACK, selectedLocatedIndex });

export const getRackDetails = (instanceId, projectId, isRackGeneric) => ({ type: equipmentTypes.GET_RACKDETAILS_SAGA, instanceId, projectId, isRackGeneric });

export const getFabricDetails = (instanceId, objType) => ({ type: equipmentTypes.GET_FABRICDETAILS_SAGA, instanceId, objType });

export const updateRackSelection = (rackSelectionDetails) => ({ type: types.SET_RACK_SELECTION, rackSelectionDetails });

export const updateRightRackSelection = (rightRackSelectionDetails) => ({ type: types.SET_RIGHT_RACK_SELECTION, rightRackSelectionDetails });

export const updateFloorPlanData = (floorPlanParams, rack = {}) => {
  const allowedKeys = [
    'selectedSite',
    'selectedBuilding',
    'selectedFloor',
    'clliCd',
    'selectedFloorId',
    'selectedBuildingId'
  ];
  const data = _.pick(floorPlanParams, allowedKeys);
  return {
    type: types.SET_FLOORPLAN_SUCCESS,
    data,
    rack,
  };
};

export const updateTreeViewData = (clliCd, siteCd, siteId, structId, structName, floorId, floorName, eqpType, vendorName, rackInstId, fromRouteInstanceSearch, reset) => ({ type: types.LOCATE_TREEVIEW, clliCd, siteCd, siteId, structId, structName, floorId, floorName, eqpType, vendorName, rackInstId, fromRouteInstanceSearch, reset });

export const getRackCatalog = (catalogId) => ({ type: equipmentTypes.GET_RACK_CATALOG_SAGA, catalogId });

export const getRackConfiguration = (configurationId) => ({ type: equipmentTypes.GET_RACK_CONFIGURATION_SAGA, configurationId });

export const getRackVersionHistory = (logFpId) => ({ type: equipmentTypes.GET_RACK_V_HISTORY_SAGA, logFpId });

export const getBgpRoles = (instanceId) => ({ type: equipmentTypes.GET_BGP_ROLES_SAGA, instanceId });

export const updateBgpRoles = (instanceId, roles = [], equipType, selectedRowData = null, nfId) => ({ type: equipmentTypes.UPDATE_BGP_ROLES_SAGA, instanceId, roles, equipType, selectedRowData, nfId });

export const switchTreeView = (showTreeView) => ({ type: types.SHOW_FLOORPLAN_TREEVIEW, showTreeView });

export const updateCanAccessCilli = (canAccessCilli) => ({ type: types.UPDATE_CAN_ACCESS_CILLI, canAccessCilli });
