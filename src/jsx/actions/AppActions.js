import alt from '../alt';
import io from 'socket.io-client';
import 'whatwg-fetch';
import { getSocket } from '../components/WebSocketConnection';

var socket = io();

class AppActions {
  constructor() {
    this.generateActions(
      'getChainSuccess',
      'getChainFail',
      'getChainLengthSuccess',
      'getChainLengthFail',
      'getPeersSuccess',
      'getPeersFail',
      'getPendingTransactionsSuccess',
      'getPendingTransactionsFail',
      'getBlockchainIdSuccess',
      'getBlockchainIdFail',
      'addTransactionSuccess',
      'addTransactionFail',
      'emptyTransaction'
    );
	  this.testTPS = this.testTPS.bind(this);
  }

  getChain(limit) {
    socket.emit('chain', {limit: limit});
  }

  getChainLength() {
    socket.emit('length');
  }

  getPeers() {
    socket.emit('peers');
  }

  getPendingTransactions() {
    socket.emit('pending');
  }

  getBlockchainId() {
    socket.emit('id');
  }

  async testTPS(transactionCount) {
  //   const startTime = Date.now();
  //   for (let i = 0; i < transactionCount; i++) {
  //     const uniqueData = `test data ${i}`;
  //     await this.addTransaction('data', uniqueData);
  //   }
  //   const endTime = Date.now();
  //   const elapsedTime = (endTime - startTime) / 1000; // in seconds
  //   const tps = transactionCount / elapsedTime;
  //   console.log(`TPS: ${tps}`);
    
  // const socket = getSocket();
  // socket.send(JSON.stringify({ tps: tps }));
  const startTime = Date.now();
  let totalDelay = 0;

  for (let i = 0; i < transactionCount; i++) {
    const uniqueData = `test data ${i}`;
    const transactionStartTime = Date.now();
    await this.addTransaction('data', uniqueData);
    const transactionEndTime = Date.now();

    const transactionDelay = transactionEndTime - transactionStartTime;
    totalDelay += transactionDelay;
  }

  const endTime = Date.now();
  const elapsedTime = (endTime - startTime) / 1000; // in seconds
  const tps = transactionCount / elapsedTime;
  console.log(`TPS: ${tps}`);

  const averageDelay = totalDelay / transactionCount;
  console.log(`Average Delay: ${averageDelay}ms`);

  const socket = getSocket();
  socket.send(JSON.stringify({ tps: tps, averageDelay: averageDelay }));

  }


  addTransaction(type, data) {
    console.log(type, data)
    fetch('/api/v0/tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: type,
        data: data
      })
    }).then((response) => {
      if (response.status === 200) {
        return response.text();
      }
      else {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
    }).then((text) => {
      this.actions.addTransactionSuccess(text);
    });
  }
}

var actions = alt.createActions(AppActions);

socket.on('chainResult', (body) => {
  actions.getChainSuccess(body);
});

socket.on('lengthResult', (body) => {
  actions.getChainLengthSuccess(body);
});

socket.on('peersResult', (body) => {
  actions.getPeersSuccess(body);
});

socket.on('pendingResult', (body) => {
  actions.getPendingTransactionsSuccess(body);
});

socket.on('idResult', (body) => {
  actions.getBlockchainIdSuccess(body);
});

socket.on('chainUpdated', () => {
  actions.getChainLength();
  actions.getChain();
});

export default actions;
