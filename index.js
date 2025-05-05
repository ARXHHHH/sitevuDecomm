import types from 'store/constants/FloorPlanTypes';

const showTreeViewDefault = localStorage.getItem('show_tree_view');

const INITIAL_STATE = {
  sitesList: [],
  sitesList2: [],
  subsitesList2: [],
  sitesList3: [],
  subsitesList3: [],

  structuresList: {},
  structuresList2: {},
  structuresList3: {},

  floorsList: {},
  floorsList2: {},
  subsiteFloorsList2: {},
  floorsList3: {},

  secondLevel3: {},

  zonesList: {},
  zonesList3: {},

  thirdLevel3: {},
  fourthLevel3: {},
  fifthLevel3 : {},

  eqptSubClsList: {},
  eqptSubClsList2: {},
  subsiteEqptSubClsList2: {},

  eqpTypeList2: {},

  vendorList: {},
  vendorList2: {},
  subsiteVendorsList2: {},

  racksList: {},
  racksList2: {},
  subsiteRacksList2: {},
  racksList3: {},
  subsiteRacksList3: {},

  shelvesList: {},

  cardsList: {},

  showTreeView: showTreeViewDefault === 'true',
  canAccessCilli: false,
  selectedInfo: {
    rack: {},
    rightRack: {},
    shelf: {},
    card: {},
  },
  rightSelectedInfo: {
  },
  selectedEquipment: null,
  changeModalSelection: {
    selectedSite: null,
    selectedBuilding: null,
    selectedFloor: null,
  },
  locatingEquipmentInProcess: false,
};

