import {useState} from 'react';
import {post, isEmpty} from './helpers.js';

// function Shipments(shipments = {}) {
//   console.log(shipments);
//   return new Map(Object.entries(shipments));
// }

export function useShipment(initShipment = {}) {
  const [shipment, setShipment] = useState(new Shipment(initShipment));

  function set(name, value) {
    setShipment(shipment.set(name, value));
  }

  return [shipment, set];
}

class Shipment {
  constructor(props = {}) {
    this.barcode = props.barcode || null;
    this.destinationCenter = props.destinationCenter || null;
    this.logs = props.logs || [{status: 'created'}];
    this.containers = props.containers || [];
  }

  set(name, value) {
    return new Shipment({...this, [name]: value});
  }

  remove(name) {
    return new Shipment({name, ...this});
  }

  addLog(status) {
  };

  setLog(name, value, index) {
    return this.logs.map((log, i) => {
      if (i !== index) {
        return log;
      }
      return {...log, [name]: value};
    });
  };

  validate() {
    const errors = {};
    if (!this.barcode) {
      errors.barcode = 'This field is required';
    }
    if (isEmpty(errors)) {
      return;
    }
    return errors;
  };

  post() {
    return post(this, `${loris.BaseURL}/biobank/shipments/`, 'POST');
  }
}

// class Log {
//   constructor(props) {
//     this.shipmentId = props.id;
//     this.center = props.center;
//     this.status = props.status
//     this.user = props.user;
//     this.temperature = props.temperature;
//     this.date = props.date;
//     this.time = props.time;
//   }
// }

export default Shipment;
