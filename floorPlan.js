import {
  put,
  takeEvery,
  call,
  select,
  take
} from 'redux-saga/effects';
import _ from 'lodash';
import { FloorPlanService } from 'utils/FloorPlanService';
import { RackFaceService } from 'utils/RackFaceService';
import types from 'store/constants/FloorPlanTypes';
import messages from 'store/constants/messages';
import * as selectors from 'sagas/selectors';
import { loading } from 'sagas/saga-utils';
import AlertManager from 'components/AlertManager';

const floorplanApi = new FloorPlanService();
const rackfaceApi = new RackFaceService();

const splitAt = (i, arr) => {
  const clonedArray = [...arr];
  return [clonedArray.splice(0, i), clonedArray];
}

function* setFloorPlan(action) {
  try {
    yield put(loading(types.SET_FLOORPLAN_LOADING));
    const sites = yield select(selectors.getSites);
    const structures = yield select(selectors.getStructuresBySiteId, action.selectedSite, 1);
    const floors = yield select(selectors.getFloorsByStructureId, action.selectedBuilding, 1);
    const selectedBuilding = structures.find(structure => structure.structId === action.selectedBuilding).sctructNmTxt;
    const selectedFloor = floors.find(floor => floor.floorId === action.selectedFloor).floorNmTxt;
    const clliCd = sites.find(site => site.siteId === action.selectedSite).clliCd;
    const selectedSite = _.defaultTo(action.selectedSite, 0);
    const selectedFloorId = action.selectedFloor;
    const selectedBuildingId = action.selectedBuilding;
    const fromRouteInstanceSearch = action.fromRouteInstanceSearch;
    const data = {
      sites,
      structures,
      floors,
      selectedSite,
      selectedBuilding,
      selectedFloor,
      clliCd,
      selectedFloorId,
      selectedBuildingId,
      fromRouteInstanceSearch
    };
    yield put({ type: types.SET_FLOORPLAN_SUCCESS, data });
    yield put(loading(types.SET_FLOORPLAN_LOADING, false));
  } catch (error) {
    yield put({ type: types.SET_FLOORPLAN_FAILURE, error: error.message });
    yield put(loading(types.SET_FLOORPLAN_LOADING, false));
  }
}



const handleExpandClick = (rowData, index, parentLevel, ancestorData, filteredRackResults) => {
  return (dispatch) => {
    // Dispatch the original expand/collapse action

    // If at floor level, also dispatch the equipment type action directly
    if (parentLevel === 2 && !rowData.expanded) {
      const siteData = ancestorData[0];
      dispatch({
        type: types.GET_FLOORPLAN_EQPTYPE_SAGA_2,
        siteId: siteData.siteId,
        structureName: rowData.struct || rowData.sctructNmTxt,
        floorName: rowData.floor || rowData.floorNmTxt,
        floorId: rowData.floorId,
        eqpType: rowData.eqpType,
        fromRouteInstanceSearch: false,
        filteredRackResults
      });
    }
  };
};




function* requestFloorplanCards(action) {
  try {
    const { itemInstncId } = action;
    yield put(loading(types.GET_FLOORPLAN_CARDS_LOADING));
    let cards = yield call(floorplanApi.getCardViewWithSubCards.bind(floorplanApi), itemInstncId);
    cards = cards.map(el => {
      return {
        ...el,
        type: 'Card'
      }
    })
    yield put({ type: types.GET_FLOORPLAN_CARDS_SUCCESS, data: cards, itemInstncId });
    yield put(loading(types.GET_FLOORPLAN_CARDS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_CARDS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_CARDS_LOADING, false));
  }
}

function* requestFloorplanShelves(action) {
  try {
    const { footPrintInstId } = action;
    yield put(loading(types.GET_FLOORPLAN_SHELVES_LOADING));
    let shelves = yield call(rackfaceApi.getShelfView.bind(rackfaceApi), footPrintInstId);
    shelves = shelves.map((item) => ({ ...item, itemInstncId: item.plcmntData.itemInstncId }));
    shelves = shelves.map(el => {
      return {
        ...el,
        type: 'Shelf'
      }
    })
    yield put({ type: types.GET_FLOORPLAN_SHELVES_SUCCESS, data: shelves, footPrintInstId });
    yield put(loading(types.GET_FLOORPLAN_SHELVES_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_SHELVES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_SHELVES_LOADING, false));
  }
}


function* requestFloorplanRacks2(action) {
  try {
    const { siteId, clliCd, siteCd, structureName, eqpType, floorName, majorVendorId, vendorName, rackInstId, indexPathObj } = action;
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING));
    const racks = yield call(floorplanApi.getFloorPlanRacksStr2.bind(floorplanApi), clliCd, siteCd, structureName, floorName, eqpType, vendorName);
    let filteredRacks = majorVendorId ? racks.filter(el => el.majorVendorId === majorVendorId) : racks;
    filteredRacks = filteredRacks.map(el => {
      return {
        ...el,
        type: types.RACK
      }
    })

    let indexPath = [];
    if(indexPathObj && indexPathObj.site > -1 && indexPathObj.structure > -1 &&
      indexPathObj.floor > -1 && indexPathObj.eqpType > -1 && indexPathObj.vendor > -1) {
      let rackIndex = filteredRacks.findIndex(item => item.footPrintInstId === rackInstId);
      indexPath = [indexPathObj.site, indexPathObj.structure, indexPathObj.floor, indexPathObj.eqpType, indexPathObj.vendor, rackIndex];
    }

    yield put({ type: types.GET_FLOORPLAN_RACKS_SUCCESS_2, data: filteredRacks, vendorKeyId: (siteId + structureName + floorName + eqpType + vendorName), indexPath: indexPath });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_RACKS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  }
}

function* requestFloorplanRacks2Sub(action) {
  try {
    const { siteId, subClass, floorName, floorId, majorVendorId } = action;
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING));

    const Racks = yield call(floorplanApi.getFloorPlanRacksStr2.bind(floorplanApi), floorName, subClass, majorVendorId);
    // const Rack = racks.filter(el => el.majorVendorId === majorVendorId);


    yield put({ type: types.GET_FLOORPLAN_RACKS_SUCCESS_2_SUB, data: Racks, majorVendorId: majorVendorId });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_RACKS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  }
}


function* requestFloorplanRacks3(action) {
  try {
    const { clliCd, siteCd, structureName, zoneName, zoneId } = action;
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING));
    let racks = yield call(floorplanApi.getTreeViewRacksByZone.bind(floorplanApi), clliCd, siteCd, structureName, zoneName);
    racks = racks.map(el => {
      return {
        ...el,
        type: types.RACK
      }
    })
    yield put({ type: types.GET_FLOORPLAN_RACKS_SUCCESS_3, data: racks, zoneId });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_RACKS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  }
}

function* requestFloorplanRacks3Sub(action) {
  try {
    const { zoneId, siteId } = action;
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING));
    let racks = yield call(floorplanApi.getSubsiteZoneRacks.bind(floorplanApi), siteId, zoneId);
    racks = racks.map(el => {
      return {
        ...el,
        type: types.RACK
      }
    })

    yield put({ type: types.GET_FLOORPLAN_RACKS_SUCCESS_3_SUB, data: racks, zoneId });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_RACKS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  }
}

function* requestFloorplanRacks3Sub2(action) {
  try {
    const { zoneId, siteId } = action;
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING));
    let racks = yield call(floorplanApi.getSubsiteZoneRacks.bind(floorplanApi), siteId, zoneId);

    racks = racks.map(el => {
      return {
        ...el,
        type: types.RACK
      }
    })

    yield put({ type: types.GET_FLOORPLAN_RACKS_SUCCESS_3_SUB_2, data: racks, zoneId });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_RACKS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  }
}

