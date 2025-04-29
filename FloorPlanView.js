import {
  Panel,
  ButtonToolbar,
  Glyphicon,
  OverlayTrigger,
  Tooltip,
  MenuItem,
} from 'react-bootstrap';
import { FloorPlanService } from 'utils/FloorPlanService';
import React, { PropTypes } from 'react';
// Add these imports at the top of your FloorPlanView.js file
import { bindActionCreators } from 'redux';
import store from '../../store';
import {requestFloorplanEqptType2} from '../../store/actions/floorPlanActions';
import $ from 'jquery';
import { RenderEngine } from 'lib/RenderEngine';
import { FloorPlan } from 'lib/FloorPlan';
import classNames from 'classnames';
import FloorPlanFilter from './FloorPlanFilter';
import FloorPlanTreeFilter from './FloorPlanTreeFilter';
import RackLocator from './RackLocator';
import AlertManager from 'components/AlertManager';
import _ from 'lodash';
import { Hide, isLTEZero } from 'components/Hide';
import NidModal from './NidModal';
import NidIcon from './NidIcon';
import VZButton from 'components/VZButton';
import FAIcon from 'components/FAIcon';
import LocateResultsModal from './LocateResultsModal';
import FloorPlanTreeView from 'store/containers/floorPlan/TreeViewContainer/FloorPlanTreeViewContainer';
import FloorPlanTreeView2 from 'store/containers/floorPlan/TreeViewContainer2/FloorPlanTreeViewContainer2';
import FloorPlanTreeView2Sub from 'store/containers/floorPlan/TreeViewContainer2/FloorPlanTreeViewContainer2Sub';
import FloorPlanTreeView3 from 'store/containers/floorPlan/TreeViewContainer3/FloorPlanTreeViewContainer3';
import FloorPlanTreeView3Sub from 'store/containers/floorPlan/TreeViewContainer3/FloorPlanTreeViewContainer3Sub';
import RackLocatorTree from './RackLocatorTree';




// set to false before committing changes
const USE_NID_DUMMY_DATA = false;
const floorplanApi = new FloorPlanService();
import nidDummyData from './nidDummyData.json';
import {updateRightRackSelection} from '../../store/actions/floorPlanActions';
  // Create bound action creators
  const boundActions = bindActionCreators({
    requestFloorplanEqptType2
  }, store.dispatch);
class FloorPlanView extends React.Component {
  static propTypes = {
    serviceId: PropTypes.number.isRequired,
    onNidNavigation: PropTypes.func.isRequired,
    setSelectedData: PropTypes.func,
    switchTreeView: PropTypes.func,
    onToggleConnectionMode: PropTypes.func.isRequired,
    cacheRackPos: PropTypes.func,
    onToggleRedLineSwap: PropTypes.func,
    onRightClickRack: PropTypes.func,
    onModalClick: PropTypes.func,
    locateRacksInAllSites: PropTypes.func,
    onGoToRack: PropTypes.func,
    connectionMode: PropTypes.bool.isRequired,
    swapMode: PropTypes.bool,
    site: PropTypes.any,
    building: PropTypes.any,
    floor: PropTypes.any,
    rackId: PropTypes.any,
    located: PropTypes.any,
    clliCd: PropTypes.any,
    intraLocationMode: PropTypes.any,
    selectedRack: PropTypes.any,
    rightRackFootprintId: PropTypes.any,
    nidMode: PropTypes.any,
    floorId: PropTypes.any,
    tidMode: PropTypes.any,
    rackLoader: PropTypes.any,
    selectedLocatedRack: PropTypes.object,
    isLoading: PropTypes.bool,
    showTreeView: PropTypes.bool,
    relocateRackId: PropTypes.any,
      siteId: PropTypes.string,
      structureName: PropTypes.string,
      floorName: PropTypes.string,
      floorId: PropTypes.string,
      eqpType: PropTypes.string,
      dispatch: PropTypes.func.isRequired
  };

  static defaultProps = {
    serviceId: 0,
    onNidNavigation: () => {},
    onToggleConnectionMode: () => {},
    connectionMode: false,
    swapMode: false,
    intraLocationMode: false,
    onToggleRedLineSwap: () => {},
    onGoToRack: () => {},
    showLocate: true,
  };

