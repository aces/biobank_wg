import {useState, useEffect} from 'react';
import Container from './Container.js';
import {get, post} from './helpers.js';

// function Shipments(shipments = {}) {
//   console.log(shipments);
//   return new Map(Object.entries(shipments));
// }

export function useShipment(initShipment = {}) {
  const [shipment, setShipment] = useState(new Shipment(initShipment));
  // TODO: FIGURE OUT A BETTER WAY OF HANDLING LOG ERRORS. NO MORE || {} EVERYWHERE.
  // DONT DO IT. JUST DON'T.
  const [errors, setErrors] = useState({logs: []});

  useEffect(() => {
    const loadCenter = async () => {
      const barcode = shipment.containers[0];
      const container = await new Container().load(barcode);
      setShipment(shipment.set('logs', shipment.setLog('center', container.center, 0)));
    };

    // If containers changes, update the origin center!
    if (shipment.containers.length === 1) {
      loadCenter();
    }
  }, [shipment.containers[0]]);

  this.set = (name, value) => setShipment(shipment.set(name, value));
  this.setContainers = (value) => this.set('containers', value);
  this.setLogs = (value) => this.set('logs', value);
  this.setLog = (name, value, index) => this.setLogs(shipment.setLog(name, value, index));
  this.remove = (name) => setShipment(shipment.remove(name));
  this.clear = () => {
    setShipment(new Shipment());
    setErrors({logs: []});
  };
  this.post = () => post(shipment, `${loris.BaseURL}/biobank/shipments/`, 'POST')
    .catch((e) => Promise.reject(setErrors(e)));
  this.getShipment = () => shipment;
  this.getErrors = () => errors;

  return this;
}

class Shipment {
  constructor(props = {}) {
    this.barcode = props.barcode || null;
    this.destinationCenter = props.destinationCenter || null;
    this.logs = props.logs || [new Log({status: 'created'})];
    this.containers = props.containers || [];
    this.errors = {};
  }

  set(name, value) {
    return new Shipment({...this, [name]: value});
  }

  remove(name) {
    return new Shipment({name, ...this});
  }

  async load(barcode) {
   const shipment = await get(`${loris.BaseURL}/biobank/shipments/${barcode}`);
   return new Shipment(shipment);
  }

  addLog(status) {
    return [...this.logs, new Log({status: status})];
  };

  setLog(name, value, index) {
    return this.logs.map((log, i) => {
      if (i !== index) {
        return log;
      }
      return new Log({...log, [name]: value});
    });
  };
}

class Log {
  constructor(props = {}) {
    this.shipmentId = props.id || null;
    this.center = props.center || null;
    this.status = props.status || null;
    this.user = props.user || null;
    this.temperature = props.temperature || null;
    this.date = props.date || null;
    this.time = props.time || null;
  }

  set(name, value) {
    return new Log({...this, [name]: value});
  }
}

export default Shipment;