function* requestFloorplanRacks3Sub2Zon(action) {
  try {
    const { zoneId, siteId, zoneIdTree } = action;
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING));
    let racks = yield call(floorplanApi.getSubsiteZoneRacks.bind(floorplanApi), siteId, zoneId);

    racks = racks.map(el => {
      return {
        ...el,
        type: types.RACK
      }
    })

    yield put({ type: types.GET_FLOORPLAN_RACKS_SUCCESS_3_SUB_2_ZON, data: racks, zoneId: zoneIdTree });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_RACKS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  }
}

function* requestFloorplanRacks(action) {
  try {
    const { siteId, structureName, subClass, floorName, floorId, majorVendorId } = action;
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING));
    const racks = yield call(floorplanApi.getFloorPlanRacks.bind(floorplanApi), siteId, structureName, floorName, majorVendorId);
    const Rack = racks.filter(el => el.majorVendorId === majorVendorId)

    yield put({ type: types.GET_FLOORPLAN_RACKS_SUCCESS, data: Rack, majorVendorId: majorVendorId });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_RACKS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_RACKS_LOADING, false));
  }
}

function* requestFloorplanvendors(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_VENDOR_LOADING));
    const { siteId, structureName, floorName, equipmentcode } = action;
    const vendors = yield call(floorplanApi.getvendor.bind(floorplanApi), siteId, structureName, floorName, equipmentcode);

    yield put({ type: types.GET_FLOORPLAN_VENDOR_SUCCESS, data: vendors, subClass: equipmentcode });
    yield put(loading(types.GET_FLOORPLAN_VENDOR_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_VENDOR_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_VENDOR_LOADING, false));
  }
}


////////vendor data for site and subsite Structure Number 2 (Physical Equipment) (Different tre hierarchy depending is a site or sub site)

function* requestFloorplanvendors2(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_VENDOR_LOADING));
    const { siteId, structureName, floorName, eqpType, vendorName, fromRouteInstanceSearch } = action;
    let vendors = yield call(floorplanApi.getvendors.bind(floorplanApi), siteId, structureName, floorName, eqpType);
    if (vendors) {
      vendors = vendors.map(el => {
        if (el.vendorName === vendorName && fromRouteInstanceSearch) {
          return {
            ...el,
            expanded: true,
            vendorKeyId: siteId + structureName + floorName + eqpType + el.vendorName
          }
        } else return {
          ...el,
          vendorKeyId: siteId + structureName + floorName + eqpType + el.vendorName
        };
      })
    }

    yield put({ type: types.GET_FLOORPLAN_VENDOR_SUCCESS_2, data: vendors, eqpType: eqpType });
    yield put(loading(types.GET_FLOORPLAN_VENDOR_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_VENDOR_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_VENDOR_LOADING, false));
  }
}

function* requestFloorplanVendors2Sub(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_VENDOR_LOADING));
    const { siteId, structureName, floorName, equipmentcode } = action;
    const vendors = yield call(floorplanApi.getvendor.bind(floorplanApi), siteId, structureName, floorName, equipmentcode);

    yield put({ type: types.GET_FLOORPLAN_VENDOR_SUCCESS_2_SUB, data: vendors, subClass: equipmentcode });
    yield put(loading(types.GET_FLOORPLAN_VENDOR_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_VENDOR_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_VENDOR_LOADING, false));
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function* requestFloorplanZones(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING));

    const { siteId, structureName, floorName, floorId } = action;
    const zones = yield call(floorplanApi.getFloorZones.bind(floorplanApi), floorId);

    yield put({ type: types.GET_FLOORPLAN_ZONES_SUCCESS, data: zones, floorId: floorId });
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING, false));

  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_ZONES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING, false));
  }
}

function* requestFloorplanZones3(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING));

    const { siteId, structureName, floorName, floorId } = action;
    const zones = yield call(floorplanApi.getFloorZones.bind(floorplanApi), floorId);

    yield put({ type: types.GET_FLOORPLAN_ZONES_SUCCESS_3, data: zones, floorId: floorId });
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING, false));

  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_ZONES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING, false));
  }
}

function* requestFloorplanZones3Sub(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING));

    const { floorId, siteId } = action;
    let zones = yield call(floorplanApi.getSubsiteFloorZones.bind(floorplanApi), siteId, floorId);
    zones = zones.map(el => {
      return {
        ...el,
        type: types.ZONE
      }
    })

    yield put({ type: types.GET_FLOORPLAN_ZONES_SUCCESS_3_SUB, data: zones, floorId: floorId });
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING, false));

  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_ZONES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING, false));
  }
}

function* requestFloorplanZones3SubStr(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING));

    const { floorId, siteId, floorIdTree } = action;
    let zones = yield call(floorplanApi.getSubsiteFloorZones.bind(floorplanApi), siteId, floorId);
    zones = zones.map(el => {
      return {
        ...el,
        zoneIdTree: Number(`${el.zoneId}${siteId}`),
        type: types.ZONE,
      }
    })

    yield put({ type: types.GET_FLOORPLAN_ZONES_SUCCESS_3_SUB_STR, data: zones, floorId: floorIdTree });
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING, false));

  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_ZONES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_ZONES_LOADING, false));
  }
}


function* requestFloorplanEqptsubcls(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_EQPTSUBCLS_LOADING));
    const { siteId, structureName, floorName, floorId, zoneId } = action;
    let eqptSubClss = yield call(floorplanApi.getFloorEqptcls.bind(floorplanApi), siteId, structureName, floorName, floorId);
    eqptSubClss = eqptSubClss.map(el => {
      return {
        ...el,
        zoneId: zoneId
      }
    })

    yield put({ type: types.GET_FLOORPLAN_EQPTSUBCLS_SUCCESS, data: eqptSubClss, floorId: floorId, zoneId: Number(zoneId) });
    yield put(loading(types.GET_FLOORPLAN_EQPTSUBCLS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_EQPTSUBCLS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_EQPTSUBCLS_LOADING, false));
  }
}

////////subclass data for site and sub site Structure Number 2 (Physical Equipment) (Different tre hierarchy depending is a site or sub site)
function* requestFloorplanEqptsubcls2(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_EQPTSUBCLS_LOADING));
    let { siteId, structureName, floorName, floorId, fromRouteInstanceSearch, eqptSubCls } = action;
    let eqptSubClss = yield call(floorplanApi.getFloorEqptcls.bind(floorplanApi), siteId, structureName, floorName, floorId);

    if (!floorId && eqptSubClss && eqptSubClss.length > 0) {
      floorId = eqptSubClss[0].floorId;
    }

    if (fromRouteInstanceSearch && eqptSubCls) {
      eqptSubClss = eqptSubClss.map(el => {
        if (el.subClass === eqptSubCls) {
          return {
            ...el,
            expanded: true
          }
        } else return el;
      })
    }

    yield put({ type: types.GET_FLOORPLAN_EQPTSUBCLS_SUCCESS_2, data: eqptSubClss, floorId: floorId });
    yield put(loading(types.GET_FLOORPLAN_EQPTSUBCLS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_EQPTSUBCLS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_EQPTSUBCLS_LOADING, false));
  }
}

function* requestFloorplanEqptType2(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_EQPTYPE_LOADING));
    let { siteId, structureName, floorName, floorId, eqpType, fromRouteInstanceSearch } = action;
    let eqpTypeList = yield call(floorplanApi.getFloorEqpType.bind(floorplanApi), siteId, structureName, floorName, floorId);

    if (!floorId && eqpType && eqpTypeList.length > 0) {
      floorId = eqpTypeList[0].floorId;
    }

    if (fromRouteInstanceSearch && eqpTypeList) {
      eqpTypeList = eqpTypeList.map(el => {
        if (el.eqpType === eqpType) {
          return {
            ...el,
            expanded: true
          }
        } else return el;
      })
    }
    // if (eqpTypeList && eqpTypeList[0]) {
    //   eqpTypeList = eqpTypeList.map(el => {
    //     if (el.eqpType) {
    //       return {
    //         ...el
    //       }
    //     };
    //   })
    // }

    yield put({ type: types.GET_FLOORPLAN_EQPTYPE_SUCCESS_2, data: eqpTypeList, floorId: floorId, floorKeyId: (siteId + structureName + floorName) });
    yield put(loading(types.GET_FLOORPLAN_EQPTYPE_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_EQPTYPE_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_EQPTYPE_LOADING, false));
  }
}

