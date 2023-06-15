import React from 'react';
import Textarea from 'react-textarea-autosize';
import {Grid, Row, Col, Panel, FormGroup, FormControl, Radio} from 'react-bootstrap';
import AppActions from '../actions/AppActions';
import { getSocket } from './WebSocketConnection';

class AddTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = { testTPS: 1000 };
    this.socket = null;
    
    this.handleTPSChange = this.handleTPSChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);
  }

  componentDidMount() {
    // 创建WebSocket连接
    this.socket = getSocket();

    // 添加WebSocket事件处理器
    this.socket.addEventListener('open', (event) => {
        console.log("WebSocket connection opened");
    });

    this.socket.addEventListener('message', this.handleWebSocketMessage);

    this.socket.addEventListener('close', (event) => {
        console.log("WebSocket connection closed");
    });

    this.socket.addEventListener('error', (event) => {
        console.log("WebSocket error: ", event);
    });
}


  componentWillUnmount() {
    if (this.socket) {
      this.socket.close();
    }
    clearInterval(this.interval);
    //clearInterval(this.interval);
  }

  handleWebSocketMessage(event) {
    

    const data = JSON.parse(event.data);
  
    if (data.action === 'TestTPS') {
      AppActions.testTPS(data.count);
    }
  }

  handleTPSChange(event) {
    this.setState({testTPS: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    var type = event.target.transactionType.value;
    var data = event.target.transactionData.value;

    if (!data) {
      AppActions.emptyTransaction();
      this.refs.transactionDataField.focus();
    }
    else {
      AppActions.addTransaction(type, data);
    }
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col sm={12}>
            <Panel header={(<h4>Add Transaction</h4>)}>
              <form onSubmit={this.handleSubmit}>
                <div className={'form-group ' + this.props.addTransactionState}>
                  <label className="control-label">Transaction</label>
                  <Textarea type="text" maxRows={20} className="form-control" name="transactionData" ref="transactionDataField" autoFocus />
                  <span className="help-block">{this.props.addTransactionHelp}</span>
                </div>
                <FormGroup>
                  <Radio inline defaultChecked name="transactionType" value="data">
                    Data
                  </Radio>
                  {'   '}
                  <Radio inline name="transactionType" value="address">
                    IPFS Address
                  </Radio>
                </FormGroup>
                <FormGroup>
                  <label className="control-label">Test TPS</label>
                  <FormControl type="number" value={this.state.testTPS} onChange={this.handleTPSChange} />
                </FormGroup>
                <button type="submit" className="btn btn-primary">tijiao</button>
		<button type="button" className="btn btn-primary" onClick={AppActions.testTPS.bind(this, this.state.testTPS)}>Test TPS</button>
              </form>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default AddTransaction;
