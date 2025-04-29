import React, { PropTypes } from 'react';
import RackLocationTable from 'store/containers/floorPlan/RackLocationTableContainer';
import {
  Modal,
  Col,
  Row,
  Panel,
  ButtonToolbar,
} from 'react-bootstrap';
import FAIcon from 'components/FAIcon';
import VZButton from 'components/VZButton';

export default class LocateResultsModal extends React.Component {
  static propTypes = {
    foundRack: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onGo: PropTypes.func.isRequired,
    show: PropTypes.bool,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    rackList: [],
    foundRack: false,
    show: false,
    loading: false,
  };

  constructor(props) {
    super(props);
    this.handleGo = this.handleGo.bind(this);
    this.handleGoRight = this.handleGoRight.bind(this);
  }

  handleGo() {
    this.props.onGo();
    this.props.onCancel();
  }

  handleGoRight() {
    this.props.onGoRight();
    this.props.onCancel();
  }

  render() {
    return (
      <Modal show={this.props.show}>
        <div style={{ display: 'block' }} className="onetwork__layout">
          <Panel
            header={
              <span className="install-rack-wizard__header">
                Select a floor plan to view
                <span
                  onClick={this.props.onCancel}
                  style={{ cursor: 'pointer', color: '#cccccc' }}
                >
                  <FAIcon icon="times" pullRight />
                </span>
              </span>
            }
            footer={
              <Row className="install-rack-wizard__footer">
                <Col sm={6} />
                <Col sm={6}>
                  <ButtonToolbar
                    style={{ marginBottom: 0 }}
                    className="pull-right"
                  >
                    <VZButton
                      disabled={
                        !this.props.foundRack || this.props.loading
                      }
                      onClick={this.handleGo}
                    >
                      <FAIcon icon="search" size="1x" /> Go
                    </VZButton>

                    {this.props.isRightSelectionAvailable()
                      ?
                        <VZButton
                          onClick={this.handleGoRight}
                        >
                          <FAIcon icon="search" size="1x" /> Go (Right Side)
                        </VZButton>
                      :
                        null
                    }

                    

                    <VZButton
                      className="btn-info"
                      onClick={this.props.onCancel}
                    >
                      <FAIcon icon="times" size="1x" /> Cancel
                    </VZButton>
                  </ButtonToolbar>
                </Col>
              </Row>
            }
          >
            {this.props.loading ? (
              <div className="results-loader-sm" />
            ) : (
              <Row>
                <RackLocationTable
                    isSearchByNN={this.props.searchCriteria=== 'NN' ? true : false}
                />
              </Row>
            )}
          </Panel>
        </div>
      </Modal>
    );
  }
}