function* requestFloorplanEqptsubcls2Sub(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_EQPTSUBCLS_LOADING));
    const { siteId, floorName, floorId } = action;
    let eqptSubClss = yield call(floorplanApi.getFloorEqptcls.bind(floorplanApi), siteId, structureName, floorName, floorId);

    yield put({ type: types.GET_FLOORPLAN_EQPTSUBCLS_SUCCESS_2_SUB, data: eqptSubClss, floorId: floorId });
    yield put(loading(types.GET_FLOORPLAN_EQPTSUBCLS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_EQPTSUBCLS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_EQPTSUBCLS_LOADING, false));
  }
}
//////////////////////////////////////////////////////////////////////////////////

function* requestFloorplanFloors(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING));
    const { structId, primarySiteInd, siteId } = action;
    let floors

    if (structId) {
      if (primarySiteInd == "N") {
        floors = yield call(floorplanApi.getSubsiteStructureFloors.bind(floorplanApi), siteId, structId);
      } else {
        floors = yield call(floorplanApi.getFloors.bind(floorplanApi), structId);
      }
    } else {
      floors = []
    }


    yield put({ type: types.GET_FLOORPLAN_FLOORS_SUCCESS, data: floors, structureId: structId });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_FLOORS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  }
}

/////// Floors data get function for Site and subsite Structure Number 2 (Physical Equipment) (Different tree hierarchy depending on)
function* requestFloorplanFloors2(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING));
    const { structId, siteId, sctructNmTxt, floorName, fromRouteInstanceSearch } = action;
    let floors = yield call(floorplanApi.getFloors.bind(floorplanApi), structId);
    floors = floors.map(el => {
      if (el.floorNmTxt === floorName && fromRouteInstanceSearch) {
        return {
          ...el,
          expanded: true,
          floorKeyId: siteId + sctructNmTxt + el.floorNmTxt
        }
      } else return {
        ...el,
        floorKeyId: siteId + sctructNmTxt + el.floorNmTxt
      };
    })
    yield put({ type: types.GET_FLOORPLAN_FLOORS_SUCCESS_2, data: floors, structureId: structId });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_FLOORS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  }
}

function* requestFloorplanFloors2Sub(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING));
    const { siteId } = action;
    // const zones = yield call(floorplanApi.getSubsiteZones.bind(floorplanApi), siteId);
    const floors = yield call(floorplanApi.getSubsiteFloors.bind(floorplanApi), siteId);

    yield put({ type: types.GET_FLOORPLAN_FLOORS_SUCCESS_2_SUB, data: floors, siteId });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_FLOORS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  }
}
///////////////////////////////////////////////////////////////////////////////

function* requestFloorplanFloors3(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING));
    const { structId } = action;
    const floors = yield call(floorplanApi.getFloors.bind(floorplanApi), structId);
    yield put({ type: types.GET_FLOORPLAN_FLOORS_SUCCESS_3, data: floors, structureId: structId });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_FLOORS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  }
}

function* requestFloorplanFloors3Sub(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING));
    const { structId, siteId, structIdTree } = action;
    let floors = yield call(floorplanApi.getSubsiteStructureFloors.bind(floorplanApi), siteId, structId);
    floors = floors.map(el => {
      return {
        ...el,
        floorIdTree: Number(`${el.floorId}${siteId}`),
        type: types.FLOOR
      }
    })
    yield put({ type: types.GET_FLOORPLAN_FLOORS_SUCCESS_3_SUB, data: floors, structureId: structIdTree });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_FLOORS_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_FLOORS_LOADING, false));
  }
}

function* requestFloorplanSecondLevel3Sub(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_SECOND_LEVEL_3_LOADING));
    const { siteId } = action;
    let strs, floors, zones, racks;
    let data = [];

    // const str = [
    //   {
    //   "structId": 34388,
    //   "siteId": 1100,
    //   "sctructNmTxt": "1NETBB",
    //   "dscrptTxt": "STRC - 34388",
    //   "type": types.STRUCTURE,
    //   }
    // ];


    try {
      strs = yield call(floorplanApi.getSubsiteStructures.bind(floorplanApi), siteId);
      strs = strs.map(el => {
        return {
          ...el,
          structIdTree: Number(`${el.structId}${siteId}`),
          type: types.STRUCTURE
        }
      })
    } catch (err) {
      strs = []
    }

    // try {
    //   floors = yield call(floorplanApi.getSubsiteFloors.bind(floorplanApi), siteId);
    //   floors = floors.map(el => {
    //     return {
    //       floorId: el.floorId,
    //       floorNmTxt: el.floorNmTxt,
    //       dscrptTxt: el.dscrptTxt,
    //       flrplnDrwngFilNm: el.flrplnDrwngFilNm,
    //       clliCd: el.clliCd,
    //       capped: el.capped,
    //       serviceType: el.serviceType,
    //       lastUpdtDt: el.lastUpdtDt,
    //       createDt: el.createDt,
    //       createUserNm: el.createUserNm,
    //       lastUpdtUserNm: el.lastUpdtUserNm,
    //       leaseCd: el.leaseCd,
    //       type: el.type,
    //       expanded: el.expanded,
    //       loading: el.loading,
    //       type: types.FLOOR
    //     }
    //   })
    // } catch (err) {
    //   floors = [];
    // }

    // try{
    //   zones = yield call(floorplanApi.getSubsiteZones.bind(floorplanApi), siteId);
    //   zones = zones.map(el => {
    //     return {
    //       ...el,
    //       type: types.ZONE
    //     }
    //   })
    // }catch (error) {
    //   zones = [];
    // }

    // try{
    //   racks = yield call(floorplanApi.getSubsiteRacks.bind(floorplanApi), siteId);
    //   racks = racks.map(el => {
    //     return {
    //       ...el,
    //       type: types.RACK
    //     }
    //   })
    // } catch (error) {
    //   racks = [];
    // }


    // data = data.concat(strs, floors, zones, racks);


    yield put({ type: types.GET_FLOORPLAN_SECOND_LEVEL_3_SUCCESS, data: strs, siteId: siteId });
    yield put(loading(types.GET_FLOORPLAN_SECOND_LEVEL_3_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_SECOND_LEVEL_3_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_SECOND_LEVEL_3_LOADING, false));
  }
}

function* requestFloorplanStructures(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_STRUCTURES_LOADING));
    const { siteId, primarySiteInd, structId, fromRouteInstanceSearch = false } = action;
    let structures;
    if (primarySiteInd == 'N') {
      structures = yield call(floorplanApi.getSubsiteStructures.bind(floorplanApi), siteId)
    } else {
      structures = yield call(floorplanApi.getStructures.bind(floorplanApi), siteId);
    }

    structures = structures.map((el) => {
      if (el.structId === structId && fromRouteInstanceSearch) {
        return {
          ...el,
          siteId,
          expanded: true
        }
      } else {
        return {
          ...el,
          siteId
        }
      }
    });

    yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SUCCESS, data: structures, siteId });
    yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SUCCESS_2, data: structures, siteId });
    yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SUCCESS_3, data: structures, siteId });
    yield put(loading(types.GET_FLOORPLAN_STRUCTURES_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_STRUCTURES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_STRUCTURES_LOADING, false));
  }
}

function* requestFloorplanStructures2(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_STRUCTURES_LOADING));
    const { siteId } = action;
    let structures = yield call(floorplanApi.getStructures.bind(floorplanApi), siteId);
    structures = structures.map((el) => {
      return {
        ...el,
        siteId
      }
    });

    yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SUCCESS_2, data: structures, siteId });
    yield put(loading(types.GET_FLOORPLAN_STRUCTURES_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_STRUCTURES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_STRUCTURES_LOADING, false));
  }
}