export default function FloorPlanReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.GET_FLOORPLAN_SITES_SUCCESS:
      return { ...state, sitesList: action.data, error: null, type: action.type };
    case types.GET_FLOORPLAN_SITES_SUCCESS_2:
      return { ...state, sitesList2: action.data, error: null, type: action.type };
    case types.GET_FLOORPLAN_SUBSITES_SUCCESS_2:
      return {...state, subsitesList2: action.data, error: null, type: action.type};
    case types.GET_FLOORPLAN_SITES_SUCCESS_3:
      return { ...state, sitesList3: action.data, error: null, type: action.type };
    case types.GET_FLOORPLAN_SUBSITES_SUCCESS_3:
      return { ...state, subsitesList3: action.data, error: null, type: action.type };

      case types.GET_FLOORPLAN_SECOND_LEVEL_3_SUCCESS:
        return { ...state, secondLevel3: { ...state.secondLevel3, [action.siteId]: action.data }, error: null, type: action.type };

    case types.GET_FLOORPLAN_STRUCTURES_SUCCESS:
      return { ...state, structuresList: { ...state.structuresList, [action.siteId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_STRUCTURES_SUCCESS_2:
      return { ...state, structuresList2: action.reset ? {} : { ...state.structuresList2, [action.siteId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_STRUCTURES_SUCCESS_3:
      return { ...state, structuresList3: { ...state.structuresList3, [action.siteId]: action.data }, error: null, type: action.type };

    case types.GET_FLOORPLAN_FLOORS_SUCCESS:
      return { ...state, floorsList: { ...state.floorsList, [action.structureId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_FLOORS_SUCCESS_2:
      return { ...state, floorsList2: action.reset ? {} : { ...state.floorsList2, [action.structureId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_FLOORS_SUCCESS_2_SUB:
      return { ...state, subsiteFloorsList2: { ...state.subsiteFloorsList2, [action.siteId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_FLOORS_SUCCESS_3:
      return { ...state, floorsList3: { ...state.floorsList3, [action.structureId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_FLOORS_SUCCESS_3_SUB:
      return { ...state, thirdLevel3: { ...state.thirdLevel3, [action.structureId]: action.data }, error: null, type: action.type };

    case types.GET_FLOORPLAN_ZONES_SUCCESS:
      return { ...state, zonesList: { ...state.zonesList, [action.floorId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_ZONES_SUCCESS_3:
      return { ...state, zonesList3: { ...state.zonesList3, [action.floorId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_ZONES_SUCCESS_3_SUB:
      return { ...state, thirdLevel3: { ...state.thirdLevel3, [action.floorId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_ZONES_SUCCESS_3_SUB_STR:
      return { ...state, fourthLevel3: { ...state.fourthLevel3, [action.floorId]: action.data }, error: null, type: action.type };

    case types.GET_FLOORPLAN_EQPTSUBCLS_SUCCESS:
      return { ...state, eqptSubClsList: { ...state.eqptSubClsList, [action.zoneId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_EQPTSUBCLS_SUCCESS_2:
      return { ...state, eqptSubClsList2: { ...state.eqptSubClsList2, [action.floorId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_EQPTSUBCLS_SUCCESS_2_SUB:
      return { ...state, subsiteEqptSubClsList2: { ...state.subsiteEqptSubClsList2, [action.floorId]: action.data }, error: null, type: action.type };

    case types.GET_FLOORPLAN_EQPTYPE_SUCCESS_2:
      return { ...state, eqpTypeList2: { ...state.eqpTypeList2, [action.floorKeyId]: action.data }, error: null, type: action.type };

    case types.GET_FLOORPLAN_VENDOR_SUCCESS:
      return { ...state, vendorList: { ...state.vendorList, [action.subClass]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_VENDOR_SUCCESS_2:
      return { ...state, vendorList2: { ...state.vendorList2, [action.eqpType]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_VENDOR_SUCCESS_2_SUB:
      return { ...state, subsiteVendorsList2: { ...state.subsiteVendorsList2, [action.subClass]: action.data }, error: null, type: action.type };

    case types.GET_FLOORPLAN_RACKS_SUCCESS:
      return { ...state, racksList: { ...state.racksList, [action.majorVendorId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_RACKS_SUCCESS_2:
      return { ...state, racksList2: { ...state.racksList2, [action.vendorKeyId]: action.data }, error: null, type: action.type, indexPath: action.indexPath };
    case types.GET_FLOORPLAN_RACKS_SUCCESS_2_SUB:
      return { ...state, subsiteRacksList2: { ...state.subsiteRacksList2, [action.majorVendorId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_RACKS_SUCCESS_3:
      return { ...state, racksList3: { ...state.racksList3, [action.zoneId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_RACKS_SUCCESS_3_SUB:
      return { ...state, thirdLevel3: { ...state.thirdLevel3, [action.zoneId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_RACKS_SUCCESS_3_SUB_2:
      return { ...state, fourthLevel3: { ...state.fourthLevel3, [action.zoneId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_RACKS_SUCCESS_3_SUB_2_ZON:
      return { ...state, fifthLevel3: { ...state.fifthLevel3, [action.zoneId]: action.data }, error: null, type: action.type };

    case types.GET_FLOORPLAN_SHELVES_SUCCESS:
      return { ...state, shelvesList: { ...state.shelvesList, [action.footPrintInstId]: action.data }, error: null, type: action.type };
    case types.GET_FLOORPLAN_CARDS_SUCCESS:
      const subcardsList = {};
      const cardsList = action.data.filter((card) => {
        const isSubCard = card.parentInstncId > 0;
        if (isSubCard) {
          if (subcardsList[card.parentInstncId]) {
            subcardsList[card.parentInstncId].push(card);
          } else {
            subcardsList[card.parentInstncId] = [card];
          }
        }
        return !isSubCard;
      });
      return { ...state, cardsList: { ...state.cardsList, [action.itemInstncId]: cardsList }, subcardsList: { ...state.subcardsList, ...subcardsList }, error: null, type: action.type };
    case types.SET_FLOORPLAN_SUCCESS:
      let selectedRack = action.rack || {};
      if (action.data.fromRouteInstanceSearch) {
        selectedRack = { ...state.selectedInfo.rack }
      }
      return { ...state, ...action.data, selectedInfo: { ...INITIAL_STATE.selectedInfo, rack: selectedRack }, error: null, type: action.type };
    case types.SET_FLOORPLAN_MODAL_SELECTED:
      return { ...state, changeModalSelection: { ...state.changeModalSelection, [action.selectedItem]: action.value } };
    case types.SET_FLOORPLAN_SELECTED_INFO:
      return { ...state, selectedInfo: { ...state.selectedInfo, ...action.selectedInfo } };
    case types.SET_TREEVIEW_RIGHT_SELECTED_INFO:
      return { ...state, rightSelectedInfo: { ...state.rightSelectedInfo, ...action.rightSelectedInfo } };
    case types.LOCATE_SELECTED_EQUIPMENT:
      return { ...state, selectedEquipment: { ...state.equipment, ...action.selectedEquipment }, locatingEquipmentInProcess: true };
    case types.MODIFY_FLOORPLAN_CUSTOM_PROPERTY:
      const { index, list, modifyValues, objKey } = action;
      // console.log('list', list, state[list], objKey);

      
      if (objKey && state[list][objKey]) {
        return { ...state, [list]: { ...state[list], [objKey]: state[list][objKey].map((item, i) => (index === i ? { ...item, ...modifyValues } : item)) } };
      }
      // console.log('index', index);
      return { ...state, [list]: state[list].map((item, i) => (index === i ? { ...item, ...modifyValues } : item)) };
    case types.SHOW_FLOORPLAN_TREEVIEW:
      const { showTreeView } = action;
      localStorage.setItem('show_tree_view', showTreeView);
      return { ...state, showTreeView: showTreeView };
    case types.UPDATE_CAN_ACCESS_CILLI:
      const { canAccessCilli } = action;
      return { ...state, canAccessCilli: canAccessCilli };
    case types.SET_FLOORPLAN_LOADING:
    case types.GET_FLOORPLAN_SITES_LOADING:
    case types.GET_FLOORPLAN_STRUCTURES_LOADING:
    case types.GET_FLOORPLAN_FLOORS_LOADING:
    case types.GET_FLOORPLAN_ZONES_LOADING:
    case types.GET_FLOORPLAN_EQPTSUBCLS_LOADING:
    case types.GET_FLOORPLAN_VENDOR_LOADING:
    case types.GET_FLOORPLAN_RACKS_LOADING:
    case types.GET_FLOORPLAN_SHELVES_LOADING:
    case types.GET_FLOORPLAN_CARDS_LOADING:
    case types.GET_FLOORPLAN_SECOND_LEVEL_3_LOADING:
      return { ...state, isLoading: action.isLoading, type: action.type };
    case types.SET_FLOORPLAN_FAILURE:
    case types.GET_FLOORPLAN_SITES_FAILURE:
    case types.GET_FLOORPLAN_FLOORS_FAILURE:
    case types.GET_FLOORPLAN_ZONES_FAILURE:
    case types.GET_FLOORPLAN_EQPTSUBCLS_FAILURE:
    case types.GET_FLOORPLAN_VENDOR_FAILURE:
    case types.GET_FLOORPLAN_RACKS_FAILURE:
    case types.GET_FLOORPLAN_SHELVES_FAILURE:
    case types.GET_FLOORPLAN_CARDS_FAILURE:
    case types.GET_FLOORPLAN_SECOND_LEVEL_3_FAILURE:
      return { ...state, error: action.error, errorType: action.errorType ? action.errorType : 'error', type: action.type };
    case types.GET_FLOORPLAN_STRUCTURES_FAILURE:
      return { ...state, structuresList: [], floorsList: [], error: action.error, errorType: action.errorType ? action.errorType : 'error', type: action.type };
    case types.RESET_TREE:
      return { ...state, structuresList: {}, floorsList: {}, floorsList2: {}, zonesList: {}, eqptSubClsList: {}, eqptSubClsList2: {}, eqpTypeList2: {} }
    default:
      return state;
  }
}
