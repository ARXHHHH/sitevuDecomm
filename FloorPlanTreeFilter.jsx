import React from 'react';
import {
  Overlay,
  Popover,
  Glyphicon,
  Button,
  ButtonGroup,
  FormGroup,
  FormControl,
  InputGroup,
  ListGroup,
  ListGroupItem,
  Checkbox
} from 'react-bootstrap';
import _ from 'lodash';
import { FloorPlanService } from 'utils/FloorPlanService'
import AlertManager from 'components/AlertManager'
import VZButton from 'components/VZButton';
import FAIcon from 'components/FAIcon';
const floorplanApi = new FloorPlanService();



class FloorPlanTreeFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shown: false,
      subclasses: [],
      allSelected: false,
      noneSelected: true,
    };
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.getSubclasses = this.getSubclasses.bind(this);
    this.subclassSelected = this.subclassSelected.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.selectAll = this.selectAll.bind(this);
  }

  componentDidMount() {
    const { floorId } = this.props;
    if (floorId !== "0") {
      this.getSubclasses(floorId, ""); // Fetch data immediately after the component mounts
    }
  }

  getSubclasses(floorId, searchStr) {
    const { subclasses } = this.state;

    // Avoid making the API call if data is already loaded
    if (subclasses.length > 0 && !searchStr) {
      return;
    }

    floorplanApi.getFloorSubclasses(floorId, searchStr)
      .then(result => {
        const subclasses = _.map(result, o => ({ subclass: o, checked: false }));
        this.setState({ subclasses });
      })
      .catch(error => {
        AlertManager.error(error);
        this.setState({ subclasses: [] });
      });
  }

  componentWillMount() {
    let floorId = this.props.floorId;
    if (this.props.floorId !== "0") {
    this.getSubclasses(floorId, "");
  }
}

  componentWillReceiveProps(nextProps) {
    if (this.props.floorId !== nextProps.floorId) {
      this.getSubclasses(nextProps.floorId, "");
    }
  }

  handleClick() {
    this.setState({
      shown: true,
    });
  }

  handleHide() {
    this.setState({
      shown: false,
    });
  }

  handleSearchChange(e) {
    e.target.value = e.target.value.toUpperCase();
    this.handleChange(e);
    this.getSubclasses(this.props.floorId, e.target.value);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

   subclassSelected(e) {
    let index = e.target.id;
    let subclasses = JSON.parse(JSON.stringify(this.state.subclasses));
    subclasses[index].checked = e.target.checked;

    // Get all selected subclasses
    let selected = subclasses.filter(subclass => subclass.checked === true);

    this.setState({
      subclasses: subclasses,
      noneSelected: selected.length === 0
    });

    // Only call the API if in tree view mode and we have selected subclasses
    if (selected.length > 0) {
      const siteId = 1400;
      const category = "SC";

      // Make separate API calls for each selected subclass
      const apiPromises = selected.map(item => {
        const subclassValue = item.subclass;
        return floorplanApi.searchRacksInSite(siteId, subclassValue, category)
          .then(result => {
            // Filter result to only include the required fields
            const filteredResults = result.map(rack => ({
              floor: rack.floor,
              struct: rack.struct,
              vendorName: rack.vendor,
              rackPos: rack.rackPos,
              siteId: rack.siteId,
              eqpType: subclassValue
            }));
            console.log("Filtered Results:", filteredResults);
            return filteredResults;
          })
          .catch(error => {
            AlertManager.error(`Failed to search racks for ${singleSubclass}: ${error.message || error}`);
            return [];
          });
      });

      // Wait for all API calls to complete
      Promise.all(apiPromises)
        .then(resultsArray => {
          // Flatten array of arrays into a single array
          const allResults = [].concat(...resultsArray);

          // Pass results up to parent through the callback
          if (this.props.onSearchResults) {
            this.props.onSearchResults(allResults);
          }
        });
    } else if (selected.length === 0 && this.props.onSearchResults) {
      // Clear results when no filters are selected
      this.props.onSearchResults([]);
    }
  }

/*   subclassSelected(e) {
    const index = e.target.id;
    const subclasses = [...this.state.subclasses];
    subclasses[index].checked = e.target.checked;

    // Optimistically update the state
    this.setState({
      subclasses,
      noneSelected: subclasses.every(subclass => !subclass.checked),
    });

    // Collect all selected subclasses
    const selectedSubclasses = subclasses
      .filter(subclass => subclass.checked)
      .map(subclass => subclass.subclass);

    if (selectedSubclasses.length > 0) {
      const siteId = 1400;
      const category = "SC";

      // Batch API call for all selected subclasses
      floorplanApi.searchRacksInSite(siteId, selectedSubclasses, category)
        .then(result => {
          const filteredResults = result.map(rack => ({
            floor: rack.floor,
            struct: rack.struct,
            vendorName: rack.vendor,
            rackPos: rack.rackPos,
            siteId: rack.siteId,
            eqpType: rack.subClass,
          }));
          console.log("Filtered Results:", filteredResults);

          // Pass results to the parent component
          if (this.props.onSearchResults) {
            this.props.onSearchResults(filteredResults);
          }
        })
        .catch(error => {
          AlertManager.error(`Failed to search racks: ${error.message || error}`);
        });
    } else if (this.props.onSearchResults) {
      // Clear results when no filters are selected
      this.props.onSearchResults([]);
    }
  } */

  clearAll() {
    let subclasses = this.state.subclasses.map(subclass => {
      subclass.checked = false;
      return subclass;
    });
    this.setState({
      subclasses: subclasses,
      noneSelected: true,
      allSelected: false
    });
    this.props.onSubclassSelected([]);
  }

  selectAll() {
    let subclasses = this.state.subclasses.map(subclass => {
      subclass.checked = true;
      return subclass;
    });
    this.setState({
      subclasses: subclasses,
      allSelected: true,
      noneSelected: false,
    });
    this.props.onSubclassSelected(subclasses);
  }

  render() {
    return (
      <Button
        bsSize="xsmall"
        onClick={this.handleClick}
        ref={ref => this.buttonRef = ref}
        tabIndex="-1"
        className="btn-defaulted">
        <span>{this.props.children}</span>
        <Overlay
          className={this.props.overlayClass}
          placement="bottom"
          container={this.props.container}
          rootClose
          onHide={this.handleHide}
          show={this.state.shown}
          target={this.buttonRef}>
          <Popover
            title="Select Equipment Types to show1"
            id="popover-positioned-bottom"
            className={`filter-popover--popover FloorPlanFilter ${this.props.popoverClass}`}>
            <ButtonGroup vertical>
              <Button bsSize='xsmall' disabled={this.state.allSelected} onClick={this.selectAll}>
                <FAIcon icon="check-circle-o" size="1x" />
                {' '}
                Select All Shown
              </Button>
              <Button bsSize='xsmall' disabled={this.state.noneSelected} onClick={this.clearAll}>
                <FAIcon icon="ban" size="1x" />
                {' '}
                Clear Filter
              </Button>
            </ButtonGroup>
            <form>
              <FormGroup
                className='filter-popover--popover__search-box'>
                <InputGroup style={{ width: '100%' }}>
                  <FormControl
                    type="text"
                    placeholder="Search"
                    name="search"
                    value={this.state.search}
                    autoComplete="off"
                    onChange={this.handleSearchChange}>
                  </FormControl>
                </InputGroup>
              </FormGroup>
            </form>
            <FormGroup className='filter-popover--popover__form'>
              <ListGroup style={{ height: '200px' }} className='filter-popover--popover__list'>
                {
                  this.state.subclasses.map((sub, index) => {
                    return (
                      <ListGroupItem
                        key={index}
                        style={{ whiteSpace: 'nowrap' }}
                        className='filter-popover--popover__list-item'>
                        <Checkbox
                          id={index}
                          name={sub.subclass}
                          checked={sub.checked}
                          style={{ width: '100%' }}
                          onChange={this.subclassSelected}
                          className='filter-popover--popover__checkbox'>
                          {sub.subclass}
                        </Checkbox>
                      </ListGroupItem>
                    )
                  }, this)
                }
              </ListGroup>
            </FormGroup>
          </Popover>
        </Overlay>
      </Button>
    );
  }
}

export default FloorPlanTreeFilter;
