import React, {useState, useReducer} from 'react';
import {Link} from 'react-router-dom';

import FilterableDataTable from 'FilterableDataTable';
import Modal from 'Modal';

function ShipmentTab(props) {
  const formatShipmentColumns = (column, value, row) => {
    switch (column) {
      case 'Barcode':
        const barcode = <Link to={`/barcode=${value}`}>{value}</Link>;
        return <td>{barcode}</td>;
      default:
        return <td>{value}</td>;
    }
  };

  const {data, options, loading} = props;
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

  return (
    <FilterableDataTable
      name='shipment'
      data={shipmentData}
      fields={fields}
      getFormattedCell={formatShipmentColumns}
      loading={loading}
    >
      <ShipmentForm
        centers={centers}
        data={data}
      />
    </FilterableDataTable>
  );
}

function Shipment(props) {
  this.barcode = props.barcode || '';
  this.destinationCenter = props.destinationCenter || null;
  this.logs = props.logs || {created: {}};
  this.containers = props.containers || [];

  Shipment.prototype.addLog = (status) => {
  };
  Shipment.prototype.validate = () => {
  };
}

function ShipmentForm(props) {
  const status = 'created';
  const reducer = (state, action) => {
    const {name, value} = action;
    return {...state, [name]: value};
  };
  const [shipment, setShipment] = useReducer(reducer, new Shipment({}));
  const setLogs = (value) => setShipment({name: 'logs', value});
  const setLog = (name, value) => {
    setLogs({
      ...shipment.logs,
      [status]: {...shipment.logs[status], [name]: value},
    });
  };
  const setContainers = (value) => setShipment({name: 'containers', value});

  return (
    <Modal
      title='Create Shipment'
      show={true}
      onClose={() => {}}
      onSubmit={() => {}}
      throwWarning={true}
    >
      <FormElement>
        <TextboxElement
          name='barcode'
          label='Barcode'
          onUserInput={(name, value) => setShipment({name, value})}
          value={shipment.barcode}
          required={true}
        />
        <SelectElement
          name='center'
          label='Origin Center'
          onUserInput={setLog}
          value={shipment.logs[status].center}
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
          value={shipment.logs[status].temperature}
          required={true}
        />
        <DateElement
          name='date'
          label='Date'
          onUserInput={setLog}
          value={shipment.logs[status].date}
          required={true}
        />
        <TimeElement
          name='time'
          label='Time'
          onUserInput={setLog}
          value={shipment.logs[status].time}
          required={true}
        />
        <InputList
          name='barcode'
          label="Container"
          items={shipment.containers}
          setItems={setContainers}
          options={props.data.containers}
        />
      </FormElement>
    </Modal>
  );
}

function InputList(props) {
  const {items, setItems, options} = props;
  const [item, setItem] = useState('');

  const removeItem = (index) => setItems(items.filter((item, i) => index != i));
  const addItem = (name, value) => {
    setItem(value);
    // TODO: This won't be necessary when containers are indexed by barcode
    const found = Object.values(options)
      .find((option) => option[name] == value);
    if (found) {
      console.log(value);
      setItems([...items, value]);
      setItem('');
    }
  };

  const itemsDisplay = items.map((item, i) => {
    // I cannot get this to work in the css file.
    const style = {
      color: '#DDDDDD',
      marginLeft: 10,
      cursor: 'pointer',
    };
    return (
      <div key={i} className='preparation-item'>
        <div>{item}</div>
        <div
          className='glyphicon glyphicon-remove'
          onClick={() => removeItem(i)}
          style={style}
        />
      </div>
    );
  });

  return (
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      <div style={{flex: '0.45'}}>
        <h4>{props.label} Input</h4>
        <div className='form-top'/>
        <TextboxElement
          name={props.name}
          onUserInput={addItem}
          value={item}
        />
      </div>
      <div style={{flex: '0.45'}}>
        <h4>{props.label} List</h4>
        <div className='form-top'/>
        <div className='preparation-list'>
          {itemsDisplay}
        </div>
      </div>
    </div>
  );
}

export default ShipmentTab;