function* requestFloorplanStructures3(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_STRUCTURES_LOADING));
    const { siteId } = action;
    let structures = yield call(floorplanApi.getStructures.bind(floorplanApi), siteId);
    structures = structures.map((el) => {
      return {
        ...el,
        siteId
      }
    });

    yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SUCCESS_3, data: structures, siteId });
    yield put(loading(types.GET_FLOORPLAN_STRUCTURES_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_STRUCTURES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_STRUCTURES_LOADING, false));
  }
}


function* requestFloorplanSites(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_SITES_LOADING));
    let sites = yield call(floorplanApi.searchSites.bind(floorplanApi), action.searchStr);
    if (!sites || (Array.isArray(sites) && !sites.length)) {
      throw new Error(messages.NO_SEARCH_RESULTS);
    }

    sites = sites.map(el => {
      if (el.siteId === action.siteId) {
        return {
          ...el,
          expanded: true
        }
      } else return el;
    })

    let first = sites.filter(el => el.primarySiteInd === "Y")
    let second = sites.filter(el => el.primarySiteInd === "N")

    second = second.map(el => {
      return {
        ...el,
        type: "subsite"
      }
    })

    const AllSites = first.concat(second);

    yield put({ type: types.GET_FLOORPLAN_SITES_SUCCESS, data: sites });

    yield put({ type: types.GET_FLOORPLAN_SITES_SUCCESS_2, data: AllSites });
    yield put({ type: types.GET_FLOORPLAN_SITES_SUCCESS_3, data: first });
    yield put({ type: types.GET_FLOORPLAN_SUBSITES_SUCCESS_3, data: second });

    yield put(loading(types.GET_FLOORPLAN_SITES_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_SITES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_SITES_LOADING, false));
  }
}

function* requestFloorplanSites2(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_SITES_LOADING));
    const sites = yield call(floorplanApi.searchSites.bind(floorplanApi), action.searchStr);
    if (!sites || (Array.isArray(sites) && !sites.length)) {
      throw new Error(messages.NO_SEARCH_RESULTS);
    }

    const [first, second] = splitAt(1, sites);

    yield put({ type: types.GET_FLOORPLAN_SITES_SUCCESS_2, data: first });
    yield put({ type: types.GET_FLOORPLAN_SITES_SUCCESS_3, data: first });
    yield put({ type: types.GET_FLOORPLAN_SUBSITES_SUCCESS_2, data: second });
    yield put({ type: types.GET_FLOORPLAN_SUBSITES_SUCCESS_3, data: second });

    yield put(loading(types.GET_FLOORPLAN_SITES_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_SITES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_SITES_LOADING, false));
  }
}

function* requestFloorplanSites3(action) {
  try {
    yield put(loading(types.GET_FLOORPLAN_SITES_LOADING));
    const sites = yield call(floorplanApi.searchSites.bind(floorplanApi), action.searchStr);
    if (!sites || (Array.isArray(sites) && !sites.length)) {
      throw new Error(messages.NO_SEARCH_RESULTS);
    }

    const [first, second] = splitAt(1, sites);

    yield put({ type: types.GET_FLOORPLAN_SITES_SUCCESS_3, data: first });
    yield put({ type: types.GET_FLOORPLAN_SUBSITES_SUCCESS_3, data: second });

    yield put(loading(types.GET_FLOORPLAN_SITES_LOADING, false));
  } catch (error) {
    yield put({ type: types.GET_FLOORPLAN_SITES_FAILURE, error: error.message });
    yield put(loading(types.GET_FLOORPLAN_SITES_LOADING, false));
  }
}

function* requestLocateTreeview(action) {
  try {
    const { clliCd, siteCd, siteId, structId, structName, floorId, floorName, eqpType, vendorName, rackInstId, fromRouteInstanceSearch = false, reset = false } = action;

    if (reset) {
      let existingSites = yield select(selectors.getSites);
      existingSites = existingSites.map(el => {
        return {
          ...el,
          expanded: false
        }
      })
      yield put({ type: types.GET_FLOORPLAN_SITES_SUCCESS_2, data: existingSites });
      yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SUCCESS_2, data: {}, reset });
      yield put({ type: types.GET_FLOORPLAN_FLOORS_SUCCESS_2, data: {}, reset });
      return;
    }

    const searchStr = clliCd;
    const indexPathObj = {site: -1, structure: -1, floor: -1, eqpType: -1, vendor: -1};
    let refresh = false;
    yield put({ type: types.GET_FLOORPLAN_SITES_SAGA, searchStr, siteId });
    const { type, error = '' } = yield take([types.GET_FLOORPLAN_SITES_SUCCESS, types.GET_FLOORPLAN_SITES_FAILURE]);
    if (type === types.GET_FLOORPLAN_SITES_FAILURE) {
      throw new Error(error);
    }
    const sites = yield select(selectors.getSites);
    if (sites.length === 0) {
      throw new Error(messages.NO_SEARCH_RESULTS);
    } else {
      indexPathObj["site"] = sites.findIndex(item => item.siteId === siteId);
    }
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedSite', value: siteId });

    //load structure
    let structures = yield select(selectors.getStructuresBySiteId, siteId, 1);
    if (!structures || (structures[0] && structures[0]['siteId'] !== siteId)) {
      refresh = true;
      yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA, siteId, structId, fromRouteInstanceSearch });

      const { type, error = '' } = yield take([types.GET_FLOORPLAN_STRUCTURES_SUCCESS, types.GET_FLOORPLAN_STRUCTURES_FAILURE]);
      if (type === types.GET_FLOORPLAN_STRUCTURES_SUCCESS) {
        structures = yield select(selectors.getStructuresBySiteId, siteId, 1);
      } else {
        throw new Error(error);
      }
    }
    if (structures.length === 0) {
      throw new Error(messages.SELECT_SITE);
    } else {
      indexPathObj["structure"] = structures.findIndex(item => item.structId === structId);
    }
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedBuilding', value: structId });

    let floors = yield select(selectors.getFloorsByStructureId, structId, 2);
    if (!floors || refresh || (floors[0] && floors[0]['structId'] !== structId)) {
      refresh = true;
      yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA_2, structId, siteId, sctructNmTxt: structName, floorName, fromRouteInstanceSearch });
      const { type, error = '' } = yield take([types.GET_FLOORPLAN_FLOORS_SUCCESS_2, types.GET_FLOORPLAN_FLOORS_FAILURE]);
      if (type === types.GET_FLOORPLAN_FLOORS_SUCCESS_2) {
        floors = yield select(selectors.getFloorsByStructureId, structId, 2);
      } else {
        throw new Error(error);
      }
    }
    if (floors.length === 0) {
      throw new Error(messages.SELECT_SITE);
    } else {
      indexPathObj["floor"] = floors.findIndex(item => item.floorNmTxt === floorName);
    }
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedFloor', value: floorId });
    if (floors.length > 0) {
      yield call(setFloorPlan, { selectedSite: siteId, selectedBuilding: structId, selectedFloor: floorId, fromRouteInstanceSearch });
    }

    //get eqpTypes
    if (fromRouteInstanceSearch && structName && floorName) {
      yield put({ type: types.GET_FLOORPLAN_EQPTYPE_SAGA_2, siteId, structureName: structName, floorName, eqpType, fromRouteInstanceSearch });
      const { type, error = '' } = yield take([types.GET_FLOORPLAN_EQPTYPE_SUCCESS_2, types.GET_FLOORPLAN_EQPTYPE_FAILURE]);
      if (type === types.GET_FLOORPLAN_EQPTYPE_SUCCESS_2) {
        let eqpTypes = yield select(selectors.getEqpTypesByFloorId, siteId + structName + floorName);
        indexPathObj["eqpType"] = eqpTypes.findIndex(item => item.eqpType === eqpType);
      }
    }

    //get vendors
    if (fromRouteInstanceSearch && structName && floorName && eqpType && vendorName) {
      yield put({ type: types.GET_FLOORPLAN_VENDOR_SAGA_2, siteId, structureName: structName, floorName, eqpType, vendorName, fromRouteInstanceSearch });
      const { type, error = '' } = yield take([types.GET_FLOORPLAN_VENDOR_SUCCESS_2, types.GET_FLOORPLAN_VENDOR_FAILURE]);
      if (type === types.GET_FLOORPLAN_VENDOR_SUCCESS_2) {
        let vendors = yield select(selectors.getVendorsByEqpType, eqpType);
        indexPathObj["vendor"] = vendors.findIndex(item => item.vendorName === vendorName);
      }
    }

    console.log("indexPathObj: " + indexPathObj);
    //get racks
    if (fromRouteInstanceSearch && siteCd && structName && floorName && eqpType && vendorName) {
      yield put({ type: types.GET_FLOORPLAN_RACKS_SAGA_2, siteId, clliCd, siteCd, structureName: structName, floorName, eqpType, vendorName, rackInstId, indexPathObj });
    }
  } catch (error) {
    AlertManager.error(error.message);
  }
}

