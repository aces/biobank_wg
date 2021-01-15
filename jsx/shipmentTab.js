import React from 'react';
import {Link} from 'react-router-dom';

import FilterableDataTable from 'FilterableDataTable';

const ShipmentTab = (props) => {
  const formatShipmentColumns = (column, value, row) => {
    switch (column) {
      case 'Tracking Number':
        const barcode = <Link to={`/barcode=${value}`}>{value}</Link>;
        return <td>{barcode}</td>;
      case 'Origin Center':
        const originCenterURL = loris.BaseURL + '/' + value;
        return <td><a href={originCenterURL}>{value}</a></td>;
      case 'Destination Center':
        const destinationCenterURL = loris.BaseURL + '/' + value;
        return <td><a href={destinationCenterURL}>{value}</a></td>;
      default:
        return <td>{value}</td>;
    }
  };

  console.log(props);
  const {data} = props;
  const shipmentData = Object.values(data.shipments).map((shipment) => {
    return [
      shipment.id,
      shipment.trackingNumber,
      shipment.originCenter,
      shipment.destinationCenter,
    ];
  });

  const fields = [
    {label: 'ID', show: false},
    {label: 'Tracking Number', show: true, filter: {
      name: 'trackingNumber',
      type: 'text',
    }},
    {label: 'Origin Center', show: true},
    {label: 'Destination Center', show: true},
  ];

  return (
    <FilterableDataTable
      name='shipment'
      data={shipmentData}
      fields={fields}
      getFormattedCell={formatShipmentColumns}
      loading={props.loading}
    />
  );
};

export default ShipmentTab;
