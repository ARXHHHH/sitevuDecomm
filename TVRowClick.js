import React, { PropTypes } from 'react';
import FAIcon from 'components/FAIcon';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';



class TreeViewRowRightClick extends React.Component {
    static propTypes = {
      rowData: PropTypes.object,
      index: PropTypes.number,
      parentLevel: PropTypes.number,
      onSelectItem: PropTypes.func,
      onRightSelectItem: PropTypes.func,
      onExpandClick: PropTypes.func,
      tree: PropTypes.array,
      filteredRackResults: PropTypes.array,
      keyIds: PropTypes.array,
      keyLabels: PropTypes.array,
      ancestorData: PropTypes.array,
      indexPath: PropTypes.array,
      selectedItems: PropTypes.array,
      rightSelectedItems: PropTypes.array,
      selected: PropTypes.bool,
      treeIcons: PropTypes.object,
      icon: PropTypes.any,
      filteredLabel: PropTypes.any,
      immediateCheck: PropTypes.object,
      filterText: PropTypes.any,
      isFiltered: PropTypes.bool,
      filterOnLevel: PropTypes.object,
     
      selectedLocateRack:PropTypes.object,
    };

    static defaultProps = {
      index: -1,
      tree: [],
      parentLevel: 0,
        filteredRackResults: [],
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

    componentDidMount() {
    this.tryAutoExpand
    }
    componentWillReceiveProps(nextProps) {
      if (this.state.filteredData) {
        this.setFilteredData(nextProps, this.state.filter);
      }
    }

    shouldComponentUpdate(nextProps) {
      return (this.props.parentLevel !== 0 || !nextProps.preventRerender);
    }

//     componentDidUpdate(prevProps) {
//       const {  selectedLocateRack,filteredRackResults,keyIds, rowData,ancestorData, index, parentLevel, expanded } = this.props;
//   const [currentKeyId] = keyIds;
//   // Only process filtered results if they've actually changed
//   if (prevProps.selectedLocateRack !== this.props.selectedLocateRack) {
//     console.log('selectedLocateRack updated:', this.props.selectedLocateRack);


//   }

//   console.log('Row Data in componentDidUpdate:', rowData.siteCd);

//     // let updatedRackResults = filteredRackResults || this.props.filteredRackResults;

//     // if (selectedLocateRack && (!filteredRackResults || filteredRackResults.length === 0)) {
//     //   console.log('Inserting selectedLocateRack into filteredRackResults:', selectedLocateRack);
//     //   updatedRackResults = [selectedLocateRack]; // Create a new array with selectedLocateRack
//     // }
//     let transformedRack = null;
//     if (selectedLocateRack) {
//       transformedRack = {
//         floor: selectedLocateRack.floor || null,
//         struct: selectedLocateRack.struct || null,
//         vendorName: selectedLocateRack.vendor || null,
//         rackPos: selectedLocateRack.rackPos || null,
//         siteId: selectedLocateRack.siteId || null,
//         eqpType: selectedLocateRack.subClass || null, // Add a default value if needed
//       };
//     }
  
//     // Insert transformedRack into filteredRackResults if it exists
//     const updatedRackResults = [...(filteredRackResults || []), ...(transformedRack ? [transformedRack] : [])];
//   console.log('filtered result', updatedRackResults); //data stored here

//   const isFilterResultsChanged =
//    !this.processedFilterResults ||
//     JSON.stringify(this.processedFilterResults) !== JSON.stringify(updatedRackResults);

//   // Only try to expand when we have new filtered results
//   if (isFilterResultsChanged  && updatedRackResults.length > 0 && !expanded) {
//     // Set a flag to avoid reprocessing the same filtered results
//     this.processedFilterResults = updatedRackResults;

//     // Check if this node matches filtered results (simplified logic)
//     let shouldExpand = false;

//     // Use a lookup object instead of multiple if/else statements
//     const levelChecks = {
//       0: () => updatedRackResults.some(r => r.siteId === rowData.siteId && rowData.clliCd),
//       1: () => updatedRackResults.some(r => r.struct && (r.struct === rowData.struct || r.struct === rowData.sctructNmTxt)),
//       2: () => updatedRackResults.some(r => r.floor && (r.floor === rowData.floor || r.floor === rowData.floorNmTxt)),
//       3: () => updatedRackResults.some(r => r.eqpType && (r.eqpType === rowData.eqpType || r.eqpType === rowData.subClass)),
//       4: () => updatedRackResults.some(r => r.vendorName && (r.vendorName === rowData.vendorName || r.vendorName === rowData.vendor))
//     };

//     // Check if we have a function for this parentLevel
//     const checkFn = levelChecks[parentLevel];
//     if (checkFn) {
//       shouldExpand = checkFn();
//     }

//     // Only trigger expand if necessary
//     if (shouldExpand && !rowData.expanded && this.props.onExpandClick) {
//       // Debounce expansion to prevent UI freezing
//       setTimeout(() => {
//         this.props.onExpandClick(rowData, index, parentLevel, ancestorData, updatedRackResults);
//       }, 0);
//     }
//   }

// }

componentDidUpdate(prevProps) {
        const { selectedLocateRack, parentLevel, rowData, onExpandClick, index, ancestorData } = this.props;
        console.log("selectedLocateRack in TVRowRightClick",selectedLocateRack);
                console.log(prevProps.rowData === this.props.rowData); // Likely true
        console.log(prevProps.rowData, this.props.rowData);   // Check contents
        if (
          !isEqual(prevProps.rowData, this.props.rowData) 
         
        ) {
          console.log('Row Data in componentDidUpdate:', this.props.rowData);
          this.tryAutoExpand();
        }
      }
    onSelectItem = (e) => {
      e.preventDefault();

      const {rowData, index, parentLevel, ancestorData, indexPath, floorPlan, displayRackSelection} = this.props;

      this.props.onSelectItem(rowData, ancestorData, index, parentLevel, indexPath);
    }

    onRightSelectItem = (e) => {
      e.preventDefault();

      const {rowData, index, parentLevel, ancestorData, indexPath, floorPlan, displayRackSelection} = this.props;

      if(rowData.footPrintInstId) {
        this.props.onRightSelectItem(rowData, ancestorData, index, parentLevel, indexPath);
      }
    }

    handleExpandCollapse = (e) => {
      e.preventDefault();
      const {rowData, index, parentLevel, ancestorData,filteredRackResults} = this.props;
      // console.log('props', this.props);
      this.props.onExpandClick(rowData, index, parentLevel, ancestorData,filteredRackResults);
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

    tryAutoExpand = () => {
            const { selectedLocateRack, parentLevel, rowData, onExpandClick, index, ancestorData } = this.props;
            if (!selectedLocateRack) return;

            //const level=ancestorData.length;
      console.log("heyyyyy");
            // derive path[0]=siteCd, [1]=struct, [2]=floor, [3]=subclass, [4]=vendor
            const path = [
              selectedLocateRack.siteCd,
              selectedLocateRack.struct,
              selectedLocateRack.floor,
              selectedLocateRack.subClass,
              selectedLocateRack.vendor
            ];
      
            // nothing to do if out of bounds or already expanded
            if (parentLevel >= path.length || rowData.expanded) return;
      
            // figure out this node’s value at `parentLevel`
            const myValue = [
              rowData.siteCd,
              rowData.sctructNmTxt,
              rowData.floorNmTxt,
              rowData.eqpType   || rowData.subClass,
              rowData.vendorName|| rowData.vendor
            ][parentLevel];
      
            // if it matches, trigger your expand callback//path[index] was working
             if (myValue === path[parentLevel]) {
              onExpandClick(rowData, index, parentLevel, ancestorData);
             }
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
      const { tree, keyIds, keyLabels, rowData, onExpandClick, onSelectItem, onRightSelectItem, ancestorData, parentLevel, indexPath, selectedItems, rightSelectedItems, treeIcons, immediateCheck, filterOnLevel } = this.props;
      const [, ...nextChildInfo ] = tree;
      const [, ...nextKeyIds] = keyIds;
      const [, ...nextKeyLabel] = keyLabels;
      const [currentSelected, ...nextSelected] = selectedItems;
      const [currentRightSelected, ...nextRightSelected] = rightSelectedItems;
      let childNodes = [];
      childNodes = treeChilds.map((item, childIndex) => {
        // console.log('tree rows', item);
        const treeIndex = item.originalIndex || childIndex;
        return (
        <ul
          key={`tree-${parentLevel + 1}-${treeIndex}`}
          className="tree">
            <TreeViewRowRightClick
              filterText={this.state.filter}
              tree={nextChildInfo}
              filteredRackResults={this.props.filteredRackResults}
              keyIds={nextKeyIds}
              treeIcons={treeIcons}
              filterOnLevel={filterOnLevel}
              icon={treeIcons[parentLevel + 1] || undefined}
              filteredLabel={item.filteredLabel}
              isFiltered={isFiltered}
              keyLabels={nextKeyLabel}
              onExpandClick={onExpandClick}
              onSelectItem={onSelectItem}
              onRightSelectItem={onRightSelectItem}
              index={treeIndex}
              indexPath={[...indexPath, treeIndex]}
              selected={currentSelected === treeIndex}
              rightSelected={currentRightSelected === treeIndex}
              selectedItems={currentSelected === treeIndex ? nextSelected : []}
              rightSelectedItems={currentRightSelected === treeIndex ? nextRightSelected : []}
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
          const { tree, keyIds, keyLabels, rowData, parentLevel, filteredRackResults, selected, selectedItems, rightSelected, rightSelectedItems, icon, immediateCheck, filteredLabel, isFiltered, filterOnLevel, ancestorData } = this.props;
         
          let highlight = false;
          const showExpandCollapse = true;

        
          const [currentChildInfo = [] ] = tree;
          const [currentKeyId] = keyIds;
          const [currentKeyLabel] = keyLabels;
          const { expanded, loading  } = rowData;
          const checkImmediateChilds = immediateCheck[parentLevel];
          let childNodes = [];
          const showFilterInput = filterOnLevel[parentLevel];

                    // console.log('RowData:', rowData, 'ParentLevel:', parentLevel);
                    //                     console.log('Tree Structure:', tree);

          const colorCodingClass = this.getEquipmentColorClass(rowData);

          if (this.state.filteredData && expanded) {
            childNodes = this.treeViewRow(this.state.filteredData, true);
          } else if (expanded) {
            const childInfo = currentChildInfo[rowData[currentKeyId]] || [];
            childNodes = this.treeViewRow(childInfo);
          }

          // Enhanced label creation
          let label;
          if (isFiltered) {
            label = filteredLabel;
          } else {
            // Get base label
            let baseLabel = typeof currentKeyLabel === 'function'
              ? currentKeyLabel(rowData, parentLevel, ancestorData)
              : rowData[currentKeyLabel] || '';

            // Special handling for PDF equipment
            if (parentLevel === 3 && rowData.subClass === "PDF" && expanded) {
              // Get parent information from ancestorData
              const site = ancestorData[0] ? `${ancestorData[0].siteCd || ancestorData[0].siteNm || ''}` : '';
              const structure = ancestorData[1] ? `${ancestorData[1].struct || ancestorData[1].sctructNmTxt || ''}` : '';
              const floor = ancestorData[2] ? `${ancestorData[2].floor || ancestorData[2].floorNmTxt || ''}` : '';

              // Format with site, structure, and floor details
              label = `${baseLabel} (${site} / ${structure} / ${floor})`;
            } else // In the render method, modify the filteredRackResults section:
                   if (filteredRackResults && filteredRackResults.length > 0) {
                     // Check if this node is part of the filtered results
                     let isPartOfFilteredResults = false;

                     switch(parentLevel) {
                       case 0: // Site level
                         isPartOfFilteredResults = filteredRackResults.some(result =>
                           (result.siteId === rowData.siteId) && rowData.clliCd);
                         break;
                       case 1: // Structure level
                         isPartOfFilteredResults = filteredRackResults.some(result =>
                           result.struct && (result.struct === rowData.struct ||
                                          result.struct === rowData.sctructNmTxt));
                         break;
                       case 2: // Floor level
                         isPartOfFilteredResults = filteredRackResults.some(result =>
                           result.floor && (result.floor === rowData.floor ||
                                         result.floor === rowData.floorNmTxt));
                         break;
                         case 3: // Equipment type level
                               isPartOfFilteredResults = filteredRackResults.some(result =>
                                 result.eqpType && (result.eqpType === rowData.eqpType ||
                                                 result.eqpType === rowData.subClass));
                               break;
                             case 4: // Vendor level
                               isPartOfFilteredResults = filteredRackResults.some(result =>
                                 result.vendorName && (result.vendorName === rowData.vendorName ||
                                                    result.vendorName === rowData.vendor));
                               break;
                     }

                     // Set auto-expand flag instead of using setTimeout
                     /*if (isPartOfFilteredResults && !expanded) {
                       rowData.expanded = true;
                     }*/

                     // Add indicator for better visibility
                     label = isPartOfFilteredResults ? `${baseLabel} ✓` : baseLabel;

            } else {
              label = baseLabel;
            }
          }

          const isLastSelected = selected && !selectedItems.length;
          const isLastRightSelected = rightSelected && !rightSelectedItems.length;
          const linkClasses = classNames('tree-label-link', { 'font-bold': selected, selected: isLastSelected, 'right-selected': isLastRightSelected });
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
                  onContextMenu={this.onRightSelectItem}
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

export default TreeViewRowRightClick;