function* requestLocateFloorplanFloors(action) {
  try {
    const { structId, siteId, floorId = false, fromRouteInstanceSearch = false } = action;
    const searchStr = action.clliCd;
    yield put({ type: types.GET_FLOORPLAN_SITES_SAGA, searchStr, siteId });
    // yield put({ type: types.GET_FLOORPLAN_SITES_SAGA_2, searchStr });
    // yield put({ type: types.GET_FLOORPLAN_SITES_SAGA_3, searchStr });
    const { type, error = '' } = yield take([types.GET_FLOORPLAN_SITES_SUCCESS, types.GET_FLOORPLAN_SITES_FAILURE]);
    if (type === types.GET_FLOORPLAN_SITES_FAILURE) {
      throw new Error(error);
    }
    const sites = yield select(selectors.getSites);
    if (sites.length === 0) {
      throw new Error(messages.NO_SEARCH_RESULTS);
    }
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedSite', value: siteId });
    const primarySiteInd = sites.filter(el => el.siteId == siteId)[0].primarySiteInd
    //load strucure
    let structures = yield select(selectors.getStructuresBySiteId, siteId, 1);
    if (!structures) {
      yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA, siteId });
      // yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA_2, siteId });
      // yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA_3, siteId });

      const { type, error = '' } = yield take([types.GET_FLOORPLAN_STRUCTURES_SUCCESS, types.GET_FLOORPLAN_STRUCTURES_FAILURE]);
      if (type === types.GET_FLOORPLAN_STRUCTURES_SUCCESS) {
        structures = yield select(selectors.getStructuresBySiteId, siteId, 1);
      } else {
        throw new Error(error);
      }
    }
    if (structures.length === 0) {
      throw new Error(messages.SELECT_SITE);
    }
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedBuilding', value: structId });

    let floors = yield select(selectors.getFloorsByStructureId, structId, 1);
    if (!floors) {
      yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA, structId });
      const { type, error = '' } = yield take([types.GET_FLOORPLAN_FLOORS_SUCCESS, types.GET_FLOORPLAN_FLOORS_FAILURE]);
      if (type === types.GET_FLOORPLAN_FLOORS_SUCCESS) {
        floors = yield select(selectors.getFloorsByStructureId, structId, 1);
      } else {
        throw new Error(error);
      }
    }
    if (floors.length === 0) {
      throw new Error(messages.SELECT_SITE);
    }
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedFloor', value: floorId });
    if (floors.length > 0) {
      yield call(setFloorPlan, { selectedSite: siteId, selectedBuilding: structId, selectedFloor: floorId, fromRouteInstanceSearch });
    }
  } catch (error) {
    AlertManager.error(error.message);
  }
}

function* requestDefaultFloorplanFloors(action) {
  try {
    const { structId, siteId, sctructNmTxt, primarySiteInd } = action;
    let floors = yield select(selectors.getFloorsByStructureId, structId, 1);
    const sites = yield select(selectors.getSites);
    const site = sites.filter(el => el.siteId == siteId)[0];

    yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA, structId, primarySiteInd: site.primarySiteInd, siteId });
    yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA_2, structId, siteId, sctructNmTxt, primarySiteInd: site.primarySiteInd });
    const { type, error = '' } = yield take([types.GET_FLOORPLAN_FLOORS_SUCCESS, types.GET_FLOORPLAN_FLOORS_FAILURE]);
    if (type === types.GET_FLOORPLAN_FLOORS_SUCCESS) {
      floors = yield select(selectors.getFloorsByStructureId, structId, 1);
    }
    if (!floors || floors.length === 0) {
      throw new Error(messages.SELECT_SITE);
    }
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedFloor', value: floors[0].floorId });
    if (action.firstLoad && floors.length > 0) {
      yield call(setFloorPlan, { selectedSite: siteId, selectedBuilding: structId, selectedFloor: floors[0].floorId });
    }
  } catch (error) {
    console.log(error)
    AlertManager.error(error.message);
  }
}

function* requestDefaultFloorplanStructures(action) {
  try {
    const { siteId, firstLoad = false } = action;
    let structures = yield select(selectors.getStructuresBySiteId, siteId, 1);
    const sites = yield select(selectors.getSites);
    const primarySiteInd = sites.filter(el => el.siteId == siteId)[0].primarySiteInd
    if (!structures) {
      yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA, siteId, primarySiteInd });
      // yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA_2, siteId });
      // yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA_3, siteId });

      const { type, error = '' } = yield take([types.GET_FLOORPLAN_STRUCTURES_SUCCESS, types.GET_FLOORPLAN_STRUCTURES_SUCCESS_2, types.GET_FLOORPLAN_STRUCTURES_FAILURE]);
      if (type === types.GET_FLOORPLAN_STRUCTURES_SUCCESS) {
        structures = yield select(selectors.getStructuresBySiteId, siteId, 1);
      } else {
        throw new Error(error);
      }
    }
    if (structures.length === 0) {
      yield call(requestDefaultFloorplanFloors, { siteId, structId, firstLoad, primarySiteInd });
      throw new Error(messages.SELECT_SITE);
    }
    const found = structures.findIndex(o => o.sctructNmTxt === '1NET');
    const structId = found > 0 ? structures[found].structId : structures[0].structId;
    const sctructNmTxt = found > 0 ? structures[found].sctructNmTxt : structures[0].sctructNmTxt;
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedBuilding', value: structId });
    yield call(requestDefaultFloorplanFloors, { siteId, structId, sctructNmTxt, firstLoad, primarySiteInd });
  } catch (error) {
    AlertManager.error(error.message);
  }
}

function* requestDefaultFloorplanSites(action) {
  try {
    const { searchStr } = action;

    yield put({ type: types.GET_FLOORPLAN_SITES_SAGA, searchStr });
    // yield put({ type: types.GET_FLOORPLAN_SITES_SAGA_2, searchStr });
    // yield put({ type: types.GET_FLOORPLAN_SITES_SAGA_3, searchStr });

    const { type, error = '' } = yield take([types.GET_FLOORPLAN_SITES_SUCCESS, types.GET_FLOORPLAN_SITES_SUCCESS_2, types.GET_FLOORPLAN_SITES_FAILURE]);
    if (type === types.GET_FLOORPLAN_SITES_FAILURE) {
      throw new Error(error);
    }
    const sites = yield select(selectors.getSites);
    if (sites.length === 0) {
      throw new Error(messages.NO_SEARCH_RESULTS);
    }
    const siteId = (sites.length > 0 ? sites[0].siteId : 0);
    const primarySiteInd = (sites.length > 0 ? sites[0].primarySiteInd : 0);
    const firstLoad = true;
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedSite', value: siteId });
    yield call(requestDefaultFloorplanStructures, { siteId, firstLoad, primarySiteInd });
  } catch (error) {
    AlertManager.info(error.message);
  }
}

