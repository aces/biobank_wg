import {useState} from 'react';
import {get, post} from './helpers.js';

export function useSpecimen(initSpecimen = {}) {
  // const [initial] = useState(initSpecimen);
  const [specimen, setSpecimen] = useState(new Specimen(initSpecimen));
  const [errors, setErrors] = useState({});

  this.set = (name, value) => setSpecimen(specimen.set(name, value));
  this.addProcess = (process) => specimen.addProcess(process);
  this.setProcess = (name, value, process) => {
    setSpecimen(specimen.set(process, specimen.setProcess(name, value, process)));
  };
  this.setData = (name, value, process) => {
    data = {...specimen[process].data, [name]: value};
    setProcess('data', data, process);
  };
  this.put = () => post(specimen, `${loris.BaseURL}/biobank/specimens/`, 'PUT')
    .catch((e) => Promise.reject(setErrors(e)));
  this.remove = (name) => setSpecimen(specimen.remove(name));
  this.clear = async () => {
    setSpecimen(new Specimen(initSpecimen));
    setErrors({});
  };
  this.getSpecimen = () => specimen;
  this.getErrors = () => errors;

  return this;
}

class Specimen {
  constructor(props = {}) {
    this.id = props.id || null;
    this.containerId = props.containerId || null;
    this.typeId = props.typeId || null;
    this.quantity = props.quantity|| null;
    this.unitId = props.unitId || null;
    this.fTCycle = props.fTCycle || null;
    this.parentSpecimenIds = props.parentSpecimenIds || [];
    this.candidateId = props.candidateId || null;
    this.candidateAge = props.candidateAge || null;
    this.sessionId = props.sessionId || null;
    this.poolId = props.poolId || null;
    // TODO: the id should probably already be imbedded in the process...
    this.collection = new Process({...props.collection, id: props.id});
    this.preparation = new Process(props.preparation);
    this.analysis = new Process(props.analysis);
  }

  set(name, value) {
    return new Specimen({...this, [name]: value});
  }

  // TODO: This should be possible to be done here!
  getParentSpecimenBarcodes(specimen, barcodes=[]) {
    barcodes.push(specimen.barcode);

    const parent = Object.values(this.props.data.specimens)
      .find((c) => specimen.parentSpecimenId == c.id);

    parent && this.getParentSpecimenBarcodes(parent, barcodes);

    return barcodes.slice(0).reverse();
  }

  remove(name) {
    return new Specimen({name, ...this});
  }

  addProcess(process) {
    // TODO: When adding a new preparation, the centerId shold be set to the current
    // container center!!!
    return set(process, new Process({centerId: 1}));
  }

  setProcess(name, value, process) {
    return new Process({...this[process], [name]: value});
  }

  put() {
    return post(this, `${loris.BaseURL}/biobank/specimens/`, 'PUT');
  }

  async load(barcode) {
    // TODO: ideally we wouldn't have to access the first item of the array here.
    const specimen = await get(`${loris.BaseURL}/biobank/specimens/${barcode}`);
    return new Specimen(specimen[0]);
  }

  async post() {
    return await post(this, `${loris.BaseURL}/biobank/specimens/`, 'POST');
  }
}

class Process {
  constructor(props = {}) {
    this.id = props.id || null;
    this.protocolId = props.protocolId || null;
    this.quantity = props.quantity || null;
    this.unitId = props.unitId || null;
    this.centerId = props.centerId || null;
    this.examinerId = props.examinerId || null;
    this.date = props.date || null;
    this.time = props.time || null;
    this.comments = props.comments || null;
    this.data = props.data || {};
  }

  set(name, value) {
    return new Specimen({...this, [name]: value});
  }
};

export default Specimen;