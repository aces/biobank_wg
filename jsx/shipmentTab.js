import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

import FilterableDataTable from 'FilterableDataTable';
import {useShipment} from './Shipment';
import TriggerableModal from 'TriggerableModal';

import {get} from './helpers.js';

function ShipmentTab(props) {
  // TODO: I think the shipment tab should query it's own data!!! YOLO!!!
  // TODO: Look into Javascript "Sets" for storing Shipment objects.
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

  const createShipment = (shipment) => {
    setShipments({
      ...shipment.post(),
      ...newShipments,
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

  const shipmentForm = (
    <ShipmentForm
      centers={centers}
      users={users}
      data={data}
      createShipment={createShipment}
    />
  );

  const forms = [shipmentForm];

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

  const [shipment, setShipment] = useShipment();
  const setLogs = (value) => setShipment('logs', value);
  const setLog = (name, value) => setLogs(shipment.setLog(name, value, logIndex));
  const setContainers = (value) => setShipment('containers', value);
  const errors = {};

  return (
    <TriggerableModal
      label='Create Shipment'
      title='Create Shipment'
      onSubmit={() => props.createShipment(shipment)}
    >
      <StaticElement
        label='Note'
        text='This is how to to use this form!'
      />
      <TextboxElement
        name='barcode'
        label='Barcode'
        onUserInput={setShipment}
        value={shipment.barcode}
        errorMessage={errors.barcode}
        required={true}
      />
      <SelectElement
        name='center'
        label='Origin Center'
        onUserInput={setLog}
        value={shipment.logs[logIndex].center}
        options={props.centers}
        required={true}
      />
      <SelectElement
        name='destinationCenter'
        label='Destination Center'
        onUserInput={setShipment}
        value={shipment.destinationCenter}
        options={props.centers}
        required={true}
      />
      <TextboxElement
        name='temperature'
        label='Temperature'
        onUserInput={setLog}
        value={shipment.logs[logIndex].temperature}
        required={true}
      />
      <DateElement
        name='date'
        label='Date'
        onUserInput={setLog}
        value={shipment.logs[logIndex].date}
        required={true}
      />
      <TimeElement
        name='time'
        label='Time'
        onUserInput={setLog}
        value={shipment.logs[logIndex].time}
        required={true}
      />
      <SelectElement
        name='user'
        label='Done by'
        onUserInput={setLog}
        value={shipment.logs[logIndex].user}
        options={props.users}
        required={true}
      />
      <InputList
        name='barcode'
        label="Container"
        items={shipment.containers}
        setItems={setContainers}
        options={props.data.containers}
      />
    </TriggerableModal>
  );
}

export default ShipmentTab;