function* requestDefaultFloorplanSitesForMe(action) {
  try {
    const { searchStr, selectedRackTID } = action;

    yield put({ type: types.GET_FLOORPLAN_SITES_SAGA, searchStr });
    // yield put({ type: types.GET_FLOORPLAN_SITES_SAGA_2, searchStr });
    // yield put({ type: types.GET_FLOORPLAN_SITES_SAGA_3, searchStr });

    const { type, error = '' } = yield take([types.GET_FLOORPLAN_SITES_SUCCESS, types.GET_FLOORPLAN_SITES_FAILURE]);
    if (type === types.GET_FLOORPLAN_SITES_FAILURE) {
      throw new Error(error);
    }
    const sites = yield select(selectors.getSites);
    if (sites.length === 0) {
      throw new Error(messages.NO_SEARCH_RESULTS);
    }
    const siteId = (sites.length > 0 ? sites[0].siteId : 0);
    const firstLoad = true;
    yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedSite', value: siteId });
    //yield call(requestDefaultFloorplanStructures, { siteId, firstLoad });
    try {
      let structures = yield select(selectors.getStructuresBySiteId, siteId, 1);
      if (!structures) {
        yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA, siteId });
        // yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA_2, siteId });
        // yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA_3, siteId });

        const { type, error = '' } = yield take([types.GET_FLOORPLAN_STRUCTURES_SUCCESS, types.GET_FLOORPLAN_STRUCTURES_FAILURE]);
        if (type === types.GET_FLOORPLAN_STRUCTURES_SUCCESS) {
          structures = yield select(selectors.getStructuresBySiteId, siteId, 1);
        } else {
          throw new Error(error);
        }
      }
      if (structures.length === 0) {
        throw new Error(messages.SELECT_SITE);
      }
      const found = structures.findIndex(o => o.sctructNmTxt === '1NET');
      const structId = (found > 0 ? structures[found].structId : structures[0].structId);
      yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedBuilding', value: structId });
      try {
        let floors = yield select(selectors.getFloorsByStructureId, structId, 1);
        if (!floors) {
          yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA, structId });
          const { type, error = '' } = yield take([types.GET_FLOORPLAN_FLOORS_SUCCESS, types.GET_FLOORPLAN_FLOORS_FAILURE]);
          if (type === types.GET_FLOORPLAN_FLOORS_SUCCESS) {
            floors = yield select(selectors.getFloorsByStructureId, structId, 1);
          } else {
            throw new Error(error);
          }
        }
        if (floors.length === 0) {
          throw new Error(messages.SELECT_SITE);
        }
        yield put({ type: types.SET_FLOORPLAN_MODAL_SELECTED, selectedItem: 'selectedFloor', value: floors[0].floorId });
        if (action.firstLoad && floors.length > 0) {
          yield call(setFloorPlan, { selectedSite: selectedRackTID.site, selectedBuilding: selectedRackTID.building, selectedFloor: selectedRackTID.floor });
        }
      } catch (error) {
        AlertManager.error(error.message);
      }
    } catch (error) {
      AlertManager.error(error.message);
    }
  } catch (error) {
    AlertManager.error(error.message);
  }
}

function* requestFloorplanTreeData(action) {
  try {
    const { index, list, rowData: { siteId, structId, floorId, zoneId, subClass, majorVendorId, footPrintInstId, itemInstncId, expanded } } = action;

    switch (list) {
      case 'sitesList':
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded } });
        const structures = yield select(selectors.getStructuresBySiteId, siteId, 1);
        if (!structures) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true } });
          yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA, siteId });
          yield take(types.GET_FLOORPLAN_STRUCTURES_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false } });
        }
        break;
      case 'structuresList':
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: siteId });
        const floors = yield select(selectors.getFloorsByStructureId, structId, 1);
        if (!floors) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: siteId });
          yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA, structId });
          yield take(types.GET_FLOORPLAN_FLOORS_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: siteId });
        }
        break;
      case 'floorsList':
        const { ancestorData: [siteData, structureData], rowData: { floorNmTxt: floorName } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: structId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: structId });
          yield put({ type: types.GET_FLOORPLAN_ZONES_SAGA, siteId: siteData.siteId, structureName: structureData.sctructNmTxt, floorName, floorId });
          yield take(types.GET_FLOORPLAN_ZONES_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: structId });
        }
        break;

      case 'zonesList':
        const { ancestorData: [site, structure, floor], } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: floor.floorId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: floor.floorId });
          yield put({
            type: types.GET_FLOORPLAN_EQPTSUBCLS_SAGA, siteId: site.siteId, structureName: structure.sctructNmTxt, floorName: floor.floorNmTxt, floorId: floor.floorId, zoneId: Number(action.rowData.zoneId)
          });
          yield take(types.GET_FLOORPLAN_EQPTSUBCLS_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: floor.floorId });
        }
        break;

      case 'eqptSubClsList':
        const { ancestorData: [sitesDT, structsDT, floorsDT, zonesDT], rowData: { subClass: equipmentcode } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: zonesDT.zoneId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: zonesDT.zoneId });
          yield put({ type: types.GET_FLOORPLAN_VENDOR_SAGA, siteId: sitesDT.siteId, structureName: structsDT.sctructNmTxt, floorName: floorsDT.floorNmTxt, floorId, equipmentcode });
          yield take(types.GET_FLOORPLAN_VENDOR_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: zonesDT.zoneId });
        }
        break;

      case 'vendorList':
        const { ancestorData: [siteDt, structureDt, floorData, eqptSubClsData], rowData: { vendorNmTxt } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: subClass });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: subClass });
          yield put({ type: types.GET_FLOORPLAN_RACKS_SAGA, siteId: siteDt.siteId, structureName: structureDt.sctructNmTxt, floorName: floorData.floorNmTxt, subClass: eqptSubClsData.eqptSubClsNmTxt, majorVendorId, vendorNmTxt });
          yield take(types.GET_FLOORPLAN_RACKS_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: subClass });
        }
        break;
      case 'racksList':
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: majorVendorId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: majorVendorId });
          yield put({ type: types.GET_FLOORPLAN_SHELVES_SAGA, footPrintInstId });
          yield take(types.GET_FLOORPLAN_SHELVES_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: majorVendorId });
        }
        break;
      case 'shelvesList':
        const { ancestorData: [, , , , , rackData] } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: rackData.footPrintInstId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: rackData.footPrintInstId });
          yield put({ type: types.GET_FLOORPLAN_CARDS_SAGA, itemInstncId });
          yield take(types.GET_FLOORPLAN_CARDS_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: rackData.footPrintInstId });
        }
        break;
      case 'cardsList':
        const { ancestorData: [, , , , , , shelfData] } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: shelfData.itemInstncId });
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error.message);
  }
}

