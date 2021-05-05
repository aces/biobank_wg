import {useState, useEffect} from 'react';
import {get, post} from './helpers.js';

export function useContainer(initContainer = {}) {
  const [init, setInit] = useState(new Container(initContainer));
  const [container, setContainer] = useState(new Container(initContainer));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setInit(new Container(initContainer));
    setContainer(new Container(initContainer));
  }, [initContainer]);

  this.set = (name, value) => setContainer(container.set(name, value));
  this.put = async () => await post(container, `${loris.BaseURL}/biobank/containers/`, 'PUT')
    .then((containers) => {
      setInit(new Container(containers[0]));
      setContainer(new Container(containers[0]));
    })
    .catch((e) => Promise.reject(setErrors(e)));
  this.remove = (name) => setContainer(container.remove(name));
  this.clear = () => {
    setContainer(init);
    setErrors({});
  };
  this.getContainer = () => container;
  this.getErrors = () => errors;

  return this;
}

class Container {
  constructor(props = {}) {
    this.id = props.id || null;
    this.barcode = props.barcode || null;
    this.typeId = props.typeId || null;
    this.dimension = props.dimension || {};
    this.temperature = props.temperature || null;
    this.statusId = props.statusId || null;
    this.projectIds = props.projectIds || [];
    this.centerId = props.centerId || null;
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

  async getParentContainers(container = this, containers=[]) {
    containers.push(container);

    const parent = await this.load(container.parentContainerId);

    parent.id && this.getParentContainers(parent, containers);

    return containers.slice(0).reverse();
  }

  async getCoordinateLabel(dimension) {
    if (!dimension) {
      const parentContainer = await this.load(this.parentContainerId);
      dimension = parentContainer.dimension;
    }
    let coordinate;
    let j = 1;
    outerloop:
    for (let y=1; y<=dimension.y; y++) {
      innerloop:
      for (let x=1; x<=dimension.x; x++) {
        if (j == this.coordinate) {
          if (dimension.xNum == 1 && dimension.yNum == 1) {
            coordinate = x + (dimension.x * (y-1));
          } else {
            const xVal = dimension.xNum == 1 ? x : String.fromCharCode(64+x);
            const yVal = dimension.yNum == 1 ? y : String.fromCharCode(64+y);
            coordinate = yVal+''+xVal;
          }
          break outerloop;
        }
        j++;
      }
    }
    return coordinate;
  }

  remove(name) {
    return new Container({name, ...this});
  }

  put() {
    return post(this, `${loris.BaseURL}/biobank/containers/`, 'PUT');
  }

  async load(id) {
    const container = await get(`${loris.BaseURL}/biobank/containers/${id}`);
    // TODO: ideally we wouldn't have to access the first item of the array here.
    return new Container(container[0]);
  }

  async post() {
    return await post(this, `${loris.BaseURL}/biobank/containers/`, 'POST');
  }
}

export default Container;
