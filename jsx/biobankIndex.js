import {useState, useReducer, useEffect} from 'react';

import {BrowserRouter, Route, Switch} from 'react-router-dom';

import BiobankFilter from './filter';
import BarcodePage from './barcodePage';
import {clone, get, getStream, post} from './helpers.js';

function dataReducer(data, action) {
  switch (action.type) {
    case 'load':
      return {
        ...data,
        [action.entity]: action.payload,
      };
    case 'update':
      const newData = clone(data);
      action.payload.forEach((entity) => newData[action.entity][entity.id] = entity);
      return newData;
  }
}

const initData = {
  containers: {},
  pools: {},
  specimens: {},
};

export const DispatchContext = React.createContext();
export const DataContext = React.createContext();

function BiobankIndex({
  specimenAPI,
  containerAPI,
  poolAPI,
  optionsAPI,
  labelAPI,
}) {
  const [data, dispatch] = useReducer(dataReducer, initData);
  const [loading, setLoading] = useState(0);
  const initOptions = {
    candidatesSessions: {},
    candidates: {},
    centers: {},
    container: {
      types: {},
      typesPrimary: {},
      typesNonPrimary: {},
      stati: {},
    },
    diagnoses: {},
    examiners: {},
    users: {},
    projects: {},
    sessionCenters: {},
    sessions: {},
    shipment: {
      statuses: {},
    },
    specimen: {
      types: {},
      typeUnits: {},
      typeContainerTypes: {},
      protocols: {},
      protocolAttributes: {},
      protocoContainers: {},
      processes: {},
      processAttributes: {},
      attributes: {},
      attributeDatatypes: {},
      attributesOptions: {},
      units: {},
    },
  };
  const [options, setOptions] = useState(initOptions);

  useEffect(() => {
    async function fetchMyAPI() {
      const updateProgress = (loading) => setLoading(loading);

      const specimens = getStream(specimenAPI, updateProgress);
      const containers = get(containerAPI);
      const pools = get(poolAPI);
      const options = await get(optionsAPI, updateProgress);
      setOptions(options);

      dispatch({type: 'load', entity: 'containers', payload: await containers});
      dispatch({type: 'load', entity: 'specimens', payload: await specimens});
      dispatch({type: 'load', entity: 'pools', payload: await pools});
    }

    fetchMyAPI();
  }, []);

  const printLabel = (labelParams) => {
    return post(labelParams, labelAPI, 'POST');
  };

  const routeBarcode = (barcode) => {
    const container = Object.values(data.containers)
      .find((container) => container.barcode == barcode);

    const specimen = Object.values(data.specimens)
      .find((specimen) => specimen.containerId == container.id);

    return {container, specimen};
  };

  const increaseCoordinate = (coordinate, parentContainerId) => {
    const childCoordinates = data.containers[parentContainerId].childContainerIds
    .reduce((result, id) => {
      const container = data.containers[id];
      if (container.coordinate) {
        result[container.coordinate] = id;
      }
      return result;
    }, {});

    const increment = (coord) => {
      coord++;
      if (childCoordinates.hasOwnProperty(coord)) {
        coord = increment(coord);
      }

      return coord;
    };

    return increment(coordinate);
  };

  const barcode = (props) => {
    const target = routeBarcode(props.match.params.barcode);
    return (
      <BarcodePage
        history={props.history}
        specimen={target.specimen}
        container={target.container}
        data={data}
        options={options}
        printLabel={printLabel}
        increaseCoordinate={increaseCoordinate}
        loading={loading}
      />
    );
  };

  const filter = (props) => (
    <BiobankFilter
      history={props.history}
      data={data}
      options={options}
      increaseCoordinate={increaseCoordinate}
      loading={loading}
    />
  );

  // const contextValue = useMemo(() => ({
  //   data,
  //   dispatch,
  // }), [state, dispatch]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <DataContext.Provider value={data}>
        <BrowserRouter basename='/biobank'>
          <div>
            <Switch>
              <Route exact path='/' render={filter}/>
              <Route exact path='/barcode=:barcode' render={barcode}/>
            </Switch>
          </div>
        </BrowserRouter>
      </DataContext.Provider>
    </DispatchContext.Provider>
  );
}