  constructor(props) {
    super(props);

    this.zoom = [
      0.125,
      0.25,
      0.375,
      0.5,
      0.75,
      0.875,
      1.0,
      1.175,
      1.25,
      1.5,
      1.75,
      2.0,
      2.5,
      3.0,
      3.5,
      4.0,
      5.0,
      10,
      25,
      50,
      75,
      100,
    ];

    this.state = {
      scale: 1,
      zoom: 1,
      panMode: true,
      selectMode: false,
      site: props.site,
      building: props.building,
      floor: props.floor,
      showContextMenu: false,
      contextMenuStyle: {},
      selectedId: '',
      colorMode: false,
      floorPlanStatus: null,
      filteredRackResults: [],
      clliCd: '_',
      filters: [
        {
          key: 'limits',
          name: 'Limits',
          checked: true,
          apply: floorPlan => {
            if (floorPlan) {
              floorPlan.toggleClass('limitless');
            }
          },
        },
        {
          key: 'rows',
          name: 'Rows',
          checked: true,
          apply: floorPlan => {
            if (floorPlan) {
              floorPlan.toggleClass('rowless');
            }
          },
        },
        {
          key: 'zones',
          name: 'Zones',
          checked: true,
          apply: floorPlan => {
            if (floorPlan) {
              floorPlan.toggleClass('zoneless');
            }
          },
        },
        {
          key: 'racks',
          name: 'Racks',
          checked: true,
          apply: floorPlan => {
            if (floorPlan) {
              floorPlan.toggleClass('rackless');
            }
          },
        },
      ],
      selectedSubclasses: [],
      nidRecommendations: [],
      nidRecommendationsLoaded: false,
      showNidModal: false,
      showLocateResultsModal: false,
      locationString: '',
      locatedRacks: [],
      locatedRacksDisplayList: [],
      locatedCriteria: '',
      locationFilters: {},
      switchView: false,
      tree: [],
      strSelected: 2,
      treeLevelSelected2: '',
      treeLevelSelected3: '',
      selectedLocateRack:null,
      treePathToExpand:null,
    };

    this.zoomIn = this.zoomIn.bind(this);
    this.zoomedIn = this.zoomedIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.zoomedOut = this.zoomedOut.bind(this);
    this.togglePan = this.togglePan.bind(this);
    this.setZoomLevelWrap = this.setZoomLevelWrap.bind(this);
    this.closeContextMenu = this.closeContextMenu.bind(this);
    this.onRackSelected = this.onRackSelected.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onSelection = this.onSelection.bind(this);
    this.onRightClickRack = this.onRightClickRack.bind(this);
    this.toggleColors = this.toggleColors.bind(this);
    this.toggleSelection = this.toggleSelection.bind(this);
    this.onRackHover = this.onRackHover.bind(this);
    this.resetZoom = this.resetZoom.bind(this);
    this.renderFilter = this.renderFilter.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.setupFloorPlan = this.setupFloorPlan.bind(this);
    this.onRackOut = this.onRackOut.bind(this);
    this.onSubclassSelected = this.onSubclassSelected.bind(this);
    this.handleLocateRack = this.handleLocateRack.bind(this);
    this.onManufacturerSelected = this.onManufacturerSelected.bind(this);
    this.nidFilter = this.nidFilter.bind(this);
    this.handleCancelGoToRack = this.handleCancelGoToRack.bind(this);
    this.handleGoToRack = this.handleGoToRack.bind(this);
    this.handleGoToRackRight = this.handleGoToRackRight.bind(this);
    this.selectRackByPosition = this.selectRackByPosition.bind(this);
    this.changeTreeSelected = this.changeTreeSelected.bind(this);
    this.loadRackOnSwitchView = false;
    this.refTreeElements = {};
  }