function* requestFloorplanTreeData2(action) {
  try {
    const { index, list, rowData: { siteId, structId, sctructNmTxt, floorId, eqpType, majorVendorId, footPrintInstId, itemInstncId, expanded } } = action;
    switch (list) {
      case 'sitesList2':
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded } });
        const structures = yield select(selectors.getStructuresBySiteId, siteId, 2);
        if (!structures) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true } });
          yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA_2, siteId });
          yield take(types.GET_FLOORPLAN_STRUCTURES_SUCCESS_2);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false } });
        }
        break;
      case 'structuresList2':
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: siteId });
        const floors = yield select(selectors.getFloorsByStructureId, structId, 2);
        if (!floors) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: siteId });
          yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA_2, structId, siteId, sctructNmTxt });
          yield take(types.GET_FLOORPLAN_FLOORS_SUCCESS_2);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: siteId });
        }
        break;
      case 'floorsList2':
        const { ancestorData: [siteData, structureData], rowData: { floorNmTxt: floorName } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: structId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: structId });
          // yield put({ type: types.GET_FLOORPLAN_EQPTSUBCLS_SAGA_2, siteId: siteData.siteId, structureName: structureData.sctructNmTxt, floorName, floorId });
          // yield take(types.GET_FLOORPLAN_EQPTSUBCLS_SUCCESS_2);
          yield put({ type: types.GET_FLOORPLAN_EQPTYPE_SAGA_2, siteId: siteData.siteId, structureName: structureData.sctructNmTxt, floorName, floorId });
          yield take(types.GET_FLOORPLAN_EQPTYPE_SUCCESS_2);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: structId });
        }
        break;
      case 'eqpTypeList2':
        const { ancestorData: [sites, structs, floor], rowData: { eqpType: eqpType } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: floor.floorKeyId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: floor.floorKeyId });
          yield put({ type: types.GET_FLOORPLAN_VENDOR_SAGA_2, siteId: sites.siteId, structureName: structs.sctructNmTxt, floorName: floor.floorNmTxt, floorId, eqpType });
          yield take(types.GET_FLOORPLAN_VENDOR_SUCCESS_2);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: floor.floorKeyId });
        }
        break;
      case 'vendorList2':
        const { ancestorData: [siteDt, structureDt, floorData, eqpTypeData], rowData: { vendorName } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: eqpTypeData.eqpType });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: eqpTypeData.eqpType });
          yield put({ type: types.GET_FLOORPLAN_RACKS_SAGA_2, siteId: siteDt.siteId, clliCd: siteDt.clliCd, siteCd: siteDt.siteCd, structureName: structureDt.sctructNmTxt, floorName: floorData.floorNmTxt, eqpType: eqpTypeData.eqpType, majorVendorId, vendorName });
          yield take(types.GET_FLOORPLAN_RACKS_SUCCESS_2);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: eqpTypeData.eqpType });
        }
        break;
      case 'racksList2':
        const { ancestorData: [, , , , vendorData] } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: vendorData.vendorKeyId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: vendorData.vendorKeyId });
          yield put({ type: types.GET_FLOORPLAN_SHELVES_SAGA, footPrintInstId });
          yield take(types.GET_FLOORPLAN_SHELVES_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: vendorData.vendorKeyId });
        }
        break;
      case 'shelvesList':
        const { ancestorData: [, , , , , rackData] } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: rackData.footPrintInstId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: rackData.footPrintInstId });
          yield put({ type: types.GET_FLOORPLAN_CARDS_SAGA, itemInstncId });
          yield take(types.GET_FLOORPLAN_CARDS_SUCCESS);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: rackData.footPrintInstId });
        }
        break;
      case 'cardsList':
        const { ancestorData: [, , , , , , shelfData] } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: shelfData.itemInstncId });
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error.message);
  }
}

function* requestFloorplanTreeData2Sub(action) {
  try {
    const { index, list, rowData: { siteId, floorId, subClass, majorVendorId, footPrintInstId, itemInstncId, expanded } } = action;
    switch (list) {
      case 'subsitesList2':
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded } });
        const structures = yield select(selectors.getStructuresBySiteId, siteId, 2);
        if (!structures) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true } });
          yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA_2_SUB, siteId });
          yield take(types.GET_FLOORPLAN_FLOORS_SUCCESS_2_SUB);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false } });
        }
        break;
      case 'subsiteFloorsList2':
        const { ancestorData: [siteData], rowData } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: siteData.siteId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: siteData.siteId });
          yield put({ type: types.GET_FLOORPLAN_EQPTSUBCLS_SAGA_2_SUB, siteId: siteData.siteId, floorName: rowData.floorName, floorId: rowData.floorId });
          yield take(types.GET_FLOORPLAN_EQPTSUBCLS_SUCCESS_2_SUB);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: siteData.siteId });
        }
        break;

      case 'subsiteEqptSubClsList2':
        const { ancestorData: [sites, floor], rowData: { subClass: equipmentcode } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: floor.floorId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: floor.floorId });
          yield put({ type: types.GET_FLOORPLAN_VENDOR_SAGA_2_SUB, siteId: sites.siteId, floorName: floor.floorNmTxt, floorId: floor.floorId, equipmentcode });
          yield take(types.GET_FLOORPLAN_VENDOR_SUCCESS_2_SUB);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: floor.floorId });
        }
        break;

      case 'subsiteVendorsList2':
        const { ancestorData: [siteDt, floorData, eqptSubClsData], rowData: { vendorName, majorVendorId } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: eqptSubClsData.subClass });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: eqptSubClsData.subClass });
          yield put({ type: types.GET_FLOORPLAN_RACKS_SAGA_2_SUB, siteId: siteDt.siteId, floorName: floorData.floorNmTxt, floorId: floorData.floorId, subClass: eqptSubClsData.subClass, majorVendorId, vendorName });
          yield take(types.GET_FLOORPLAN_RACKS_SUCCESS_2_SUB);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: eqptSubClsData.subClass });
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error.message);
  }
}

function* requestFloorplanTreeData3(action) {
  try {
    const { index, list, rowData: { siteId, structId, floorId, subClass, majorVendorId, footPrintInstId, itemInstncId, expanded } } = action;
    switch (list) {
      case 'sitesList3':
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded } });
        const structures = yield select(selectors.getStructuresBySiteId, siteId, 3);
        if (!structures) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true } });
          yield put({ type: types.GET_FLOORPLAN_STRUCTURES_SAGA_3, siteId });
          yield take(types.GET_FLOORPLAN_STRUCTURES_SUCCESS_3);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false } });
        }
        break;
      case 'structuresList3':
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: siteId });
        const floors = yield select(selectors.getFloorsByStructureId, structId, 3);
        if (!floors) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: siteId });
          yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA_3, structId });
          yield take(types.GET_FLOORPLAN_FLOORS_SUCCESS_3);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: siteId });
        }
        break;
      case 'floorsList3':
        const { ancestorData: [siteData, structureData], rowData: { floorNmTxt: floorName } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: structId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: structId });
          yield put({ type: types.GET_FLOORPLAN_ZONES_SAGA_3, siteId: siteData.siteId, structureName: structureData.sctructNmTxt, floorName, floorId });
          yield take(types.GET_FLOORPLAN_ZONES_SUCCESS_3);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: structId });
        }
        break;
      case 'zonesList3':
        const { ancestorData: [site, structure, floor], rowData: { zonNmTxt, zoneId } } = action;
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: floor.floorId });
        if (!expanded) {
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: floor.floorId });
          yield put({ type: types.GET_FLOORPLAN_RACKS_SAGA_3, clliCd: site.clliCd, siteCd: site.siteCd, structureName: structure.sctructNmTxt, zoneName: zonNmTxt, zoneId });
          yield take(types.GET_FLOORPLAN_RACKS_SUCCESS_3);
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: floor.floorId });
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error.message);
  }
}
function* requestFloorplanTreeData3Sub(action) {
  try {
    const { index, list, rowData: { siteId, floorId, subClass, majorVendorId, footPrintInstId, itemInstncId, expanded } } = action;
    switch (list) {
      case 'subsitesList3':
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded } });
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true } });
        yield put({ type: types.GET_FLOORPLAN_SECOND_LEVEL_3, siteId });
        yield take(types.GET_FLOORPLAN_SECOND_LEVEL_3_SUCCESS);
        yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false } });

        break;
      case 'secondLevel3':
        if (action.rowData.type == types.FLOOR) {
          const { ancestorData: [siteData], rowData: { floorNmTxt: floorName } } = action;
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: siteData.siteId });
          if (!expanded) {
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: siteData.siteId });
            yield put({ type: types.GET_FLOORPLAN_ZONES_SAGA_3_SUB, siteId: siteData.siteId, floorName, floorId: action.rowData.floorId });
            yield take(types.GET_FLOORPLAN_ZONES_SUCCESS_3_SUB);
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: siteData.siteId });
          }
        } else if (action.rowData.type == types.ZONE) {
          const { ancestorData: [site], rowData: { zoneId } } = action;
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: site.siteId });
          if (!expanded) {
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: site.siteId });
            yield put({ type: types.GET_FLOORPLAN_RACKS_SAGA_3_SUB, siteId: site.siteId, zoneId });
            yield take(types.GET_FLOORPLAN_RACKS_SUCCESS_3_SUB);
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: site.siteId });
          }
        } else if (action.rowData.type == types.STRUCTURE) {
          const { ancestorData: [site], rowData: { structId, structIdTree } } = action;
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: site.siteId });
          if (!expanded) {
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: site.siteId });
            yield put({ type: types.GET_FLOORPLAN_FLOORS_SAGA_3_SUB, structId, structIdTree, siteId: site.siteId });
            yield take(types.GET_FLOORPLAN_FLOORS_SUCCESS_3_SUB);
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: site.siteId });
          }
        }

        break;
      case 'thirdLevel3':
        if (action.rowData.type == types.FLOOR) {
          const { ancestorData: [siteData, structureData], rowData: { floorNmTxt: floorName, floorIdTree } } = action;
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: structureData.structIdTree });
          if (!expanded) {
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: structureData.structIdTree });
            yield put({ type: types.GET_FLOORPLAN_ZONES_SAGA_3_SUB_STR, siteId: siteData.siteId, floorName, floorId: action.rowData.floorId, floorIdTree });
            yield take(types.GET_FLOORPLAN_ZONES_SUCCESS_3_SUB_STR);
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: structureData.structIdTree });
          }
        } else if (action.rowData.type == types.ZONE) {
          const { ancestorData: [site, floor], rowData: { zoneId } } = action;
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: floor.floorIdTree });
          if (!expanded) {
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: floor.floorIdTree });
            yield put({ type: types.GET_FLOORPLAN_RACKS_SAGA_3_SUB_2, siteId: site.siteId, zoneId });
            yield take(types.GET_FLOORPLAN_RACKS_SUCCESS_3_SUB_2);
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: floor.floorIdTree });
          }
        }
        break;
      case "fourthLevel3":
        if (action.rowData.type == types.ZONE) {
          const { ancestorData: [site, structure, floor], rowData: { zoneId, zoneIdTree } } = action;
          yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { expanded: !expanded }, objKey: floor.floorIdTree });
          if (!expanded) {
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: true }, objKey: floor.floorIdTree });
            yield put({ type: types.GET_FLOORPLAN_RACKS_SAGA_3_SUB_2_ZON, siteId: site.siteId, zoneId, zoneIdTree });
            yield take(types.GET_FLOORPLAN_RACKS_SUCCESS_3_SUB_2_ZON);
            yield put({ type: types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY, index, list, modifyValues: { loading: false }, objKey: floor.floorIdTree });
          }
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error.message);
  }
}

