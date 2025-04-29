import React, { PropTypes } from 'react';
import Measure from 'react-measure';
import _ from 'lodash';
import OneTable from 'components/OneTable/OneTable';
import types from 'store/constants/FloorPlanTypes';
import messages from 'store/constants/messages';
import AlertManager from 'components/AlertManager';

export default class RackTable extends React.Component {
  static propTypes = {
    rowHeight: PropTypes.number,
    headerHeight: PropTypes.number,
    width: PropTypes.number,
    maxHeight: PropTypes.number,
    columnTitles: PropTypes.object,
    columnWidths: PropTypes.object,
    columnDataTypes: PropTypes.object,
    setLocatedRack: PropTypes.func.isRequired,
    locateRack: PropTypes.object.isRequired,
  }

  static defaultProps = {
    rowHeight: 20,
    headerHeight: 30,
    width: 600,
    maxHeight: 500,
    columnTitles: {
      rackPos: 'Rack Location',
      struct: 'Building',
      floor: 'Floor',
      zone: 'Zone',
      rackAlias: 'Bay/Rack Alias',
      siteCd: 'SCIS Site Code',
      cfgNm: 'Rack Configuration',
      subClass: 'Equipment Subclass',
      vendor: 'Manufacturer',
      instncId: 'Instance ID',
      nodeName: 'Node Name',
    },
    columnWidths: {
      rackPos: 50,
      struct: 50,
      floor: 50,
      zone: 50,
      rackAlias: 50,
      cfgNm: 200,
      subClass: 200,
      vendor: 200,
      siteCd: 100,
      instncId: 75,
      nodeName: 75,
    },
    columnDataTypes: {
      rackPos: 'alphabetic',
      struct: 'alphabetic',
      floor: 'alphabetic',
      zone: 'alphabetic',
      rackAlias: 'alphabetic',
      siteCd: 'alphabetic',
      cfgNm: 'alphabetic',
      subClass: 'alphabetic',
      vendor: 'alphabetic',
      instncId: 'numeric',
      nodeName: 'alphabetic',
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedRow: -1,
      columnWidths: this.props.columnWidths,
      columnOrder: Object.keys(this.props.columnTitles),
      locationFilters: {},
    };
  }

