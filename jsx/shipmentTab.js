import React, {useState, useEffect, useContext} from 'react';
import {Link} from 'react-router-dom';

import FilterableDataTable from 'FilterableDataTable';
import {useShipment} from './Shipment';
// import Container from './Container';
import TriggerableModal from 'TriggerableModal';
import {DataContext} from './biobankIndex';

import {get} from './helpers.js';

// TODO:
// - Datatable isn't updating when new entry is passed!
// - For some reason, receiving the specimen is adding an extra log for creation!

function ShipmentTab({
  options,
}) {
  const [shipments, setShipments] = useState({});

  // TODO: Look into this for standardization: https://www.robinwieruch.de/react-hooks-fetch-data
  useEffect(() => {
    const fetchData = async () => {
      const result = await get(`${loris.BaseURL}/biobank/shipments/`);
      setShipments(result);
    };
    fetchData();
  }, []);

  const updateShipments = (updatedShipments) => {
    updatedShipments.forEach((shipment) => {
      setShipments({
        ...shipments,
        [shipment.barcode]: shipment,
      });
    });
  };

  const formatShipmentColumns = (column, value, row) => {
    switch (column) {
      case 'Barcode':
        return <Link to={`/barcode=${value}`}>{value}</Link>;
      case 'Actions':
        if (row['Status'] === 'received') {
          return;
        }
        return (
          <ReceiveShipment
            shipment={shipments[row['Barcode']]}
            users={users}
            updateShipments={updateShipments}
          />
        );
      default:
        return value;
    }
  };

  const shipmentData = Object.values(shipments).map((shipment) => {
    return [
      shipment.id,
      shipment.barcode,
      shipment.type,
      shipment.status,
      options.centers[shipment.originCenterId],
      options.centers[shipment.destinationCenterId],
    ];
  });

  const users = {};
  // TODO: There has to be a better way to query this!!!
  Object.values(options.users).forEach((user) => {
    users[user.label] = user.label;
  });

  const fields = [
    {label: 'ID', show: false},
    {label: 'Barcode', show: true, filter: {
      name: 'barcode',
      type: 'text',
    }},
    {label: 'Type', show: true, filter: {
      name: 'type',
      type: 'select',
      options: options.shipment.types,
    }},
    {label: 'Status', show: true, filter: {
      name: 'status',
      type: 'select',
      options: options.shipment.statuses,
    }},
    {label: 'Origin Center', show: true, filter: {
      name: 'originCenterId',
      type: 'select',
      options: options.centers,
    }},
    {label: 'Destination Center', show: true, filter: {
      name: 'destinationCenterId',
      type: 'select',
      options: options.centers,
    }},
    {label: 'Actions', show: true},
  ];

  const forms = [
    <CreateShipment
      centers={options.centers}
      types={options.shipment.types}
      users={users}
      updateShipments={updateShipments}
    />,
  ];

  return (
    <FilterableDataTable
      data={shipmentData}
      fields={fields}
      forms={forms}
      getFormattedCell={formatShipmentColumns}
    />
  );
}

function CreateShipment({
  centers,
  types,
  users,
  updateShipments,
}) {
  const logIndex = 0;
  const data = useContext(DataContext);
  const handler = new useShipment();
  const shipment = handler.getShipment();
  const errors = handler.getErrors();
  const onSubmit = async () => await handler.post();
  // updateShipments(shipments);
  const onOpen = () => {
    handler.addLog({status: 'created'});
  };

  // If the associated shipments containers change, update the site of the log.
  useEffect(() => {
    if (shipment.containerIds.length === 1) {
      const container = data.containers[shipment.containerIds[0]];
      handler.setLog('centerId', container.centerId, logIndex);
    }
  }, [shipment.containerIds]);

  return (
    <TriggerableModal
      label='Create Shipment'
      title='Create Shipment'
      onUserInput={onOpen}
      onSubmit={onSubmit}
      onClose={handler.clear}
    >
      <StaticElement
        label='Note'
        text='This is how to to use this form!'
      />
      <TextboxElement
        name='barcode'
        label='Barcode'
        onUserInput={handler.set}
        value={shipment.barcode}
        errorMessage={errors.barcode}
        required={true}
      />
      <SelectElement
        name='type'
        label='Container Type'
        onUserInput={handler.set}
        value={shipment.type}
        options={types}
        errorMessage={errors.type}
        required={true}
      />
      <InputList
        name='barcode'
        label="Container"
        items={shipment.containerIds}
        setItems={handler.setContainerIds}
        options={data.containers}
        errorMessage={errors.containerIds}
      />
      <SelectElement
        name='destinationCenterId'
        label='Destination Center'
        onUserInput={handler.set}
        value={shipment.destinationCenterId}
        options={centers}
        errorMessage={errors.destinationCenterId}
        required={true}
      />
      <ShipmentLogForm
        log={shipment.logs[logIndex]}
        setLog={(name, value) => handler.setLog(name, value, logIndex)}
        errors={errors.logs[logIndex]}
        users={users}
      />
    </TriggerableModal>
  );
}

function ReceiveShipment({
  shipment,
  users,
  updateShipments,
}) {
  const handler = new useShipment(shipment);
  // const data = useContext(DataContext);
  const logIndex = handler.getShipment().logs.length-1;
  const onSubmit = async () => {
    const shipments = await handler.post();
    updateShipments(shipments[0]);
    // return await Promise.all(shipment.containerIds.map((containerId) => {
    //   const container = new Container(data.containers[containerId]);
    //   container.centerId = shipment.destinationCenterId;
    //   return container.put();
    // }));
  };
  const onOpen = () => {
    handler.addLog({status: 'received', centerId: shipment.destinationCenterId});
  };

  // TODO: At the top of this form, it wouldn't hurt to have a ShipmentSummary
  // to display the pertinent information from the shipment!
  return (
    <TriggerableModal
      label='Receive Shipment'
      title='Receive Shipment'
      onUserInput={onOpen}
      onSubmit={onSubmit}
      onClose={handler.clear}
    >
      <StaticElement
        label='Barcode'
        text={handler.getShipment().barcode}
      />
      <StaticElement
        label='Origin Center'
        text={handler.getShipment().logs[0].centerId}
      />
      <ShipmentLogForm
        log={handler.getShipment().logs[logIndex]}
        setLog={(name, value) => handler.setLog(name, value, logIndex)}
        errors={handler.getErrors().logs[logIndex]}
        users={users}
      />
    </TriggerableModal>
  );
};

function ShipmentLogForm({
  log,
  setLog,
  errors = {},
  users,
}) {
  return (
    <>
      <TextboxElement
        name='temperature'
        label='Temperature'
        onUserInput={setLog}
        value={log.temperature}
        errorMessage={errors.temperature}
        required={true}
      />
      <DateElement
        name='date'
        label='Date'
        onUserInput={setLog}
        value={log.date}
        errorMessage={errors.date}
        required={true}
      />
      <TimeElement
        name='time'
        label='Time'
        onUserInput={setLog}
        value={log.time}
        errorMessage={errors.time}
        required={true}
      />
      <SelectElement
        name='user'
        label='Done by'
        onUserInput={setLog}
        value={log.user}
        options={users}
        errorMessage={errors.user}
        required={true}
      />
    </>
  );
}

export default ShipmentTab;
