import React, { PropTypes } from 'react';
import FAIcon from 'components/FAIcon';
import classNames from 'classnames';



class TreeViewRow extends React.Component {
    static propTypes = {
      rowData: PropTypes.object,
      index: PropTypes.number,
      parentLevel: PropTypes.number,
      onSelectItem: PropTypes.func,
      onExpandClick: PropTypes.func,
      tree: PropTypes.array,
      keyIds: PropTypes.array,
      keyLabels: PropTypes.array,
      ancestorData: PropTypes.array,
      indexPath: PropTypes.array,
      selectedItems: PropTypes.array,
      selected: PropTypes.bool,
      treeIcons: PropTypes.object,
      icon: PropTypes.any,
      filteredLabel: PropTypes.any,
      immediateCheck: PropTypes.object,
      filterText: PropTypes.any,
      isFiltered: PropTypes.bool,
      filterOnLevel: PropTypes.object,
      treePathToExpand:PropTypes.array,
      selectedLocateRack:PropTypes.object,
    };

    static defaultProps = {
      index: -1,
      tree: [],
      parentLevel: 0,
      ancestorData: [],
      indexPath: [],
      immediateCheck: {},
      filterOnLevel: {},
      isFiltered: false,
    };

    constructor() {
      super();
      this.state = {
        filter: '',
        filteredData: null,
      };
    }

    componentWillReceiveProps(nextProps) {
      if (this.state.filteredData) {
        this.setFilteredData(nextProps, this.state.filter);
      }
    }

    shouldComponentUpdate(nextProps) {
      return (this.props.parentLevel !== 0 || !nextProps.preventRerender);
    }

    componentDidUpdate(prevProps) {
      const { treePathToExpand, selectedLocateRack, rowData, index, parentLevel, ancestorData, expanded } = this.props;
      
      if (treePathToExpand !== prevProps.treePathToExpand && Array.isArray(treePathToExpand)) {
        
        const level = parentLevel; 
        let matchValue;
        switch(level) {
          case 0: matchValue = rowData.siteCd; break;
          case 1: matchValue = rowData.sctructNmTxt || rowData.struct; break;
          case 2: matchValue = rowData.floorNmTxt || rowData.floor; break;
          case 3: 
            
            matchValue = rowData.eqpType || rowData.subClass; 
            break;
          case 4: matchValue = rowData.vendorName || rowData.vendor; break;
          case 5: matchValue = rowData.rackPosCd || rowData.rackPos; break;
          default: matchValue = null;
        }
        
        if (matchValue === treePathToExpand[level] && !expanded) {
          this.props.onExpandClick(rowData, index, parentLevel, ancestorData);
        }
      }
    }

    onSelectItem = (e) => {
      e.preventDefault();

      const {rowData, index, parentLevel, ancestorData, indexPath, floorPlan, displayRackSelection} = this.props;
      
      this.props.onSelectItem(rowData, ancestorData, index, parentLevel, indexPath);
    }

    handleExpandCollapse = (e) => {
      e.preventDefault();
      const {rowData, index, parentLevel, ancestorData} = this.props;
      // console.log('props', this.props);
      this.props.onExpandClick(rowData, index, parentLevel, ancestorData);
    }

    setFilteredData = (props, textFilter) => {
      const {tree, rowData, keyIds, keyLabels, parentLevel, ancestorData, filterOnLevel} = props;
      const [currentChildInfo = []] = tree;
      const [currentKeyId] = keyIds;
      const [, nextKeyLabel] = keyLabels;
      const childInfo = currentChildInfo[rowData[currentKeyId]] || [];
      const filterUpperCase = textFilter.toUpperCase();
      const filterType = filterOnLevel[parentLevel];
      let filteredData;
      if (filterType === true) {
        filteredData = childInfo.filter((item, index) => {
          const nextLabel = typeof nextKeyLabel === 'function' ? nextKeyLabel(item, parentLevel + 1, ancestorData) : item[nextKeyLabel] || '';
          const itemLabel = nextLabel.toUpperCase();
          item.originalIndex = index;
          item.filteredLabel = itemLabel.replace(filterUpperCase, (text) => (`<span style="background-color: yellow;">${text}</span>`));
          return nextLabel.toUpperCase().includes(filterUpperCase);
        });
      } else {
        filteredData = filterType(childInfo, nextKeyLabel, textFilter, [...ancestorData, rowData], parentLevel);
      }
      
      this.setState({
        filter: textFilter,
        filteredData,
        showFilter: true,
      });
    }

    handleFilter = (e) => {
      if (!e.target.value) {
        this.setState({
          filter: e.target.value,
          filteredData: null,
          showFilter: false,
        });
        return;
      }
      this.setFilteredData(this.props, e.target.value);
    }

    getEquipmentColorClass = (rowData) => {
      if(rowData.type){
        switch(rowData.type){
          case 'RACK':
            return rowData.instlStatusDscrptTxt
          case 'Shelf':
            return rowData.plcmntData.instlStatusDscrptTxt
          case 'Card':
            return rowData.instlStatusDscrptTxt
          default:
            return ''
        }
      }

      return ''
    }