  componentWillMount() {
    const { locateRack: { locatedRacks, error, errorType } } = this.props;
    if (error && AlertManager[errorType]) {
      AlertManager[errorType](error);
    }
    this.setState({
      locatedRacks,
      locatedRacksDisplayList: locatedRacks,
      locationFilters: {},
      selectedRow: locatedRacks.length > 0 ? 0 : -1,
    }, () => {
      this.setLocatedRack(this.state.selectedRow);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { locateRack: { locatedRacks, error, type, errorType }  } = nextProps;
    if (type === types.GET_FLOORPLAN_LOCATE_RACK_SUCCESS) {
      this.setState({
        locatedRacks,
        locatedRacksDisplayList: locatedRacks,
        locationFilters: {},
        selectedRow: locatedRacks.length > 0 ? 0 : -1,
      }, () => {
        this.setLocatedRack(this.state.selectedRow);
      });
    }
    if (error && AlertManager[errorType]) {
      this.setState({
        locatedRacks: [],
        locationFilters: {},
        locatedRacksDisplayList: [],
        selectedRow: -1,
      }, () => {
        this.setLocatedRack();
      });
      AlertManager[errorType](error);
    }
  }

  onGetFilterData = (columnName) => {
    const racks = [];
    this.state.locatedRacks.forEach(rack => {
      if (racks.indexOf(rack[columnName]) === -1) {
        if (rack[columnName].toString().trim()) racks.push(rack[columnName]);
      }
    });
    return racks;
  }

  onGetSelectedItems = (columnName, filter) => {
    return filter[columnName];
  }

  onChangeFilter = (columnName, selectedItems) => {
    const newFilters = _.cloneDeep(this.state.locationFilters);
    if (selectedItems.length === 0 && _.isUndefined(newFilters[columnName])) {
      return;
    } else if (selectedItems.length === 0 && newFilters[columnName]) {
      delete newFilters[columnName];
    } else {
      newFilters[columnName] = selectedItems;
    }
    const currentSelectedObject = this.state.locatedRacksDisplayList[this.state.selectedRow];
    let locatedRacksDisplayList = this.state.locatedRacks.filter(rack => {
      for (const filter in newFilters) {
        if (newFilters.hasOwnProperty(filter) && newFilters[filter].indexOf(rack[filter]) !== -1) {
          return true;
        }
      }
    });
    if (locatedRacksDisplayList.length === 0) locatedRacksDisplayList = this.state.locatedRacks;
    this.setState(
      {
        locationFilters: newFilters,
        locatedRacksDisplayList,
      },
      () => {
        if (locatedRacksDisplayList.length !== 0) {
          const index = locatedRacksDisplayList.indexOf(currentSelectedObject);
          if (index === -1) {
            this.onRowClick(undefined, 0);
          } else {
            this.setState({
              selectedRow: index,
            });
          }
        } else {
          this.setLocatedRack();
        }
      },
    );
  }

  onChangeSort = (columnName, order) => {
    const rackList = _.cloneDeep(this.state.locatedRacksDisplayList);
    const selectedObject = rackList[this.state.selectedRow];
    let locatedRacksDisplayList = _.sortBy(rackList, [columnName]);
    if (order === 'desc') {
      locatedRacksDisplayList = _.reverse(locatedRacksDisplayList);
    }
    let newIndex = locatedRacksDisplayList.indexOf(selectedObject);
    if (newIndex === -1) newIndex = 0;
    this.setState({
      locatedRacksDisplayList,
      selectedRow: newIndex,
    });
  }

  onRowClick = (e, index) => {
    const { locatedRacksDisplayList } = this.state;
    const selectedRack = locatedRacksDisplayList[index];
    this.setLocatedRack(selectedRack);
    this.setState({
      selectedRow: index,
    });
  
  }

  setLocatedRack = (selectedRack = null) => {
    this.props.setLocatedRack(selectedRack);
  }

  render() {
    const { columnWidths } = this.state;
    const data = this.state.locatedRacksDisplayList || [];
    const {
      rowHeight,
      headerHeight,
      columnDataTypes,
      maxHeight,
      columnTitles,
    } = this.props;
    if (this.props.isSearchByNN === true) {
      columnDataTypes.nodeName = 'alphabetic';
      columnTitles.nodeName = 'Node Name';
      columnWidths.nodeName = '75';
    } else {
      delete columnDataTypes['nodeName'];
      delete columnTitles['nodeName'];
      delete columnWidths['nodeName'];
    }
    const filterPopoverAdapter = {
      filter: this.state.locationFilters,
      onRowClick: this.onRowClick,
      onRequestListData: this.onGetFilterData,
      onRequestSelectedItems: this.onGetSelectedItems,
      onChangeFilter: this.onChangeFilter,
      onChangeSort: this.onChangeSort,
      forceRowSelected: this.state.selectedRow,
      resetSelection: true,
      simpleFilter: true,
    };
    return (
      <div className="locaterack--table">
        {
          data.length > 0 &&
          <Measure
            onMeasure={r => {
              this.setState({ parentWidth: r.width });
            }}
          >
            <div style={{ width: '100%' }}>
              <OneTable
                rowHeight={rowHeight}
                headerHeight={headerHeight}
                rowsCount={data.length > 0 ? data.length : 0}
                width={this.state.parentWidth || 600}
                maxHeight={maxHeight}
                isColumnResizing={false}
                onColumnResizeEndCallback={this.onColumnResizeEndCallback}
                data={data}
                columnTitles={columnTitles}
                columnWidths={columnWidths}
                columnDataTypes={columnDataTypes}
                fireOnClickOnDataChange={false}
                {...filterPopoverAdapter}
              />
            </div>
          </Measure>
        }
        {
          data.length === 0 &&
          <div>
            {messages.NO_SEARCH_RESULTS}
          </div>
        }
      </div>
    );
  }
}