  componentDidMount() {
    if (!this.props.showTreeView) {
      this.buildFloor();
    }
    if (this.props.serviceId !== 0 && !_.isEmpty(this.props.clliCd)) {
      this.loadNIDRecommendations(this.props.clliCd, this.props.serviceId);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { isLoading } = nextProps;
    this.setState({
      isLoading,
    });
    const rightRackAvailableNext = this.isRightSelectionAvailable(nextProps);
    if (this.isRightSelectionAvailable() !== rightRackAvailableNext && !rightRackAvailableNext) {
      this.onRightClickRack();
    }
    if (
      !nextProps.showTreeView &&
      (this.props.site !== nextProps.site ||
      this.props.building !== nextProps.building ||
      this.props.floor !== nextProps.floor ||
      (this.props.rackId !== nextProps.rackId && (nextProps.intraLocationMode)))
    ) {
      if (this.floorPlan) {
        this.builder.remove(this.floorPlan);
        this.floorPlan = null;
      }
      this.setFloorPlan();
      if (this.props.fromTIDComponent && nextProps.selectedRackTID) {
        this.setupFloorPlan(nextProps.selectedRackTID.site, nextProps.building, nextProps.selectedRackTID.floor, nextProps.selectedRackTID.rackId);
      } else {
        this.setupFloorPlan(nextProps.site, nextProps.building, nextProps.floor, nextProps.rackId);
      }
    } else if (nextProps.fromTIDComponent && nextProps.selectedRackTID) {
      if(this.props.selectedRackTID) {
        if(this.props.selectedRackTID.site !== nextProps.selectedRackTID.site ||
          this.props.building !== nextProps.building ||
          this.props.selectedRackTID.floor !== nextProps.selectedRackTID.floor ||
          this.props.selectedRackTID.rackId !== nextProps.selectedRackTID.rackId) {
          this.setupFloorPlan(nextProps.selectedRackTID.site, nextProps.building, nextProps.selectedRackTID.floor, nextProps.selectedRackTID.rackId);
        }
      } else {
        this.setupFloorPlan(nextProps.selectedRackTID.site, nextProps.building, nextProps.selectedRackTID.floor, nextProps.selectedRackTID.rackId);
      }
    } else if (nextProps.nidMode === true && nextProps.selectedRack !== this.props.selectedRack) {
      this.selectRack(nextProps.selectedRack);
    } else if (
      nextProps.rackId !== this.props.rackId &&
      this.props.located
    ) {
      setTimeout(()=> {
        this.setupFloorPlan(nextProps.selectedRackTID.site, nextProps.building, nextProps.selectedRackTID.floor, nextProps.selectedRackTID.rackId);
        this.selectRackByPosition(nextProps.rackId);
      }, 500);
    }
    if (
      (this.props.serviceId !== nextProps.serviceId || this.props.clliCd !== nextProps.clliCd) &&
      (!_.isEmpty(nextProps.clliCd) && nextProps.serviceId !== 0)
    ) {
      this.loadNIDRecommendations(nextProps.clliCd, nextProps.serviceId);
    }

    if(this.props.rackId && nextProps.rackId !== this.props.rackId && nextProps.fromRouteInstanceSearch){
      if(!this.props.showTreeView) {
        const rackFound = this.floorPlan.racks.elements.find(
          rack => parseInt(rack.options.footPrintInstId, 10) === parseInt(nextProps.rackId, 10)
        );
        this.displayRackSelection(rackFound, 'selected');
        //this.defaultZoom();
      }
    }
  }

  componentWillUpdate() {
    if (typeof this.floorPlan !== 'undefined') {
      // start listening events
      this.floorPlan.racks.elements.forEach(rack => {
        rack.enableContextMenu();
        rack.clickable();
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.showTreeView && prevProps.showTreeView !== this.props.showTreeView) {
      this.loadRackOnSwitchView = true;
      this.buildFloor();
    }
  }

  componentWillUnmount() {
  if(this.builder){
    this.builder.off('mousewheel', this.closeContextMenu);
    this.builder.off('mousewheel', this.setZoomLevelWrap);
    this.builder.off('contextmenu', this.closeContextMenu);
    this.builder.off('click', this.closeContextMenu);
    this.builder.off('click', this.clearSelection);
    this.builder.off('selection', this.onSelection);
    this.builder.off('selection', this.togglePan);
    // Disabling/enabling clear selection while paning
    this.builder.off('panMove', builder => {
      // temporary disabling clearSelection
      builder.off('click', this.clearSelection);
      builder.on('panEnd', onPanEnd);
    });
    if (this.floorPlan) {
      this.builder.remove(this.floorPlan);
      this.floorPlan = null;
    }
    this.setState({ site: 0 });
  }
}
handleSearchResults = (results) => {
  // Store results in local component state if needed
  this.setState({ filteredRackResults: results });

  // Get necessary props from this.props
  const {
    siteId,
    structureName,
    floorName,
    floorId,
    eqpType = ''
  } = this.props;

  // Use bound action creators directly without needing dispatch
  //boundActions.updateFilteredRackResults(results);

  // Then trigger the equipment type tree update if we have required params
  if (siteId && structureName && floorName && floorId) {
    boundActions.requestFloorplanEqptType2(
      siteId,
      structureName,
      floorName,
      floorId,
      eqpType,
      false, // fromRouteInstanceSearch
      results // Pass the filtered rack results
    );
  }
}
/*handleSearchResults = (results) => {
  // Store results in local component state for immediate access
  this.setState({ filteredRackResults: results });

  // Get necessary props from this.props
  const {
    siteId,
    structureName,
    floorName,
    floorId,
    eqpType = '',
    dispatch
  } = this.props;

  // First dispatch action to update the filteredRackResults in Redux store
  dispatch(updateFilteredRackResults(results));

  // Then dispatch action to refresh the equipment type tree with auto-expansion
  // Only if we have required params
  if (siteId && structureName && floorName && floorId) {
    dispatch(requestFloorplanEqptType2(
      siteId,
      structureName,
      floorName,
      floorId,
      eqpType,
      false, // fromRouteInstanceSearch
      results // Pass the filtered rack results
    ));
  }
}*/
  changeTreeSelected(level, number) {
    const name = `treeLevelSelected${number}`
    const obj = {}
    obj[name] = level;
    this.setState(obj);
  }

  changeTreeSelected3(level) {
    this.setState({
      treeLevelSelected3: level
    })
  }

  buildFloor = () => {
    const body = $('.floorPlan');
    $('#floorPlan').height(body.height());
    // prevent a memory leak
    let onPanEnd;
    onPanEnd = builder => {
      builder.off('panEnd', onPanEnd);
      setTimeout(() => builder.on('click', this.clearSelection), 150);
    };
    this.builder = new RenderEngine('#floorPlan');
    this.builder.on('mousewheel', this.closeContextMenu);
    this.builder.on('mousewheel', this.setZoomLevelWrap);
    this.builder.on('contextmenu', this.closeContextMenu);
    this.builder.on('click', this.closeContextMenu);
    this.builder.on('click', this.clearSelection);
    this.builder.on('selection', this.onSelection);
    this.builder.on('selection', this.togglePan);
    // Disabling/enabling clear selection while paning
    this.builder.on('panMove', builder => {
      // temporary disabling clearSelection
      builder.off('click', this.clearSelection);
      builder.on('panEnd', onPanEnd);
    });
    if (this.state.panMode) {
      this.builder.disableSelection();
      this.builder.pan();
    }
    this.setFloorPlan();
    if (this.props.site && this.props.building && this.props.floor) {
      this.setupFloorPlan(this.props.site, this.props.building, this.props.floor, this.props.rackId);
    }
  }

  setFloorPlan() {
    this.floorPlan = FloorPlan.create(
      this.builder,
      {},
      {
        floorPlan: [
          { event: 'zoomedIn', callback: this.zoomedIn },
          { event: 'zoomedOut', callback: this.zoomedOut },
        ],
        racks: [
          { event: 'contextmenu', callback: this.onRightClickRack },
          { event: 'click', callback: this.onRackSelected },
          { event: 'mouseover', callback: this.onRackHover },
          { event: 'mouseout', callback: this.onRackOut },
        ],
      },
    );
    const loader = [];
    this.floorPlan.on('loadStep', status => {
      let message = null;
      if (status.start) {
        loader.push(status.message);
        message = `Rendering ${status.message}`;
      } else if (status.completed) {
        loader.splice(loader.indexOf(status.message), 1);
        if (loader.length > 0) {
          message = `Rendering ${loader[loader.length - 1]}`;
        }
      }
      if (status.renderRequired) {
        this.floorPlan.render();
      }
      if (status.restoreZoom) {
        this.floorPlan.setZoomLevel();
      }
      this.setState({ floorPlanStatus: message });
    });
  }

  setupFloorPlan(site, building, floor, rackId) {
    this.props.loadAllRacks([]);

    this.floorPlan
    .load({
      site: site,
      building: building,
      floor: floor,
    })
    .then(() => {
      this.floorPlan.render();
      this.floorPlan.setZoomLevel();
      if (_.isEmpty(this.floorPlan.racks.elements)) return;
      this.floorPlan.racks.elements.map(rack => {
        if (!(this.state.selectedSubclasses.indexOf(rack.options.eqptSubCls) >= 0)) {
          rack.options.filtered = false;
        }
      });
      this.props.loadAllRacks(this.floorPlan.options.racks);
      if (rackId) {
        this.selectRackByPosition(rackId, this.props.rightRackFootprintId);
      } else {
        this.defaultZoom();
      }
      if (this.props.nidMode === true) {
        this.selectRack(this.props.selectedRack);
      }
      this.setState({ floorPlanStatus: null, locationString:'' });
    })
    .catch(error => {
      this.setState({ floorPlanStatus: error.status || error.message });
    });
  }

  defaultZoom() {
    const xCorners = _.flatMap(this.floorPlan.options.racks, zone => {
      return _.map(zone.corners, corner => corner.x);
    });
    const yCorners = _.flatMap(this.floorPlan.options.racks, zone => {
      return _.map(zone.corners, corner => corner.y * -1);
    });
    const fudge = 2;
    const xMin = _.min(xCorners) - fudge;
    const xMax = _.max(xCorners) + fudge;
    const yMin = _.min(yCorners) - fudge;
    const yMax = _.max(yCorners) + fudge;
    const level = this.floorPlan.setZoom(xMin, yMin, xMax - xMin, yMax - yMin);
    const zoom = this.zoom.reduce((acc, curr) => {
      return Math.abs(level.zoom - curr) < Math.abs(level.zoom - acc) ? curr : acc;
    });
    this.setState({ zoom: zoom });
  }

  loadNIDRecommendations(clliCd, serviceId) {
    this.setState({ recommendationsLoaded: false });

    // set to false before committing changes
    if (USE_NID_DUMMY_DATA) {
      const nidPriorityList = nidDummyData.nidLocationDtoList[0].priorityDTOList;
      return new Promise((resolve) => {
        setTimeout(() => {
          this.setState(
            {
              nidRecommendations: nidPriorityList,
              nidRecommendationsLoaded: true,
            },
            () => resolve(nidPriorityList),
          );
        }, 7500);
      });
    }
    return floorplanApi
      .getNIDPriorityList(clliCd, serviceId)
      .then(nidPriorityList => {
        this.setState({
          nidRecommendations: nidPriorityList,
          nidRecommendationsLoaded: true,
        });
        return nidPriorityList;
      })
      .catch(e => {
        this.setState({
          nidRecommendationsLoaded: true,
        });
        AlertManager.error(e);
      });
  }

  preventEventDefaultBehavior = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }

  removeRackSelection = (selectionClass) => {
    if(this.floorPlan && this.floorPlan.racks) {
      const previousSelected = this.floorPlan.racks.elements.find(item => item.hasClass(selectionClass));
      if (previousSelected) {
        previousSelected.removeClass(selectionClass);
      }
    }
  }

  displayRackSelection = (rack, selectionClass) => {
    // show selection
    if (this.floorPlan && this.floorPlan.racks && rack) {
      this.removeRackSelection(selectionClass);
      if (!rack.hasClass(selectionClass)) {
        rack.addClass(selectionClass);
      }
    }
  }

  isRightSelectionAvailable = (props = this.props) => (props.connectionMode || props.swapMode || props.relocateRackMode || props.intraLocationMode)

  onRackSelected(rack = null, event, nid = false,shouldUpdateInstanceURL = false) {
    if(this.props.fromRouteInstanceSearch &&
       ((event && event.type === 'click') || (shouldUpdateInstanceURL)) &&
       rack.options && rack.options.footPrintInstId){
        this.props.history.push(`search/instance/rack/?query=${rack.options.footPrintInstId}`);
    }
    if (!this.props.intraLocationMode || this.loadRackOnSwitchView) {
      this.props.updateCilliChangeFlag();
      this.loadRackOnSwitchView = false;
      this.preventEventDefaultBehavior(event);
      this.displayRackSelection(rack, 'selected');

      if (rack) {
        if (typeof this.props.onRackSelected === 'function') {
          this.props.setSelectedData({ rack: rack.options, nid: nid === true, shelf: {}, card: {}, isTreeView: this.props.showTreeView});
        }
        this.props.cacheRackPos(rack.options.footPrintInstId);
      }
    }
  }

  onRightClickRack(rack = undefined, event = undefined) {
    this.preventEventDefaultBehavior(event);
    if (!rack) {
      this.removeRackSelection('right-selected');
    } else if (this.isRightSelectionAvailable()) {
      this.displayRackSelection(rack, 'right-selected');
      if (rack) {
        if (this.props.relocateRackMode) {
          if (rack.options.majorVendorId) {
            AlertManager.confirmModal('Please choose a generic rack.', {
              hideCancel: true,
              headline: "INFO"
            });
          } else {
            AlertManager.confirmModal(
              "Are you sure you want to relocate this rack?",
              {
                onOk: () => {
                  //this.relocateRack(this.props.relocateRackId, rack.options.footPrintInstId);
                  this.relocateRack(this.props.rackId ? this.props.rackId : this.props.previousRackId, rack.options.footPrintInstId);
                },
                headline: "Confirmation",
                okText: "Yes",
                cancelText: "Cancel",
                onCancel: () => {
                  this.props.handleRackRelocateClose();
                },
              }
            );
          }
        } else {
          const rightRackSelectionDetails = {
            rightRack: {
              ...rack.options,
              siteId: this.props.site,
              floor: this.props.floor,
              building: this.props.building,
            }
          };
          this.props.setSelectedData(rightRackSelectionDetails);
        }
      }
    }
  }

  relocateRack(currentFtprtInstncId, futureFtprtInstncId) {
    floorplanApi.relocateRack(currentFtprtInstncId, futureFtprtInstncId)
    .then((response) => {
      if(response.data != null && "success" == response.data.toLowerCase()){
        AlertManager.success(`Moved Rack to this footprint ${futureFtprtInstncId}`);
        if (this.props.site && this.props.building && this.props.floor) {
          this.setupFloorPlan(this.props.site, this.props.building, this.props.floor, this.props.rackId);
        }
      }
    }).catch(error => {
      if(error.response && error.response.data && error.response.data.errors){
        AlertManager.error(error.response.data.errors[0].message);
      } else AlertManager.error(error);
    });
  }

  onRackHover(rack) {
    rack.addClass('hover');
    this.setState({
      floorPlanStatus: `${rack.options.eqptSubCls} ${rack.options.rackPosCd}`,
    });
  }

  onRackOut(rack) {
    rack.removeClass('hover');
    this.setState({ floorPlanStatus: null });
  }

  clearSelection() {
    this.onRackSelected();
  }

  onContextMenu(rack, event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  closeContextMenu(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    this.setState({ showContextMenu: false });
  }

  toggleSelection() {
    if (!this.state.selectMode) {
      this.builder.unpan();
      this.builder.enableSelection();

      this.setState({
        selectMode: true,
        panMode: false,
      });
    } else {
      this.builder.disableSelection();

      this.setState({
        selectMode: false,
      });
    }
  }

  toggleColors() {
    const tint = 'tint';
    if (this.builder.hasClass(tint)) {
      this.builder.removeClass(tint);
    } else {
      this.builder.addClass(tint);
    }

    this.setState({ colorMode: !this.state.colorMode });
  }

  togglePan() {
    if (!this.state.panMode) {
      this.builder.disableSelection();
      this.builder.pan();

      this.setState({
        panMode: true,
        selectMode: false,
      });
    } else {
      this.builder.unpan();

      this.setState({
        panMode: false,
      });
    }
  }

  resetZoom() {
    this.defaultZoom();
  }

  zoomIn(event) {
    if (this.canZoomIn()) {
      this.floorPlan.zoomIn(this.zoom[this.zoom.indexOf(this.state.zoom) + 1], event);
    }
  }

  zoomedIn(zoomLevel) {
    this.setState({ zoom: zoomLevel.zoom, scale: zoomLevel.scale });
  }

  canZoomIn() {
    return this.zoom.indexOf(this.state.zoom) < this.zoom.length - 1;
  }

  zoomOut(event) {
    if (this.canZoomOut()) {
      this.floorPlan.zoomOut(this.zoom[this.zoom.indexOf(this.state.zoom) - 1], event);
    }
  }

  zoomedOut(zoomLevel) {
    this.setState({ zoom: zoomLevel.zoom, scale: zoomLevel.scale });
  }

  canZoomOut() {
    return this.zoom.indexOf(this.state.zoom) > 0;
  }

  setZoomLevelWrap(event) {
    event.preventDefault();
    event.stopPropagation();
    const delta = event.wheelDelta || event.deltaY * -1;
    if (delta > 0) {
      this.zoomIn(event);
    } else {
      this.zoomOut(event);
    }
  }

  onSelection(x, y, x2, y2, event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const level = this.floorPlan.setZoom(x, y, x2 - x, y2 - y);

    const zoom = this.zoom.reduce((acc, curr) => {
      return Math.abs(level.zoom - curr) < Math.abs(level.zoom - acc) ? curr : acc;
    });

    this.setState({ zoom: zoom });
  }

  applyFilter(eventKey) {
    const filters = this.state.filters.map(f => {
      return {
        key: f.key,
        name: f.name,
        checked: f.checked,
        apply: f.apply,
      };
    });
    const filterFound = filters.find(filter => filter.key === eventKey);
    if (filterFound) {
      filterFound.apply(this.floorPlan);
      filterFound.checked = !filterFound.checked;
      this.setState({ filters });
    }
  }

  renderFilter(filter) {
    const color = filter.checked ? '#458B00' : '#CF070D';
    const icon = filter.checked ? 'toggle-on' : 'toggle-off';
    return (
      <MenuItem key={filter.key} eventKey={filter.key}>
        <label
          className="floorPlanFilter"
          onClick={event => {
            this.applyFilter(filter.key, event);
          }}
        >
          <FAIcon icon={icon} size="1x" style={{ color: color }} />&nbsp;-&nbsp;
          {filter.name}
        </label>
      </MenuItem>
    );
  }

  onSubclassSelected(selectedSubclasses) {
    this.setState({
      selectedSubclasses: selectedSubclasses,
    });
    if (selectedSubclasses.length > 0) {
      this.floorPlan.racks.elements.forEach(rack => {
        if (selectedSubclasses.find(s => s.subclass === rack.options.eqptSubCls)) {
          rack.removeClass('hidden');
        } else {
          rack.addClass('hidden');
        }
      });
    } else {
      this.floorPlan.racks.elements.forEach(rack => {
        rack.removeClass('hidden');
      });
    }
  }

  onManufacturerSelected(selectedManufacturer) {
    this.setState({
      selectedManufacturer: selectedManufacturer,
    });
    if (selectedManufacturer.length <= 0) {
      this.floorPlan.racks.elements.forEach(rack => {
        rack.removeClass('hidden');
      });
    }
  }

  selectRack(footPrintInstId) {
    const found = this.floorPlan.racks.elements.find(
      rack => rack.options.footPrintInstId === footPrintInstId.toString(),
    );
    if (found) {
      this.onRackSelected(found, null, true);
    } else {
      AlertManager.error(`This Rack doesn't exist on this particular site`);
    }
  }

  nidFilter() {
    const nidRacks = JSON.parse(JSON.stringify(this.state.nidRacks));
    if (this.state.nidFiltered === false) {
      if (nidRacks.length > 0) {
        this.floorPlan.racks.elements.forEach(rack => {
          if (nidRacks.find(s => parseInt(rack.options.footPrintInstId) === s)) {
            rack.removeClass('hidden');
          } else {
            rack.addClass('hidden');
          }
        });
      }
    } else {
      this.floorPlan.racks.elements.forEach(rack => {
        rack.removeClass('hidden');
      });
    }
    this.setState({
      nidFiltered: !this.state.nidFiltered,
    });
  }

  handleNidNavigate = (priority, index, selectedIndices) => {
    const recommendation = _.find(this.state.nidRecommendations, ['priority', priority])
      .nidoptionsDTOList[index];
    const clientSlotMapping = recommendation.clientSlotMapping;
    const clientSlot = clientSlotMapping[selectedIndices.clientSlotIndex];
    const clientSubSlot = clientSlot.clientSubSlots[selectedIndices.clientSubSlotIndex];
    const lineSlot = clientSubSlot.lineSlots[selectedIndices.lineSlotIndex];
    const lineSubSlot = lineSlot.lineSubSlots[selectedIndices.lineSubSlotIndex];
    const selectedSlots = {
      clientSlotSeqNum: clientSlot.clientSlotSeq,
      clientSubSlotSeqNum: clientSubSlot.clientSubSlotSeqNum,
      lineSlotSeqNum: lineSlot.lineSlotSeqNum,
      lineSubSlotSeqNum: lineSubSlot.lineSubSlotSeqNum,
      ...selectedIndices,
      clientSlot: clientSlot.clientSlot,
      clientSubSlot: clientSubSlot.clientSubSlot,
      lineSlot: lineSlot.lineSlot,
      lineSubSlot: lineSubSlot.lineSubSlot,
    };
    this.props.onNidNavigation(recommendation, priority, selectedSlots);
  };

  selectRackByPosition(location, rightLocation) {
    const leftText = location.toString().toUpperCase().trim();
    const rightText = rightLocation ? rightLocation.toString() : null;
    const found = this.floorPlan.racks.elements.find(rack => rack.options.id === leftText);
    const rightFound = rightText
      ? this.floorPlan.racks.elements.find(rack => rack.options.footPrintInstId === rightText)
      : null;
    if (rightFound) {
      this.onRightClickRack(rightFound);
    } else if (this.props.connectionMode || this.props.swapMode) {
      AlertManager.error('Right Rack not found');
    }

    if (found) {
      this.onRackSelected(found, null);
      const x = found.options.corners[0].x - 10;
      const y = (found.options.corners[0].y * -1) - 10;
      const x2 = found.options.corners[3].x + 15;
      const y2 = (found.options.corners[3].y * -1) + 15;

      const level = this.floorPlan.setZoom(x, y, x2 - x, y2 - y);
      const zoom = this.zoom.reduce((acc, curr) => {
        return Math.abs(level.zoom - curr) < Math.abs(level.zoom - acc) ? curr : acc;
      });

      this.setState({ zoom: zoom });
    } else {
      AlertManager.error('Rack not found');
    }
  }

  handleGetLocatorFilterData(columnName) {
    const racks = [];
    this.state.locatedRacks.forEach(rack => {
      if (racks.indexOf(rack[columnName]) === -1) {
        if (rack[columnName].toString().trim()) racks.push(rack[columnName]);
      }
    });
    return racks;
  }

  handleLocateRack(locationString, criteria) {
    let sites = this.props.sitesList.map(x => x.siteId);
    var isTreeView =  this.props.showTreeView;
    if (locationString.length > 0) {
      this.setState({
        showLocateResultsModal: true
      });
      if (this.state.locationString !== locationString || this.state.locatedCriteria !== criteria) {
        this.props.locateRacksInAllSites(sites, locationString, criteria, isTreeView);
      }
      this.setState({
        locationString: locationString,
        locatedCriteria: criteria,
      });
    } else {
      this.clearSelection();
    }
  }

  handleCancelGoToRack() {
    this.setState({
      showLocateResultsModal: false,
    });
  }

  handleGoToRack() {
    const { selectedLocatedRack: selectedRack, fromRouteInstanceSearch } = this.props;
    if (selectedRack) {
      if(this.props.showTreeView){
          const treePath=[
            selectedRack.siteCd,
            selectedRack.struct,
            selectedRack.floor,
            selectedRack.subclass,
            selectedRack.vendor
          ];
          this.setState({
            selectedLocateRack:selectedRack,
            treePathToExpand:treePath,
          });
      }
      else if (parseInt(this.props.site, 10) === selectedRack.siteId &&
        parseInt(this.props.floorId, 10) === selectedRack.floorId) {
        const found = this.floorPlan.racks.elements.find(
          rack => parseInt(rack.options.footPrintInstId, 10) === selectedRack.instncId,
        );
        if (found) {
          if(fromRouteInstanceSearch){
            this.onRackSelected(found, null, false, true);
          }else{
            this.onRackSelected(found, null );
          }
        }
      } else {
        this.props.onGoToRack(selectedRack);
      }
    }
  }

  handleGoToRackRight() {
    const { selectedLocatedRack: selectedRack } = this.props;

    const found = this.floorPlan.racks.elements.find(
      rack => parseInt(rack.options.footPrintInstId, 10) === selectedRack.instncId,
    );
    // console.log(selectedRack, found);
    if(!found){
      AlertManager.error(`This Rack doesn't exist on this particular site`);
    }
    this.onRightClickRack(found);
  }

  switchView = () => {
    const { switchTreeView, showTreeView } = this.props;
    switchTreeView(!showTreeView);
  }

  toogleTreeStructure = (e, structure) => {
    this.setState({
      strSelected: structure
    })
  }

  render() {
    return (
      <Panel
        header={
          <div className="floorplan-view-header" >
            <div className="preview-controls">
              <ButtonToolbar className="pull-right">
                {(this.props.showLocate && this.props.showTreeView)?( [<OverlayTrigger
                        key="floorplan-icon-locate"
                        placement="top"
                        overlay={<Tooltip id="tooltip">Locate</Tooltip>}
                      >
                        <RackLocatorTree onLocateRack={this.handleLocateRack}>
                          Locate
                        </RackLocatorTree>
                      </OverlayTrigger>,
                      <OverlayTrigger
                        key="floorplan-icon-filter"
                        placement="top"
                        overlay={<Tooltip id="tooltip">Filter</Tooltip>}
                      >
                        <FloorPlanTreeFilter
                          onSubclassSelected={this.onSubclassSelected}
                          floorId={this.props.floorId}
                          onSearchResults={this.handleSearchResults}
                        >
                          Filter
                        </FloorPlanTreeFilter>
                      </OverlayTrigger>]):
                  (!this.props.showTreeView || this.props.searchedByInstanceId) &&
                    [
                      <OverlayTrigger
                        key="floorplan-icon-locate"
                        placement="top"
                        overlay={<Tooltip id="tooltip">Locate</Tooltip>}
                      >
                        <RackLocator onLocateRack={this.handleLocateRack}>
                          Locate
                        </RackLocator>
                      </OverlayTrigger>,
                      <OverlayTrigger
                        key="floorplan-icon-filter"
                        placement="top"
                        overlay={<Tooltip id="tooltip">Filter</Tooltip>}
                      >
                        <FloorPlanFilter
                          onSubclassSelected={this.onSubclassSelected}
                          floorId={this.props.floorId}
                        >
                          Filter
                        </FloorPlanFilter>
                      </OverlayTrigger>,

                      <Hide key="floorplan-icon-changefloor" ifTrue={this.props.tidMode || this.props.rackLoader}>
                        <VZButton
                          className="btn-defaulted"
                          onClick={this.props.onModalClick}
                          label="Change Floor Plan"
                        />
                      </Hide>,
                      <VZButton
                        key="floorplan-icon-zoomin"
                        className="btn-defaulted"
                        onClick={this.zoomIn}
                        icon="plus"
                        tooltip="Zoom In"
                      />,
                      <VZButton
                        key="floorplan-icon-zoomout"
                        className="btn-defaulted"
                        onClick={this.zoomOut}
                        icon="minus"
                        tooltip="Zoom Out"
                      />,
                      <VZButton
                        key="floorplan-icon-togglepan"
                        onClick={this.togglePan}
                        className={classNames('btn-defaulted', {
                          activated: this.state.panMode,
                        })}
                        tooltip="Pan"
                        icon="arrows"
                      />,
                      <VZButton
                        key="floorplan-icon-toggleselection"
                        onClick={this.toggleSelection}
                        className={classNames('btn-defaulted', {
                          activated: this.state.selectMode,
                        })}
                        tooltip="Rectangle selection"
                      >
                        <span className="rect-dashed" />
                      </VZButton>,
                      <VZButton
                        key="floorplan-icon-reset"
                        className="btn-defaulted"
                        onClick={this.resetZoom}
                        tooltip="Reset"
                        icon="refresh"
                      />,
                    ]
                }
                <VZButton
                  key="floorplan-icon-switchboard"
                  className={
                    this.props.connectionMode ? 'btn-primary' : 'btn-defaulted'
                  }
                  tooltip={this.props.canAccessCilli? "Switch Board":"Switch Board(Read-only)"}
                  onFocus={e => e.target.blur()}
                  onClick={this.props.onToggleConnectionMode}
                  glyph="phone-alt"
                />
                <VZButton
                  key="floorplan-icon-swapmode"
                  className={
                    this.props.swapMode ? 'btn-primary' : 'btn-defaulted'
                  }
                  tooltip={this.props.canAccessCilli? "Enter Red Line Swap Mode":"Enter Red Line Swap Mode(Read-only)"}
                  onFocus={e => e.target.blur()}
                  onClick={this.props.onToggleRedLineSwap}
                  label="Swap Mode"
                />
                <VZButton
                  className="btn-defaulted"
                  disabled={this.props.intraLocationMode || this.props.swapMode || this.props.connectionMode}
                  onFocus={e => e.target.blur()}
                  onClick={this.switchView}
                >
                  {
                    this.props.showTreeView ?
                      <span>
                        <i className="fa fa-th" /> Graphic View
                      </span> :
                      <span>
                        <i className="fa fa-sitemap" /> Tree View
                      </span>
                  }
                </VZButton>
              </ButtonToolbar>
            </div>
        </div>
        }
        className="floorPlanView"
      >
        {
          !this.props.showTreeView &&
          <div style={{ height: '100%' }} >
            <svg id="floorPlan" width="100%" height="100%" />
          </div>
        }

        {
          !(this.props.intraLocationMode) &&
          this.props.showTreeView &&
            <div className="floorplan-tree-view">
              <div style={{marginTop: '5px', display: 'flex', justifyContent: 'end'}}>
                {/* <VZButton disabled={this.state.strSelected === 1} onClick={(e) => this.toogleTreeStructure(e, 1)}>
                  <span>
                    <i className="fa fa-sitemap" /> Str 1
                  </span>
                </VZButton> */}

                <VZButton disabled={this.state.strSelected === 2} onClick={(e) => this.toogleTreeStructure(e, 2)}>
                  <span>
                    <i className="fa fa-sitemap" /> Physical Equipment
                  </span>
                </VZButton>


                <VZButton disabled={this.state.strSelected === 3} onClick={(e) => this.toogleTreeStructure(e, 3)}>
                  <span>
                    <i className="fa fa-sitemap" /> Site Management
                  </span>
                </VZButton>
              </div>
              {this.state.strSelected === 1 && <FloorPlanTreeView floorPlan={this.floorPlan} updateCilliChangeFlag={this.props.updateCilliChangeFlag} />}
              {this.state.strSelected === 2 &&
                  <FloorPlanTreeView2
                    floorPlan={this.floorPlan}
                    filteredRackResults={this.state.filteredRackResults}
                    updateCilliChangeFlag={this.props.updateCilliChangeFlag}
                    changeTreeSelected={this.changeTreeSelected}
                    treeLevelSelected={this.state.treeLevelSelected2}
                    connectionMode={this.props.connectionMode}
                    swapMode={this.props.swapMode}
                    searchStr={this.props.searchStr}
                    searchedByInstanceId={this.props.searchedByInstanceId}
                    treePathToExpand={this.state.treePathToExpand}
                    selectedLocateRack={this.state.selectedLocateRack}
                  />
              }
              {this.state.strSelected === 3 &&
                <div>
                  <FloorPlanTreeView3
                    floorPlan={this.floorPlan}
                    updateCilliChangeFlag={this.props.updateCilliChangeFlag}
                    changeTreeSelected={this.changeTreeSelected}
                    treeLevelSelected={this.state.treeLevelSelected3}
                    treePathToExpand={this.state.treePathToExpand}
                    selectedLocateRack={this.state.selectedLocateRack}
                  />
                  <FloorPlanTreeView3Sub
                    floorPlan={this.floorPlan}
                    updateCilliChangeFlag={this.props.updateCilliChangeFlag}
                    changeTreeSelected={this.changeTreeSelected}
                    treeLevelSelected={this.state.treeLevelSelected3}
                    treePathToExpand={this.state.treePathToExpand}
                    selectedLocateRack={this.state.selectedLocateRack}
                  />
                </div>
              }
            </div>

        }
        <div className="floorPlanStatus">{this.state.floorPlanStatus}</div>
        <LocateResultsModal
          onCancel={this.handleCancelGoToRack}
          onGo={this.handleGoToRack}
          loading={this.state.isLoading}
          foundRack={!!this.props.selectedLocatedRack}
          show={this.state.showLocateResultsModal}
          searchCriteria={this.state.locatedCriteria}
          isRightSelectionAvailable={this.props.isRightSelectionAvailable}
          onGoRight={this.handleGoToRackRight}
        />
      </Panel>
    );
  }
}

export default FloorPlanView;
