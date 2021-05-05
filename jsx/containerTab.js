import React, {useContext} from 'react';
import {Link} from 'react-router-dom';

import FilterableDataTable from 'FilterableDataTable';
import Search from './search';
import ContainerForm from './containerForm';
import {mapFormOptions} from './helpers.js';
import {DataContext} from './biobankIndex';

function ContainerTab({
  options,
  loading,
  history,
  createContainers,
}) {
  const data = useContext(DataContext);
  const mapContainerColumns = (column, value) => {
    switch (column) {
      case 'Type':
        return options.container.types[value].label;
      case 'Status':
        return options.container.stati[value].label;
      case 'Projects':
        return value.map((id) => options.projects[id]);
      case 'Parent Barcode':
        return (value && data.containers[value].barcode);
      default:
        return value;
    }
  };

  const formatContainerColumns = (column, value, row) => {
    value = mapContainerColumns(column, value);
    switch (column) {
      case 'Barcode':
        return <Link to={`/barcode=${value}`}>{value}</Link>;
      case 'Status':
        const style = {};
        switch (value) {
          case 'Available':
            style.color = 'green';
            break;
          case 'Reserved':
            style.color = 'orange';
            break;
          case 'Dispensed':
            style.color = 'red';
            break;
          case 'Discarded':
            style.color = 'red';
            break;
        }
        return <div style={style}>{value}</div>;
      case 'Projects':
        return value.join(', ');
      case 'Parent Barcode':
        return <Link to={`/barcode=${value}`}>{value}</Link>;
      default:
        return value;
    }
  };

  const stati = mapFormOptions(
    options.container.stati, 'label'
  );
  const containerTypesNonPrimary = mapFormOptions(
    options.container.typesNonPrimary, 'label'
  );
  const containersNonPrimary = Object.values(data.containers)
    .reduce((result, container) => {
      // TODO: this check is necessary or else the page will go blank when the
      // first specimen is added.
      if (container) {
        if (options.container.types[container.typeId].primary == 0) {
          result[container.id] = container;
        }
        return result;
      }
    }, {});
  const barcodesNonPrimary = mapFormOptions(
    containersNonPrimary, 'barcode'
  );

  const dataArray = Object.values(containersNonPrimary).map(
    (container) => {
      return [
        container.barcode,
        container.typeId,
        container.statusId,
        container.projectIds,
        options.centers[container.centerId],
        container.parentContainerId,
      ];
    }
  );

  const fields = [
    {label: 'Barcode', show: true, filter: {
      name: 'barcode',
      type: 'text',
    }},
    {label: 'Type', show: true, filter: {
      name: 'type',
      type: 'select',
      options: containerTypesNonPrimary,
    }},
    {label: 'Status', show: true, filter: {
      name: 'status',
      type: 'select',
      options: stati,
    }},
    {label: 'Projects', show: true},
    {label: 'Site', show: true, filter: {
      name: 'site',
      type: 'select',
      options: options.centers,
    }},
    {label: 'Parent Barcode', show: true, filter: {
      name: 'parentBarcode',
      type: 'text',
    }},
  ];

  const edit = () => {};
  const openSearchContainer = () => edit('searchContainer');
  const openContainerForm = () => edit('containerForm');
  const actions = [
    {name: 'goToContainer', label: 'Go To Container', action: openSearchContainer},
    {name: 'addContainer', label: 'Add Container', action: openContainerForm},
  ];

  return (
    <div>
      <FilterableDataTable
        name='container'
        data={dataArray}
        fields={fields}
        actions={actions}
        getFormattedCell={formatContainerColumns}
        getMappedCell={mapContainerColumns}
        loading={loading}
      />
      <Search
        title='Go To Container'
        show={editable.searchContainer}
        barcodes={barcodesNonPrimary}
        history={history}
      />
      {loris.userHasPermission('biobank_container_create') ?
      <ContainerForm
        options={options}
        onSubmit={createContainers}
      /> : null}
    </div>
  );
}

export default ContainerTab;
