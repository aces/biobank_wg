import React, {useState, useReducer} from 'react';
import {Link} from 'react-router-dom';

import FilterableDataTable from 'FilterableDataTable';
import Shipment from './Shipment';
import TriggerableModal from 'TriggerableModal';

function ShipmentTab(props) {
  const {data, options, loading} = props;

  const formatShipmentColumns = (column, value, row) => {
    switch (column) {
      case 'Barcode':
        const barcode = <Link to={`/barcode=${value}`}>{value}</Link>;
        return <td>{barcode}</td>;
      default:
        return <td>{value}</td>;
    }
  };

  const shipmentData = Object.values(data.shipments).map((shipment) => {
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
  const centers = {};
  Object.values(options.centers).forEach((value) => {
    centers[value] = value;
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
      data={data}
    />
  );

  const forms = [shipmentForm];

  return (
    <FilterableDataTable
      data={shipmentData}
      fields={fields}
      forms={forms}
      getFormattedCell={formatShipmentColumns}
      loading={loading}
    />
  );
}

function ShipmentForm(props) {
  const logIndex = 0;
  const reducer = (shipment, action) => {
    const {name, value} = action;
    return new Shipment({...shipment, [name]: value});
  };
  const [errors, setErrors] = useState({});
  const [shipment, setShipment] = useReducer(reducer, new Shipment({}));
  const setLogs = (value) => setShipment({name: 'logs', value});
  const setLog = (name, value) => {
    setLogs(shipment.logs.map((log, index) => {
      if (index != logIndex) {
        return log;
      }
      return {...log, [name]: value};
    }));
  };
  const setContainers = (value) => setShipment({name: 'containers', value});

  const createShipment = () => {
    const errors = shipment.validate();
    if (errors) {
      setErrors(errors);
    }
    shipment.post();
  };

  return (
    <TriggerableModal
      label='Create Shipment'
      title='Create Shipment'
      onSubmit={createShipment}
    >
      <StaticElement
        label='Note'
        text='This is how to to use this form!'
      />
      <TextboxElement
        name='barcode'
        label='Barcode'
        onUserInput={(name, value) => setShipment({name, value})}
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
        onUserInput={(name, value) => setShipment({name, value})}
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
