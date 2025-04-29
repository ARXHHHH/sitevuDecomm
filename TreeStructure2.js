import React, { PropTypes } from 'react';
import _ from 'lodash';
import {
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import moment from 'moment';

import TreeViewRowRightClick from '../TreeViewRowRightClick';

const listToAccess = {
  // 0: 'sitesList',
  // 1: 'structuresList',
  // 2: 'floorsList',
  // 3: 'racksList',
  // 4: 'shelvesList',
  // 5: 'cardsList',
  // 6: 'subcardsList'
  0: 'sitesList2',
  1: 'structuresList2',
  2: 'floorsList2',
  3: 'eqpTypeList2',
  4: 'vendorList2',
  5: 'racksList2',
  6: 'shelvesList',
  7: 'cardsList',
  8: 'subcardsList'
};

export default class FloorPlanTreeView extends React.Component {
  static propTypes = {
    getDataForTree2: PropTypes.func.isRequired,
    tree: PropTypes.array.isRequired,
    keyIds: PropTypes.array.isRequired,
    setFloorPlan: PropTypes.func.isRequired,
    setSelectedData: PropTypes.func.isRequired,
    selectedFloorId: PropTypes.number,
    indexPath: PropTypes.array,
    treePathToExpand:PropTypes.array,
    selectedLocateRack:PropTypes.object,
    filteredRackResults: PropTypes.array,
  };
static defaultProps = {
  // ... existing props
  filteredRackResults: [],
};
  constructor() {
    super();
    this.state = {
      selectedItems: [],
      rightSelectedItems: [],
      loading: false,
      icons: {
        5: this.customRackIcon,
        6: this.customShelfIcon,
        7: <div className="card-icon" />,
        8: <div className="card-icon" />
      },
      filterOnLevel: {
        2: this.customFilter,
        3: true,
        4: true,
        5: true,
        6: true,
      },
      immediateCheck: {
        7: true,
      },
      filterObject: {},
      treeFilterObject: {}
    };

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.treeLevelSelected === 'sub') {
      this.setState({
        selectedItems: []
      })
    }

    if(this.props.tree !== nextProps.tree && Object.keys(nextProps.tree[1]).length === 0) {
      this.setState({
        selectedItems: [],
        rightSelectedItems: []
      })
    }

    if (
      this.props.indexPath !== nextProps.indexPath &&
      nextProps.indexPath &&
      Object.keys(nextProps.tree[1]).length !== 0 &&
      Object.keys(nextProps.tree[2]).length !== 0 &&
      Object.keys(nextProps.tree[3]).length !== 0 &&
      Object.keys(nextProps.tree[4]).length !== 0 &&
      Object.keys(nextProps.tree[5]).length !== 0 &&
      // this.state.selectedItems.length === 0 &&
      nextProps.searchedByInstanceId) {
        this.setState({
          selectedItems: nextProps.indexPath
        })
    }
  }

  customFilter = (childInfo, nextKeyLabel, textFilter, ancestorData, parentLevel) => {
    const filterUpperCase = textFilter.toUpperCase();
    return childInfo.filter((item, index) => {
      const nextLabel = typeof nextKeyLabel === 'function' ? nextKeyLabel(item, parentLevel + 1, ancestorData) : item[nextKeyLabel] || '';
      const itemLabel = nextLabel.toUpperCase();
      item.originalIndex = index;
      item.filteredLabel = itemLabel.replace(filterUpperCase, (text) => (`<span style="background-color: yellow;">${text}</span>`));
      const filteredByAlias = item.rackAlias ? item.rackAlias.toUpperCase().includes(filterUpperCase) : false;
      if (filteredByAlias) {
        item.filteredLabel += ` | <span style="font-color: grey;">alias</span>: `;
        item.filteredLabel += item.rackAlias.replace(filterUpperCase, (text) => (`<span style="background-color: yellow;">${text}</span>`));
      }
      return filteredByAlias || nextLabel.toUpperCase().includes(filterUpperCase);
    });
  }

  getIconWithTooltip = (id, iconName, label, extraClass = '') => {
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tt-${id}`}>{label}</Tooltip>}>
        <i className={`fa ${iconName} server-icon ${extraClass}`} />
      </OverlayTrigger>
    );
  }

  getClassByInstallationYear = (years) => {
    if (years < 0) {
      return 'brown';
    }
    switch (years) {
      case 0:
        return 'black';
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'cyan';
      case 4:
        return 'red';
      default:
        return 'magenta';
    }
  }

  customRackIcon = (rowInfo) => {
    const { majorVendorId, actlInstDt, plndInstlDt } = rowInfo;
    const getIconParams = [rowInfo.footPrintInstId];
    if (majorVendorId) {
      getIconParams.push('fa-server');
      if (actlInstDt) {
        getIconParams.push('Already Installed');
      } else {
        const plannedInstallationYear = moment(plndInstlDt).year();
        const currentYear = moment().year();
        const yearsToBeInstalled = plannedInstallationYear - currentYear;
        const label = yearsToBeInstalled < 0 ? 'Installation year has pass' : `${yearsToBeInstalled} years to be installed`;
        getIconParams.push(label, this.getClassByInstallationYear(yearsToBeInstalled));
      }
    } else {
      getIconParams.push('fa-square-o', 'Empty Rack');
    }
    return this.getIconWithTooltip(...getIconParams);
  }

  customShelfIcon = (rowInfo) => {
    const { cfgShelfStr = {} } = rowInfo;
    if (cfgShelfStr.majorVendorId) {
      return <div className="shelf-icon" />;
    }
    return <div className="empty-shelf-icon" />;
  }

  onExpandClick = (rowData, index, treeLevel, ancestorData,filteredRackResults) => {
    const list = listToAccess[treeLevel];
    this.props.getDataForTree2(index, list, rowData, ancestorData,filteredRackResults);
  }

  onSelectItem = (rowData, ancestorData, index, parentLevel, indexPath) => {
    this.props.changeTreeSelected('main', '2');
    this.setState({
      selectedItems: indexPath,
    });
    const selectedLevel = listToAccess[parentLevel];
    const [site, structure, floor, eqptSubCls, vendor, rack = {}, shelf = {}, card = {}] = ancestorData;
    const selectedData = { site, rack, shelf, card };

    switch (selectedLevel) {
      case 'sitesList2':
        selectedData.site = rowData;
        if (rowData.type) {
          this.props.getSubDetails(rowData.siteId);
        } else {
          this.props.getSiteDetails(rowData.siteId);
        }
        break;
      case 'racksList2':
        selectedData.rack = rowData;
        break;
      case 'shelvesList':
        selectedData.shelf = rowData;
        break;
      case 'cardsList':
      case 'subcardsList':
        selectedData.card = rowData;
        break;
      default:
        return;
    }
    this.handleChangeSelection(site.siteId, structure.structId, floor.floorId, selectedData);
  }

  onRightSelectItem = (rowData, ancestorData, index, parentLevel, indexPath) => {
    if (!(this.props.connectionMode || this.props.swapMode)) return;

    const selectedLevel = listToAccess[parentLevel];

    this.setState({
      rightSelectedItems: indexPath
    });

    if (selectedLevel === 'racksList2') {
      const [site, structure, floor] = ancestorData;
      this.props.setRightSelectedData({ siteId: site.siteId, building: structure.structId, floor: floor.floorId, ...rowData });
    }
  }

  handleChangeSelection = (siteId, structureId, floorId, selectedData) => {
    if (this.props.selectedFloorId !== floorId) {
      this.props.setFloorPlan(siteId, structureId, floorId);
    }

    this.props.updateCilliChangeFlag();
    this.props.setSelectedData(selectedData);
  }

  customLabel = (rowData, treeLevel, ancestorData) => {
    const labelToCheck = listToAccess[treeLevel];
    const [site = {}, building = {}, floor = {}, eqpType = {}, vendor = {}] = ancestorData;
    switch (labelToCheck) {
      case 'sitesList2':
        const { siteNmTxt, siteCd, clliCd, siteShortCd, type } = rowData;
        if (type) {
          return `Subsite: ${siteNmTxt} (${clliCd} / ${siteCd} / ${siteShortCd})`;
        }
        return `Site: ${siteNmTxt} (${clliCd} / ${siteCd} / ${siteShortCd})`;
      case 'structuresList2':
        const { sctructNmTxt } = rowData;
        return `Structure: ${sctructNmTxt}`
      case 'floorsList2':
        const { floorNmTxt } = rowData;
        return `Floor: ${floorNmTxt}`;
      case 'eqpTypeList2':
        const { eqpType } = rowData;
        return `Equipment Type: ${eqpType}`;
      case 'vendorList2':
        const { vendorName } = rowData;
        return `Vendor: ${vendorName}`;
      case 'racksList2':
        const { eqptSubCls, rackPosCd } = rowData;
        return `${site.clliCd} / ${building.sctructNmTxt} / ${floor.floorNmTxt} / ${eqptSubCls} - ${rackPosCd}`;
      case 'shelvesList':
        return `${rowData.cfgShelfStr.shlfCfgNm} / MP: ${rowData.cfgRackItem.rackPosNum} / LS: ${rowData.plcmntData.logicalShelfNum} / ${rowData.cfgRackItem.tidLogical} / ${rowData.cfgRackItem.directionCd} `;
      case 'cardsList':
        return `${rowData.faceLblTxt} / ${rowData.slotAlias}`
      default:
        return '';
    }
  }

  locateById = (tree) => {
    let tempIndexPath = [];
    const index0 = tree[0].findIndex(item => item.expanded);
    this.setState({
      selectedItems: [index0]
    });
  }

  render() {
    const { tree, keyIds } = this.props;
    const [baseTree, ...nextChildInfo] = tree;
    const { selectedItems, rightSelectedItems } = this.state;
    const [currentSelected, ...nextSelected] = selectedItems;
    const [currentRightSelected, ...nextRightSelected] = rightSelectedItems;
    return (
      <div className="floorplan-tree-view">
        <ul className="tree" key={this.state.loading}>
          {
            baseTree.map((item, index) => (
              <TreeViewRowRightClick
                tree={nextChildInfo}
                treeIcons={this.state.icons}
                icon={this.state.icons[0] || undefined}
                keyIds={keyIds}
                filterOnLevel={this.state.filterOnLevel}
                keyLabels={[this.customLabel, this.customLabel, this.customLabel, this.customLabel, this.customLabel, this.customLabel, this.customLabel, this.customLabel, 'faceLblTxt']}
                onExpandClick={this.onExpandClick}
                onSelectItem={this.onSelectItem}
                onRightSelectItem={this.onRightSelectItem}
                index={index}
                selected={currentSelected === index}
                rightSelected={currentRightSelected === index}
                indexPath={[index]}
                rowData={item}
                immediateCheck={this.state.immediateCheck}
                selectedItems={currentSelected === index ? nextSelected : []}
                rightSelectedItems={currentRightSelected === index ? nextRightSelected : []}
                preventRerender={this.state.loading}
                key={`tree-0-${index}`}
                treePathToExpand={this.props.treePathToExpand}
                selectedLocateRack={this.props.selectedLocateRack}
                filteredRackResults={this.props.filteredRackResults}
              />
            ))
          }
        </ul>
      </div>
    );
  }
}
