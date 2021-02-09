import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

import FilterableDataTable from 'FilterableDataTable';
import {useShipment} from './Shipment';
import TriggerableModal from 'TriggerableModal';

import {get} from './helpers.js';

function ShipmentTab(props) {
  const {data, options} = props;
  //   const fetchData = async () => {
  //     const result = await get(`${loris.BaseURL}/biobank/shipments/`);
  //     setShipments(new Map(Object.entries(result)));
  //   };
  const [shipments, setShipments] = useState({});

  // TODO: Look into this for standardization: https://www.robinwieruch.de/react-hooks-fetch-data
  useEffect(() => {
    const fetchData = async () => {
      const result = await get(`${loris.BaseURL}/biobank/shipments/`);
      setShipments(result);
    };
    fetchData();
  }, []);

  const updateShipments = async (shipment) => {
    setShipments({
      ...shipments,
      [shipment.barcode]: shipment,
    });
  };

  const formatShipmentColumns = (column, value, row) => {
    switch (column) {
      case 'Barcode':
        const barcode = <Link to={`/barcode=${value}`}>{value}</Link>;
        return <td>{barcode}</td>;
      default:
        return <td>{value}</td>;
    }
  };

  const shipmentData = Object.values(shipments).map((shipment) => {
    return [
      shipment.id,
      shipment.barcode,
      shipment.status,
      shipment.originCenter,
      shipment.destinationCenter,
      shipment.containers,
    ];
  });

  // TODO: This is temporary until a more global solution is found.
  // TODO: The shipment tab/form should be able to get this information itself honestly.
  const centers = {};
  Object.values(options.centers).forEach((value) => {
    centers[value] = value;
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
    {label: 'Status', show: true, filter: {
      name: 'status',
      type: 'select',
      options: options.shipment.statuses,
    }},
    {label: 'Origin Center', show: true, filter: {
      name: 'originCenter',
      type: 'select',
      options: options.centers,
    }},
    {label: 'Destination Center', show: true, filter: {
      name: 'destinationCenter',
      type: 'select',
      options: centers,
    }},
    {label: 'Containers', show: true},
  ];

  const forms = [
    <ShipmentForm
      centers={centers}
      users={users}
      data={data}
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

function ShipmentForm(props) {
  const logIndex = 0;
  const handler = new useShipment();
  const shipment = handler.getShipment();
  const errors = handler.getErrors();
  const onSubmit = async () => props.updateShipments(await handler.post());

  return (
    <TriggerableModal
      label='Create Shipment'
      title='Create Shipment'
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
      <InputList
        name='barcode'
        label="Container"
        items={shipment.containers}
        setItems={handler.setContainers}
        options={props.data.containers}
        errorMessage={errors.containers}
      />
      <SelectElement
        name='destinationCenter'
        label='Destination Center'
        onUserInput={handler.set}
        value={shipment.destinationCenter}
        options={props.centers}
        errorMessage={errors.destinationCenter}
        required={true}
      />
      <LogForm
        log={shipment.logs[logIndex]}
        setLog={(name, value) => handler.setLog(name, value, logIndex)}
        errors={errors.logs[logIndex] || {}}
        {...props}
      />
    </TriggerableModal>
  );
}

function LogForm(props) {
  const {log, setLog, errors} = props;
  return (
    <>
      <TextboxElement
        name='temperature'
        label='Temperature'
        onUserInput={setLog}
        value={log.temperature}
        required={true}
      />
      <DateElement
        name='date'
        label='Date'
        onUserInput={setLog}
        value={log.date}
        required={true}
      />
      <TimeElement
        name='time'
        label='Time'
        onUserInput={setLog}
        value={log.time}
        required={true}
      />
      <SelectElement
        name='user'
        label='Done by'
        onUserInput={setLog}
        value={log.user}
        options={props.users}
        errorMessage={errors.user}
        required={true}
      />
    </>
  );
}

export default ShipmentTab;
