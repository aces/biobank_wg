import {post, isEmpty} from './helpers.js';

class Shipment {
  constructor(props) {
    this.barcode = props.barcode || null;
    this.destinationCenter = props.destinationCenter || null;
    this.logs = props.logs || [{status: 'created'}];
    this.containers = props.containers || [];
  }

  addLog(status) {
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

export default Shipment;
