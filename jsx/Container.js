import {useState} from 'react';
import {get, post} from './helpers.js';

// function Containers(containers = {}) {
//   console.log(containers);
//   return new Map(Object.entries(containers));
// }

export function useContainer(initContainer = {}) {
  const [container, setContainer] = useState(new Container(initContainer));

  function set(name, value) {
    return setContainer(container.set(name, value));
  }

  return [container, set];
}

class Container {
  constructor(props = {}) {
    this.barcode = props.barcode || null;
    this.typeId = props.typeId || null;
    this.dimensionId = props.dimensionId|| null;
    this.temperature = props.temperature || null;
    this.statusId = props.statusId || null;
    this.projectIds = props.projectIds || [];
    this.center = props.center || null;
    this.parentContainerId = props.parentContainerId || null;
    this.childContainerIds = props.childContainerIds || [];
    this.coordinate = props.coordinate || null;
    this.lotNumber = props.lotNumber || null;
    this.expirationDate = props.expirationDate || null;
    this.comments = props.comments || null;
  }

  set(name, value) {
    return new Container({...this, [name]: value});
  }

  remove(name) {
    return new Container({name, ...this});
  }

  async load(barcode) {
    // TODO: ideally we wouldn't have to access the first item of the array here.
    const container = await get(`${loris.BaseURL}/biobank/containers/${barcode}`);
    return new Container(container[0]);
  }

  validate() {
  };

  async post() {
    return await post(this, `${loris.BaseURL}/biobank/containers/`, 'POST');
  }
}

export default Container;