const watchers = [
  takeEvery(types.GET_FLOORPLAN_SITES_SAGA, requestFloorplanSites),
  takeEvery(types.GET_FLOORPLAN_SITES_SAGA_2, requestFloorplanSites2),
  takeEvery(types.GET_FLOORPLAN_SITES_SAGA_3, requestFloorplanSites3),

  takeEvery(types.GET_FLOORPLAN_STRUCTURES_SAGA, requestFloorplanStructures),
  takeEvery(types.GET_FLOORPLAN_STRUCTURES_SAGA_2, requestFloorplanStructures2),
  takeEvery(types.GET_FLOORPLAN_STRUCTURES_SAGA_3, requestFloorplanStructures3),

  takeEvery(types.GET_FLOORPLAN_FLOORS_SAGA, requestFloorplanFloors),
  takeEvery(types.GET_FLOORPLAN_FLOORS_SAGA_2, requestFloorplanFloors2),
  takeEvery(types.GET_FLOORPLAN_FLOORS_SAGA_2_SUB, requestFloorplanFloors2Sub),
  takeEvery(types.GET_FLOORPLAN_FLOORS_SAGA_3, requestFloorplanFloors3),
  takeEvery(types.GET_FLOORPLAN_FLOORS_SAGA_3_SUB, requestFloorplanFloors3Sub),


  takeEvery(types.GET_FLOORPLAN_SECOND_LEVEL_3, requestFloorplanSecondLevel3Sub),


  takeEvery(types.GET_FLOORPLAN_ZONES_SAGA, requestFloorplanZones),
  takeEvery(types.GET_FLOORPLAN_ZONES_SAGA_3, requestFloorplanZones3),
  takeEvery(types.GET_FLOORPLAN_ZONES_SAGA_3_SUB, requestFloorplanZones3Sub),
  takeEvery(types.GET_FLOORPLAN_ZONES_SAGA_3_SUB_STR, requestFloorplanZones3SubStr),


  takeEvery(types.GET_FLOORPLAN_EQPTSUBCLS_SAGA, requestFloorplanEqptsubcls),
  takeEvery(types.GET_FLOORPLAN_EQPTSUBCLS_SAGA_2, requestFloorplanEqptsubcls2),
  takeEvery(types.GET_FLOORPLAN_EQPTSUBCLS_SAGA_2_SUB, requestFloorplanEqptsubcls2Sub),

  takeEvery(types.GET_FLOORPLAN_EQPTYPE_SAGA_2, requestFloorplanEqptType2),

  takeEvery(types.GET_FLOORPLAN_VENDOR_SAGA_2, requestFloorplanvendors2),
  takeEvery(types.GET_FLOORPLAN_VENDOR_SAGA_2_SUB, requestFloorplanVendors2Sub),

  takeEvery(types.GET_FLOORPLAN_RACKS_SAGA_2, requestFloorplanRacks2),
  takeEvery(types.GET_FLOORPLAN_RACKS_SAGA_2_SUB, requestFloorplanRacks2Sub),
  takeEvery(types.GET_FLOORPLAN_RACKS_SAGA_3, requestFloorplanRacks3),
  takeEvery(types.GET_FLOORPLAN_RACKS_SAGA_3_SUB, requestFloorplanRacks3Sub),
  takeEvery(types.GET_FLOORPLAN_RACKS_SAGA_3_SUB_2, requestFloorplanRacks3Sub2),
  takeEvery(types.GET_FLOORPLAN_RACKS_SAGA_3_SUB_2_ZON, requestFloorplanRacks3Sub2Zon),



  takeEvery(types.GET_FLOORPLAN_SHELVES_SAGA, requestFloorplanShelves),
  takeEvery(types.GET_FLOORPLAN_CARDS_SAGA, requestFloorplanCards),
  takeEvery(types.GET_FLOORPLAN_DEFAULT_SITES_SAGA, requestDefaultFloorplanSites),
  takeEvery(types.GET_FLOORPLAN_DEFAULT_SITES_SAGA_FOR_ME, requestDefaultFloorplanSitesForMe),
  takeEvery(types.GET_FLOORPLAN_DEFAULT_STRUCTURES_SAGA, requestDefaultFloorplanStructures),
  takeEvery(types.GET_FLOORPLAN_DEFAULT_FLOORS_SAGA, requestDefaultFloorplanFloors),

  takeEvery(types.GET_FLOORPLAN_TREE_DATA_SAGA, requestFloorplanTreeData),
  takeEvery(types.GET_FLOORPLAN_TREE_DATA_SAGA_2, requestFloorplanTreeData2),
  takeEvery(types.GET_FLOORPLAN_TREE_DATA_SAGA_2_SUB, requestFloorplanTreeData2Sub),
  takeEvery(types.GET_FLOORPLAN_TREE_DATA_SAGA_3, requestFloorplanTreeData3),
  takeEvery(types.GET_FLOORPLAN_TREE_DATA_SAGA_3_SUB, requestFloorplanTreeData3Sub),


  takeEvery(types.SET_FLOORPLAN_SAGA, setFloorPlan),
  takeEvery(types.LOCATE_FLOORPLAN, requestLocateFloorplanFloors),
  takeEvery(types.LOCATE_TREEVIEW, requestLocateTreeview),
];

export default watchers;