window.addEventListener('load', () => {
  const biobank = `${loris.BaseURL}/biobank/`;
  ReactDOM.render(
    <BiobankIndex
      specimenAPI={`${biobank}specimens/`}
      containerAPI={`${biobank}containers/`}
      poolAPI={`${biobank}pools/`}
      optionsAPI={`${biobank}options/`}
      labelAPI={`${biobank}labelendpoint/`}
    />,
    document.getElementById('lorisworkspace'));
});

  // const updateSpecimen = (specimen) => {
  //   const errors = validateSpecimen(specimen);
  //   if (!isEmpty(errors)) {
  //     return Promise.reject({specimen: errors});
  //   }

  //   return post(specimen, specimenAPI, 'PUT')
  //   .then((specimens) => updateData('specimens', specimens));
  // };

  // TODO: This should eventually check for errors and replace 'updateSpecimen'
  // All updates can be sent via an array. This change should be reflected in
  // the backend too. It should also be able to be be sent with a nested
  // container object.
  // const updateSpecimens = (list) => {
  //   const updateList = list
  //   .map((specimen) => () => updateSpecimen(specimen));

  //   return Promise.all(updateList.map((updateSpecimen) => updateSpecimen()));
  // };

  // const editSpecimens = (list) => {
  //   let errors = {};
  //   errors.specimen = validateSpecimen(list[0].specimen);
  //   errors.container = validateContainer(list[0].container);
  //   if (!isEmpty(errors.specimen) || !isEmpty(errors.container)) {
  //     return Promise.reject(errors);
  //   }

  //   // TODO: For now, specimens and their respective containers are sent
  //   // separately and 1 by 1 to be updated. They should eventually be sent
  //   // together and batched in an array.
  //   const specimenList = list
  //   .map((item) => () => updateSpecimen(item.specimen));
  //   const containerList = list
  //   .map((item) => () => updateContainer(item.container));

  //   return Promise.all(specimenList.map((item) => item()))
  //   .then(() => Promise.all(containerList.map((item) => item())));
  // };

  // const updateContainer = (container) => {
  //   const errors = validateContainer(container);
  //   if (!isEmpty(errors)) {
  //     return Promise.reject({container: errors});
  //   }

  //   return post(container, containerAPI, 'PUT')
  //   .then((containers) => updateData('containers', containers));
  // };

  // const createSpecimens = (list, current, print) => {
  //   const labelParams = [];
  //   const projectIds = current.projectIds;
  //   const centerId = current.center;
  //   const availableId = Object.keys(options.container.stati).find(
  //     (key) => options.container.stati[key].label === 'Available'
  //   );
  //   const errors = {specimen: {}, container: {}, list: {}};

  //   let isError = false;
  //   Object.keys(list).reduce((coord, key) => {
  //     // set specimen values
  //     const specimen = list[key];
  //     specimen.candidateId = current.candidateId;
  //     specimen.sessionId = current.sessionId;
  //     specimen.quantity = specimen.collection.quantity;
  //     specimen.unitId = specimen.collection.unitId;
  //     specimen.collection.centerId = centerId;
  //     if ((options.specimen.types[specimen.typeId]||{}).freezeThaw == 1) {
  //       specimen.fTCycle = 0;
  //     }
  //     specimen.parentSpecimenIds = current.parentSpecimenIds || null;

  //     // set container values
  //     const container = specimen.container;
  //     container.statusId = availableId;
  //     container.temperature = 20;
  //     container.projectIds = projectIds;
  //     container.center = center;

  //     // If the container is assigned to a parent, place it sequentially in the
  //     // parent container and inherit the status, temperature and centerId.
  //     if (current.container.parentContainerId) {
  //       container.parentContainerId = current.container.parentContainerId;
  //       const parentContainer = data.containers[current.container.parentContainerId];
  //       const dimensions = options.container.dimensions[parentContainer.dimensionId];
  //       const capacity = dimensions.x * dimensions.y * dimensions.z;
  //       coord = increaseCoordinate(coord, current.container.parentContainerId);
  //       if (coord <= capacity) {
  //         container.coordinate = parseInt(coord);
  //       } else {
  //         container.coordinate = null;
  //       }
  //       container.statusId = parentContainer.statusId;
  //       container.temperature = parentContainer.temperature;
  //       container.center = parentContainer.centerId;
  //     }

  //     // if specimen type id is not set yet, this will throw an error
  //     if (specimen.typeId) {
  //       labelParams.push({
  //         barcode: container.barcode,
  //         type: options.specimen.types[specimen.typeId].label,
  //       });
  //     }

  //     specimen.container = container;
  //     list[key] = specimen;

  //     // this is so the global params (sessionId, candidateId, etc.) show errors
  //     // as well.
  //     errors.container = validateContainer(container, key);
  //     errors.specimen = validateSpecimen(specimen, key);

  //     if (!isEmpty(errors.container)) {
  //       errors.list[key] = {container: errors.container};
  //     }
  //     if (!isEmpty(errors.specimen)) {
  //       errors.list[key] = {...errors.list[key], specimen: errors.specimen};
  //     }

  //     if (!isEmpty(errors.list[key])) {
  //       isError = true;
  //     }

  //     return coord;
  //   }, 0);

  //   if (isError) {
  //     return Promise.reject(errors);
  //   }

  //   const printBarcodes = () => {
  //     return new Promise((resolve) => {
  //       if (print) {
  //         swal({
  //           title: 'Print Barcodes?',
  //           type: 'question',
  //           confirmButtonText: 'Yes',
  //           cancelButtonText: 'No',
  //           showCancelButton: true,
  //         })
  //         .then((result) => result.value && printLabel(labelParams))
  //         .then(() => resolve());
  //       } else {
  //         resolve();
  //       }
  //     });
  //   };

  //   return printBarcodes()
  //   .then(() => post(list, specimenAPI, 'POST'))
  //   .then((entities) => {
  //     updateData('containers', entities.containers);
  //     updateData('specimens', entities.specimens);
  //   })
  //   .then(() => Promise.resolve());
  // };

  // const createContainers = (list, current, errors) => {
  //   const availableId = Object.keys(options.container.stati)
  //   .find((key) => options.container.stati[key].label === 'Available');

  //   let isError = false;
  //   Object.entries(list).forEach(([key, container]) => {
  //     container.statusId = availableId;
  //     container.temperature = 20;
  //     container.projectIds = current.projectIds;
  //     container.center = current.center;

  //     errors.container = validateContainer(container, key);
  //     errors.list[key] = validateContainer(container, key);
  //     if (!isEmpty(errors.list[key])) {
  //       isError = true;
  //     }
  //   });

  //   if (isError) {
  //     return Promise.reject(errors);
  //   }

  //   return post(list, containerAPI, 'POST')
  //   .then((containers) => updateData('containers', containers))
  //   .then(() => Promise.resolve());
  // };

  // const createPool = (pool, list) => {
  //   const dispensedId = Object.keys(options.container.stati)
  //   .find((key) => options.container.stati[key].label === 'Dispensed');
  //   const update = Object.values(list)
  //   .reduce((result, item) => {
  //     item.container.statusId = dispensedId;
  //     item.specimen.quantity = '0';
  //     return [...result,
  //             () => updateContainer(item.container, false),
  //             () => updateSpecimen(item.specimen, false),
  //           ];
  //   }, []);

  //   const errors = validatePool(pool);
  //   if (!isEmpty(errors)) {
  //     return Promise.reject(errors);
  //   }

  //   return post(pool, poolAPI, 'POST')
  //   .then((pools) => updateData('pools', pools))
  //   .then(() => Promise.all(update.map((update) => update())));
  // };

  // const saveBatchEdit = (list) => {
  //   const saveList = list
  //   .map((specimen) => () => post(specimen, specimenAPI, 'PUT'));

  //   const errors = validateSpecimen(list[0]);
  //   if (!isEmpty(errors)) {
  //     return Promise.reject(errors);
  //   }

  //   return Promise.all(saveList.map((item) => item()))
  //   .then((data) => Promise.all(data.map((item) => updateData('specimens', item))))
  //   .then(() => swal('Batch Preparation Successful!', '', 'success'));
  // };

  // const validateSpecimen = (specimen, key) => {
  //   const errors = {};

  //   const required = ['typeId', 'quantity', 'unitId', 'candidateId', 'sessionId', 'collection'];
  //   const float = ['quantity'];
  //   const positive = ['quantity', 'fTCycle'];
  //   const integer = ['fTCycle'];

  //   required.map((field) => {
  //     // TODO: seems like for certain cases it needs to be !== null
  //     if (!specimen[field]) {
  //       errors[field] = 'This field is required! ';
  //     }
  //   });

  //   float.map((field) => {
  //     if (isNaN(parseInt(specimen[field])) || !isFinite(specimen[field])) {
  //       errors[field] = 'This field must be a number! ';
  //     }
  //   });

  //   positive.map((field) => {
  //     if (specimen[field] != null && specimen[field] < 0) {
  //       errors[field] = 'This field must not be negative!';
  //     }
  //   });

  //   integer.map((field) => {
  //     if (specimen[field] != null && !/^\+?(0|[1-9]\d*)$/.test(specimen[field])) {
  //       errors[field] = 'This field must be an integer!';
  //     }
  //   });

  //   errors.collection =
  //     validateProcess(
  //       specimen.collection,
  //       options.specimen.protocolAttributes[specimen.collection.protocolId],
  //       ['protocolId', 'examinerId', 'quantity', 'unitId', 'centerId', 'date', 'time'],
  //       ['quantity']
  //     );

  //   // collection should only be set if there are errors associated with it.
  //   if (isEmpty(errors.collection)) {
  //     delete errors.collection;
  //   }

  //   if (specimen.preparation) {
  //     errors.preparation =
  //       validateProcess(
  //         specimen.preparation,
  //         options.specimen.protocolAttributes[specimen.preparation.protocolId],
  //         ['protocolId', 'examinerId', 'centerId', 'date', 'time']
  //       );
  //   }

  //   if (isEmpty(errors.preparation)) {
  //     delete errors.preparation;
  //   }

  //   if (specimen.analysis) {
  //     errors.analysis =
  //       validateProcess(
  //         specimen.analysis,
  //         options.specimen.protocolAttributes[specimen.analysis.protocolId],
  //         ['protocolId', 'examinerId', 'centerId', 'date', 'time']
  //       );
  //   }

  //   if (isEmpty(errors.analysis)) {
  //     delete errors.analysis;
  //   }

  //   return errors;
  // };

  // const validateProcess = (process, attributes, required, number) => {
  //   let errors = {};
  //   let regex;

  //   // validate required fields
  //   required && required.map((field) => {
  //     if (!process[field]) {
  //       errors[field] = 'This field is required! ';
  //     }
  //   });

  //   // validate floats
  //   number && number.map((field) => {
  //     if (isNaN(parseInt(process[field])) || !isFinite(process[field])) {
  //       errors[field] = 'This field must be a number! ';
  //     }
  //   });

  //   // validate date
  //   regex = /^[12]\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
  //   if (regex.test(process.date) === false ) {
  //     errors.date = 'This field must be a valid date! ';
  //   }

  //   // validate time
  //   regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  //   if (regex.test(process.time) === false) {
  //     errors.time = 'This field must be a valid time! ';
  //   }

  //   // validate custom attributes
  //   if (!isEmpty(process.data)) {
  //     errors.data = {};
  //     const datatypes = options.specimen.attributeDatatypes;

  //     const protocolAttributes = options.specimen.protocolAttributes[process.protocolId];
  //     // FIXME: This if statement was introduced because certain processes have
  //     // a data object even though their protocol isn't associated with attributes.
  //     // This is a sign of bad importing/configuration and should be fixed in configuration
  //     // rather than here.
  //     if (protocolAttributes) {
  //       Object.keys(protocolAttributes)
  //         .forEach((attributeId) => {
  //         // validate required
  //         if (protocolAttributes[attributeId].required == 1
  //             && !process.data[attributeId]) {
  //           errors.data[attributeId] = 'This field is required!';
  //         }

  //         // validate number
  //         if (datatypes[attributes[attributeId].datatypeId].datatype === 'number') {
  //           if (isNaN(parseInt(process.data[attributeId])) ||
  //               !isFinite(process.data[attributeId])) {
  //             errors.data[attributeId] = 'This field must be a number!';
  //           }
  //         }

  //         // validate date
  //         if (datatypes[attributes[attributeId].datatypeId].datatype === 'date') {
  //           regex = /^[12]\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
  //           if (regex.test(process.data[attributeId]) === false ) {
  //             errors.data[attributeId] = 'This field must be a valid date! ';
  //           }
  //         }

  //         // validate time
  //         if (datatypes[attributes[attributeId].datatypeId].datatype === 'time') {
  //           regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  //           if (regex.test(process.data[attributeId]) === false) {
  //             errors.data[attributeId] = 'This field must be a valid time! ';
  //           }
  //         }

  //         // TODO: Eventually introduce file validation.
  //       });
  //     }

  //     if (isEmpty(errors.data)) {
  //       delete errors.data;
  //     }
  //   }

  //   // Return Errors
  //   return errors;
  // };

  // const validateContainer = (container, key) => {
  //   const errors = {};

  //   const required = [
  //     'barcode',
  //     'typeId',
  //     'temperature',
  //     'statusId',
  //     'projectIds',
  //     'centerId',
  //   ];

  //   const float = [
  //     'temperature',
  //   ];

  //   required.map((field) => {
  //     if (!container[field]) {
  //       errors[field] = 'This field is required! ';
  //     }
  //   });

  //   float.map((field) => {
  //     if (isNaN(parseInt(container[field])) || !isFinite(container[field])) {
  //       errors[field] = 'This field must be a number! ';
  //     }
  //   });

  //   Object.values(data.containers).map((c) => {
  //     if (container.barcode === c.barcode && container.id !== c.id) {
  //       errors.barcode = 'Barcode must be unique.';
  //     }
  //   });

  //   // TODO: Regex barcode check will eventually go here.
  //   // The regex is not currently in the schema and should be implemented here
  //   // when it is.

  //   return errors;
  // };

  // const validatePool = (pool) => {
  //   let regex;
  //   const errors = {};

  //   const required = ['label', 'quantity', 'unitId', 'date', 'time'];

  //   required.forEach((field) => {
  //     if (!pool[field]) {
  //       errors[field] = 'This field is required! ';
  //     }
  //   });

  //   if (isNaN(parseInt(pool.quantity)) || !isFinite(pool.quantity)) {
  //     errors.quantity = 'This field must be a number! ';
  //   }

  //   // validate date
  //   regex = /^[12]\d{3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
  //   if (regex.test(pool.date) === false ) {
  //     errors.date = 'This field must be a valid date! ';
  //   }

  //   // validate time
  //   regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  //   if (regex.test(pool.time) === false) {
  //     errors.time = 'This field must be a valid time! ';
  //   }

  //   if (pool.specimenIds == null || pool.specimenIds.length < 2) {
  //     errors.total = 'Pooling requires at least 2 specimens';
  //   };

  //   return errors;
  // };