    treeViewRow = (treeChilds, isFiltered = false) => {
      const { tree, keyIds, keyLabels, rowData, onExpandClick, onSelectItem, ancestorData, parentLevel, indexPath, selectedItems, treeIcons, immediateCheck, filterOnLevel } = this.props;
      const [, ...nextChildInfo ] = tree;
      const [, ...nextKeyIds] = keyIds;
      const [, ...nextKeyLabel] = keyLabels;
      const [currentSelected, ...nextSelected] = selectedItems;
      let childNodes = [];
      childNodes = treeChilds.map((item, childIndex) => {
        // console.log('tree rows', item);
        const treeIndex = item.originalIndex || childIndex;
        return (
        <ul
          key={`tree-${parentLevel + 1}-${treeIndex}`}
          className="tree">
            <TreeViewRow
              filterText={this.state.filter}
              tree={nextChildInfo}
              keyIds={nextKeyIds}
              treeIcons={treeIcons}
              filterOnLevel={filterOnLevel}
              icon={treeIcons[parentLevel + 1] || undefined}
              filteredLabel={item.filteredLabel}
              isFiltered={isFiltered}
              keyLabels={nextKeyLabel}
              onExpandClick={onExpandClick}
              onSelectItem={onSelectItem}
              index={treeIndex}
              indexPath={[...indexPath, treeIndex]}
              selected={currentSelected === treeIndex}
              selectedItems={currentSelected === treeIndex ? nextSelected : []}
              rowData={item}
              immediateCheck={immediateCheck}
              ancestorData={[...ancestorData, rowData]}
              parentLevel={parentLevel + 1}
            />
          </ul>
      );
      });
      return childNodes;
    }

    render() {
      const { tree, keyIds, keyLabels, rowData, parentLevel, selected, selectedItems, icon, immediateCheck, filteredLabel, isFiltered, filterOnLevel, ancestorData } = this.props;
      const path = this.props.treePathToExpand || [];
      const lvl  = parentLevel;
      let highlight = false;
      
      let mv;
      switch(lvl) {
        case 0: mv = rowData.siteCd; break;
        case 1: mv = rowData.sctructNmTxt||rowData.struct; break;
        case 2: mv = rowData.floorNmTxt||rowData.floor;  break;
        case 3: mv = rowData.eqpType   ||rowData.subClass;break;
        case 4: mv = rowData.vendorName||rowData.vendor; break;
        default: mv = null;
      }
      if (path[lvl] === mv && lvl === path.length - 1) {
        highlight = true;
      }
      const [currentChildInfo = [] ] = tree;
      const [currentKeyId] = keyIds;
      const [currentKeyLabel] = keyLabels;
      const { expanded, loading  } = rowData;
      const checkImmediateChilds = immediateCheck[parentLevel];
      let childNodes = [];
      const showFilterInput = filterOnLevel[parentLevel];

      const colorCodingClass = this.getEquipmentColorClass(rowData);

      if (this.state.filteredData && expanded) {
        childNodes = this.treeViewRow(this.state.filteredData, true);
      } else if (expanded) {
        const childInfo = currentChildInfo[rowData[currentKeyId]] || [];
        childNodes = this.treeViewRow(childInfo);
      }
      let label;
      if (isFiltered) {
        label = filteredLabel;
      } else {
        label = typeof currentKeyLabel === 'function' ? currentKeyLabel(rowData, parentLevel, ancestorData) : rowData[currentKeyLabel] || '';
      }
      let showExpandCollapse = true;
      if (checkImmediateChilds && !expanded) {
        const immediateChilds = currentChildInfo[rowData[currentKeyId]] || [];
        showExpandCollapse = !!immediateChilds.length;
      }
      const isLastSelected = selected && !selectedItems.length;
      const linkClasses = classNames('tree-label-link', { 'font-bold': selected, selected: isLastSelected});
      const treeExpandClasses = classNames('tree-expand-collapse', { 'not-showing-icon': (!showExpandCollapse || !currentKeyId)});

      return (
        <div>
          <div className={`tree-label-container ${highlight?'highlight-red':''}`}>
            <a
              onClick={this.handleExpandCollapse}
              className={treeExpandClasses}
            >
              {
                showExpandCollapse &&
                expanded &&
                currentKeyId &&
                <FAIcon icon="minus-square fa-xs" />
              }
              {
                showExpandCollapse &&
                !expanded &&
                currentKeyId &&
                <FAIcon icon="plus-square fa-xs" />
              }
              {
                icon &&
                <span className="tree-custom-icon">
                  { typeof icon === 'function' ? icon(rowData) : icon }
                </span>
              }
            </a>
            <a
              disabled={isLastSelected}
              onClick={this.onSelectItem}
              className={linkClasses}
            >
              <span className={`tree-label ${colorCodingClass}`} dangerouslySetInnerHTML={{__html: label}} />
              {
                loading &&
                <FAIcon icon="spinner" pulse />
              }
            </a>
            {
              showFilterInput &&
              expanded &&
              !loading &&
              (childNodes.length > 0 || this.state.showFilter) &&
              <span className="tree-filter">
                <input type="text" onChange={this.handleFilter} value={this.state.filter} className={`tree-filter-input pull-right ${this.state.showFilter ? 'show' : ''}`} />
                <span className={`tree-filter-input-icon pull-right ${this.state.showFilter ? 'show' : ''}`}><FAIcon icon="filter fa-xs" /></span>
              </span>
            }
          </div>
          {
            expanded &&
            !loading &&
            childNodes
          }
          {
            expanded &&
            !loading &&
            childNodes.length === 0 &&
            <div className="no-results">
              (No results)
            </div>
          }
        </div>
      );
    }
}

export default TreeViewRow;
