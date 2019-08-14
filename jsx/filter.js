import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import FilterableDataTable from 'FilterableDataTable';
import {Tabs, TabPane} from 'Tabs';
import Modal from 'Modal';

import BiobankSpecimenForm from './specimenForm';
import PoolSpecimenForm from './poolSpecimenForm';
import BatchPreparationForm from './batchPreparationForm';
import BiobankContainerForm from './containerForm';

class BiobankFilter extends Component {
  constructor() {
    super();

    this.mapSpecimenColumns = this.mapSpecimenColumns.bind(this);
    this.formatSpecimenColumns = this.formatSpecimenColumns.bind(this);
    this.mapContainerColumns = this.mapContainerColumns.bind(this);
    this.formatContainerColumns = this.formatContainerColumns.bind(this);
    this.mapPoolColumns = this.mapPoolColumns.bind(this);
    this.formatPoolColumns = this.formatPoolColumns.bind(this);
    this.openSearchSpecimen = this.openSearchSpecimen.bind(this);
    this.openSpecimenForm = this.openSpecimenForm.bind(this);
    this.openPoolForm = this.openPoolForm.bind(this);
    this.openBatchPreparationForm = this.openBatchPreparationForm.bind(this);
    this.openSearchContainer = this.openSearchContainer.bind(this);
    this.openContainerForm = this.openContainerForm.bind(this);
    this.specimenTab = this.specimenTab.bind(this);
    this.containerTab = this.containerTab.bind(this);
    this.poolTab = this.poolTab.bind(this);
    this.renderSpecimenForm = this.renderSpecimenForm.bind(this);
    this.renderPoolForm = this.renderPoolForm.bind(this);
    this.renderBatchPreparationForm = this.renderBatchPreparationForm.bind(this);
    this.renderContainerForm = this.renderContainerForm.bind(this);
    this.renderAliquotForm = this.renderAliquotForm.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    Object.entries(this.props).forEach(([key, val]) =>
      prevProps[key] !== val && console.log(`Prop '${key}' changed`)
    );
  }

  openSearchSpecimen() {
    this.props.edit('searchSpecimen');
  }

  openSpecimenForm() {
    this.props.edit('specimenForm')
    .then(() => this.props.addListItem('specimen'));
  }

  openPoolForm() {
    this.props.edit('poolSpecimenForm');
  }

  openBatchPreparationForm() {
    this.props.edit('batchPreparationForm');
  }

  openSearchContainer() {
    this.props.edit('searchContainer');
  }

  openContainerForm() {
    this.props.edit('containerForm')
    .then(() => this.props.addListItem('container'));
  }

  // TODO: Not a huge fan of this set up, but it seems necessary for the moment
  // to be able to set up the pool aliquot form properly
  openAliquotForm(poolId) {
    this.props.setCurrent('poolId', poolId)
    .then(() => this.props.edit('aliquotForm'))
    .then(() => this.props.addListItem('specimen'));
  }

  mapSpecimenColumns(column, value) {
    switch (column) {
      case 'Type':
        return this.props.options.specimen.types[value].label;
      case 'Container Type':
        return this.props.options.container.typesPrimary[value].label;
      case 'Parent Specimens':
        return value.map((id) => {
          return this.props.data.containers[this.props.data.specimens[id].containerId].barcode;
        });
      case 'PSCID':
        return this.props.options.candidates[value].pscid;
      case 'Status':
        return this.props.options.container.stati[value].label;
      case 'Site':
        return this.props.options.centers[value];
      case 'Projects':
        return value.map((id) => this.props.options.projects[id]);
      default:
        return value;
    }
  }

  formatSpecimenColumns(column, value, row) {
    value = this.mapSpecimenColumns(column, value);
    switch (column) {
      case 'Barcode':
        return <td><Link to={`/barcode=${value}`}>{value}</Link></td>;
      case 'Parent Specimens':
        const barcodes = value && value.map((id, key) => {
          return <Link key={key} to={`/barcode=${value}`}>{value}</Link>;
        }).reduce((prev, curr) => [prev, ', ', curr]);
        return <td>{barcodes}</td>;
      case 'PSCID':
        const pscidURL = loris.BaseURL + '/'
        + Object.values(this.props.options.candidates).find((cand) => cand.pscid == value).id;
        return <td><a href={pscidURL}>{value}</a></td>;
      case 'Visit Label':
        const visitLabelURL = loris.BaseURL+'/instrument_list/?candID='+row['PSCID']+
          '&sessionID='+Object.values(this.props.options.sessions).find((sess) => sess.label == value).id;
        return <td><a href={visitLabelURL}>{value}</a></td>;
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
        return <td style={style}>{value}</td>;
      case 'Projects':
        return <td>{value.join(', ')}</td>;
      case 'Container Barcode':
        return <td><Link to={`/barcode=${value}`}>{value}</Link></td>;
      default:
        return <td>{value}</td>;
     }
  }

  mapContainerColumns(column, value) {
    switch (column) {
      case 'Type':
        return this.props.options.container.types[value].label;
      case 'Status':
        return this.props.options.container.stati[value].label;
      case 'Projects':
        return value.map((id) => this.props.options.projects[id]);
      case 'Site':
        return this.props.options.centers[value];
      case 'Parent Barcode':
        return (value && this.props.data.containers[value].barcode);
      default:
        return value;
    }
  }

  formatContainerColumns(column, value, row) {
    value = this.mapContainerColumns(column, value);
    switch (column) {
      case 'Barcode':
        return <td><Link to={`/barcode=${value}`}>{value}</Link></td>;
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
        return <td style={style}>{value}</td>;
      case 'Projects':
        return <td>{value.join(', ')}</td>;
      case 'Parent Barcode':
        return <td><Link to={`/barcode=${value}`}>{value}</Link></td>;
      default:
        return <td>{value}</td>;
    }
  }

  mapPoolColumns(column, value) {
    switch (column) {
      case 'Pooled Specimens':
        return value.map((id) => {
          return (this.props.data.containers[this.props.data.specimens[id].containerId]||{}).barcode;
        });
      case 'PSCID':
        return this.props.options.candidates[value].pscid;
      case 'Type':
        return this.props.options.specimen.types[value].label;
      case 'Site':
        return this.props.options.centers[value];
      default:
        return value;
    }
  }

  formatPoolColumns(column, value, row) {
    value = this.mapPoolColumns(column, value);
    switch (column) {
      case 'Pooled Specimens':
        const barcodes = value
          .map((barcode, i) => {
            if (loris.userHasPermission('biobank_specimen_view')) {
              return <Link key={i} to={`/barcode=${barcode}`}>{barcode}</Link>;
            }
          })
          .reduce((prev, curr) => [prev, ', ', curr]);
        return <td>{barcodes}</td>;
      case 'PSCID':
        const pscidURL = loris.BaseURL + '/'
        + Object.values(this.props.options.candidates).find((cand) => cand.pscid == value).id;
        return <td><a href={pscidURL}>{value}</a></td>;
      case 'Visit Label':
        const visitLabelURL = loris.BaseURL+'/instrument_list/?candID='+row['PSCID']+
          '&sessionID='+Object.values(this.props.options.sessions).find((sess) => sess.label == value).id;
        return <td><a href={visitLabelURL}>{value}</a></td>;
      case 'Aliquot':
        const onClick = () => this.openAliquotForm(row['ID']);
        return <td><CTA label='Aliquot' onUserInput={onClick}/></td>;
      default:
        return <td>{value}</td>;
    }
  }

  renderSpecimenForm() {
    if (!loris.userHasPermission('biobank_specimen_create')) {
      return;
    };
    return (
      <Modal
        title='Add New Specimen'
        show={this.props.editable.specimenForm}
        onClose={this.props.clearAll}
        onSubmit={this.props.createSpecimens}
        throwWarning={true}
      >
        <FormElement>
          <BiobankSpecimenForm
            options={this.props.options}
            current={this.props.current}
            data={this.props.data}
            errors={this.props.errors}
            mapFormOptions={this.props.mapFormOptions}
            toggleCollapse={this.props.toggleCollapse}
            setCurrent={this.props.setCurrent}
            setListItem={this.props.setListItem}
            addListItem={this.props.addListItem}
            copyListItem={this.props.copyListItem}
            removeListItem={this.props.removeListItem}
          />
        </FormElement>
      </Modal>
    );
  }

  renderPoolForm() {
    if (!loris.userHasPermission('biobank_pool_create')) {
      return;
    }
    return (
      <Modal
        title='Pool Specimens'
        show={this.props.editable.poolSpecimenForm}
        onClose={this.props.clearAll}
        onSubmit={this.props.createPool}
        throwWarning={true}
      >
        <PoolSpecimenForm
          options={this.props.options}
          data={this.props.data}
          errors={this.props.errors}
          current={this.props.current}
          setCurrent={this.props.setCurrent}
          mapFormOptions={this.props.mapFormOptions}
          setPoolList={this.props.setPoolList}
          setPool={this.props.setPool}
          removeListItem={this.props.removeListItem}
        />
      </Modal>
    );
  }

  renderBatchPreparationForm() {
    if (!loris.userHasPermission('biobank_specimen_create')) {
      return;
    }
    return (
      <Modal
        title='Prepare Specimens'
        show={this.props.editable.batchPreparationForm}
        onClose={this.props.clearAll}
        onSubmit={this.props.saveBatchPreparation}
        throwWarning={true}
      >
        <BatchPreparationForm
          options={this.props.options}
          data={this.props.data}
          current={this.props.current}
          errors={this.props.errors}
          setCurrent={this.props.setCurrent}
          mapFormOptions={this.props.mapFormOptions}
          removeListItem={this.props.removeListItem}
        />
      </Modal>
    );
  }

  specimenTab() {
    const barcodesPrimary = Object.values(this.props.data.containers)
      .reduce((result, container) => {
        if (this.props.options.container.types[container.typeId].primary == 1) {
          result[container.id] = container.barcode;
        }
        return result;
      }, {});
    const specimenTypes = this.props.mapFormOptions(
      this.props.options.specimen.types, 'label'
    );
    const containerTypesPrimary = this.props.mapFormOptions(
      this.props.options.container.typesPrimary, 'label'
    );
    const stati = this.props.mapFormOptions(
      this.props.options.container.stati, 'label'
    );
    const pscids = this.props.mapFormOptions(
      this.props.options.candidates, 'pscid'
    );

    const data = Object.values(this.props.data.specimens).map((specimen) => {
      const container = this.props.data.containers[specimen.containerId];
      const parentContainer = this.props.data.containers[container.parentContainerId] || {};

      return [
        container.barcode,
        specimen.typeId,
        container.typeId,
        specimen.quantity+' '+this.props.options.specimen.units[specimen.unitId].label,
        specimen.fTCycle || null,
        specimen.parentSpecimenIds,
        specimen.candidateId,
        this.props.options.sessions[specimen.sessionId].label,
        specimen.poolId ? this.props.data.pools[specimen.poolId].label : null,
        container.statusId,
        container.projectIds,
        container.centerId,
        specimen.collection.date,
        parentContainer.barcode,
      ];
    });

    const fields = [
      {label: 'Barcode', show: true, filter: {
        name: 'barcode',
        type: 'text',
      }},
      {label: 'Type', show: true, filter: {
        name: 'type',
        type: 'select',
        options: specimenTypes,
      }},
      {label: 'Container Type', show: true, filter: {
        name: 'containerType',
        type: 'select',
        options: containerTypesPrimary,
      }},
      {label: 'Quantity', show: true},
      {label: 'F/T Cycle', show: false, filter: {
        name: 'fTCycle',
        type: 'text',
        hide: true,
      }},
      {label: 'Parent Specimen(s)', show: false, filter: {
        name: 'parentSpecimens',
        type: 'text',
        hide: true,
      }},
      {label: 'PSCID', show: true, filter: {
        name: 'pscid',
        type: 'select',
        options: pscids,
      }},
      {label: 'Visit Label', show: true, filter: {
        name: 'session',
        type: 'text',
      }},
      {label: 'Pool', show: false, filter: {
        name: 'pool',
        type: 'text',
        hide: true,
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
        options: this.props.options.centers,
      }},
      {label: 'Date Collected', show: true, filter: {
        name: 'date',
        type: 'date',
      }},
      {label: 'Container Barcode', show: true, filter: {
        name: 'containerBarcode',
        type: 'text',
      }},
    ];

    const actions = [
      {name: 'goToSpecimen', label: 'Go To Specimen', action: this.openSearchSpecimen},
      {name: 'addSpecimen', label: 'Add Specimen', action: this.openSpecimenForm},
      {name: 'poolSpecimen', label: 'Pool Specimens', action: this.openPoolForm},
      {name: 'batchPreparation', label: 'Batch Preparation', action: this.openBatchPreparationForm},
    ];

    return (
      <div>
        <FilterableDataTable
          data={data}
          fields={fields}
          actions={actions}
          getFormattedCell={this.formatSpecimenColumns}
          getMappedCell={this.mapSpecimenColumns}
        />
        <Search
          title='Go To Specimen'
          show={this.props.editable.searchSpecimen}
          clearAll={this.props.clearAll}
          barcodes={barcodesPrimary}
          history={this.props.history}
        />
        {this.renderSpecimenForm()}
        {this.renderPoolForm()}
        {this.renderBatchPreparationForm()}
      </div>
    );
  }

  renderContainerForm() {
    if (!loris.userHasPermission('biobank_container_create')) {
      return;
    }
    const containerTypesNonPrimary = this.props.mapFormOptions(
      this.props.options.container.typesNonPrimary, 'label'
    );
    return (
      <Modal
        title='Add New Container'
        show={this.props.editable.containerForm}
        onClose={this.props.clearAll}
        onSubmit={this.props.createContainers}
        throwWarning={true}
      >
        <FormElement>
          <BiobankContainerForm
            current={this.props.current}
            errors={this.props.errors.list}
            containerTypesNonPrimary={containerTypesNonPrimary}
            options={this.props.options}
            toggleCollapse={this.props.toggleCollapse}
            setCurrent={this.props.setCurrent}
            setListItem={this.props.setListItem}
            addListItem={this.props.addListItem}
            copyListItem={this.props.copyListItem}
            removeListItem={this.props.removeListItem}
          />
        </FormElement>
      </Modal>
    );
  }

  containerTab() {
    const stati = this.props.mapFormOptions(
      this.props.options.container.stati, 'label'
    );
    const containerTypesNonPrimary = this.props.mapFormOptions(
      this.props.options.container.typesNonPrimary, 'label'
    );
    const containersNonPrimary = Object.values(this.props.data.containers)
      .reduce((result, container) => {
        if (this.props.options.container.types[container.typeId].primary == 0) {
          result[container.id] = container;
        }
        return result;
      }, {});
    const barcodesNonPrimary = this.props.mapFormOptions(
      containersNonPrimary, 'barcode'
    );

    const data = Object.values(containersNonPrimary).map(
      (container) => {
        return [
          container.barcode,
          container.typeId,
          container.statusId,
          container.projectIds,
          container.centerId,
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
        options: this.props.options.centers,
      }},
      {label: 'Parent Barcode', show: true, filter: {
        name: 'parentBarcode',
        type: 'text',
      }},
    ];

    const actions = [
      {name: 'goToContainer', label: 'Go To Container', action: this.openSearchContainer},
      {name: 'addContainer', label: 'Add Container', action: this.openContainerForm},
    ];

    return (
      <div>
        <FilterableDataTable
          data={data}
          fields={fields}
          actions={actions}
          getFormattedCell={this.formatContainerColumns}
          getMappedCell={this.mapContainerColumns}
        />
        <Search
          title='Go To Container'
          show={this.props.editable.searchContainer}
          clearAll={this.props.clearAll}
          barcodes={barcodesNonPrimary}
          history={this.props.history}
        />
        {this.renderContainerForm()}
      </div>
    );
  }

  // TODO: This should be fixed. A lot of hacks are being used to initialize
  // this form and there's definitely better ways to be doing it.
  renderAliquotForm() {
    if (!(loris.userHasPermission('biobank_specimen_create') && this.props.current.poolId)) {
      return;
    }
    const specimens = Object.values(this.props.data.specimens).filter(
      (specimen) => specimen.poolId == this.props.current.poolId
    );
    const parents = specimens.map(
      (specimen) => {
        return {specimen: specimen, container: this.props.data.containers[specimen.containerId]};
      }
    );

    return (
      <Modal
        title='Aliquot Pool'
        show={this.props.editable.aliquotForm}
        onClose={this.props.clearAll}
        onSubmit={this.props.createSpecimens}
        throwWarning={true}
      >
        <FormElement>
          <BiobankSpecimenForm
            parent={parents}
            options={this.props.options}
            current={this.props.current}
            errors={this.props.errors}
            data={this.props.data}
            mapFormOptions={this.props.mapFormOptions}
            toggleCollapse={this.props.toggleCollapse}
            setCurrent={this.props.setCurrent}
            setListItem={this.props.setListItem}
            addListItem={this.props.addListItem}
            copyListItem={this.props.copyListItem}
            removeListItem={this.props.removeListItem}
          />
        </FormElement>
      </Modal>
    );
  }

  poolTab() {
    const pscids = this.props.mapFormOptions(
      this.props.options.candidates, 'pscid'
    );
    const specimenTypes = this.props.mapFormOptions(
      this.props.options.specimen.types, 'label'
    );
    const data = Object.values(this.props.data.pools).map((pool) => {
      return [
        pool.id,
        pool.label,
        pool.quantity+' '+this.props.options.specimen.units[pool.unitId].label,
        pool.specimenIds,
        pool.candidateId,
        this.props.options.sessions[pool.sessionId].label,
        pool.typeId,
        pool.centerId,
        pool.date,
        pool.time,
      ];
    });

    const fields = [
      {label: 'ID', show: false},
      {label: 'Label', show: true, filter: {
        name: 'barcode',
        type: 'text',
      }},
      {label: 'Quantity', show: true},
      {label: 'Pooled Specimens', show: true},
      {label: 'PSCID', show: true, filter: {
        name: 'pscid',
        type: 'select',
        options: pscids,
      }},
      {label: 'Visit Label', show: true, filter: {
        name: 'session',
        type: 'text',
      }},
      {label: 'Type', show: true, filter: {
        name: 'type',
        type: 'select',
        options: specimenTypes,
      }},
      {label: 'Site', show: true, filter: {
        name: 'site',
        type: 'select',
        options: this.props.options.centers,
      }},
      {label: 'Date', show: true},
      {label: 'Time', show: true},
      {label: 'Aliquot', show: true},
    ];

    return (
      <div>
        <FilterableDataTable
          data={data}
          fields={fields}
          getFormattedCell={this.formatPoolColumns}
          getMappedCell={this.mapPoolColumns}
        />
        {this.renderAliquotForm()}
      </div>
    );
  }

  render() {
    console.log('render filter');
    const tabs = () => {
      const tabInfo = [];
      const tabList = [];
      if (loris.userHasPermission('biobank_specimen_view')) {
        tabInfo.push({id: 'specimens', content: this.specimenTab});
        tabList.push({id: 'specimens', label: 'Specimens'});
      }
      if (loris.userHasPermission('biobank_container_view')) {
        tabInfo.push({id: 'containers', content: this.containerTab});
        tabList.push({id: 'containers', label: 'Containers'});
      }
      if (loris.userHasPermission('biobank_pool_view')) {
        tabInfo.push({id: 'pools', content: this.poolTab});
        tabList.push({id: 'pools', label: 'Pools'});
      }

      const tabContent = Object.keys(tabInfo).map((key) => {
        return <TabPane key={key} TabId={tabInfo[key].id}>{tabInfo[key].content()}</TabPane>;
      });

      return (
        <Tabs tabs={tabList} defaultTab={tabList[0].id} updateURL={true}>
          {tabContent}
        </Tabs>
      );
    };

    return (
      <div id='biobank-page'>
        {tabs()}
      </div>
    );
  }
}

BiobankFilter.propTypes = {
  filter: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  editable: PropTypes.object.isRequired,
  loadContainer: PropTypes.func.isRequired,
  loadTransfer: PropTypes.func.isRequired,
  updateSpecimenFilter: PropTypes.func.isRequired,
  updateContainerFilter: PropTypes.func.isRequired,
  mapFormOptions: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  clearAll: PropTypes.func.isRequired,
};

BiobankFilter.defaultProps = {
};

class Search extends PureComponent {
  render() {
    console.log('render search');
    const onInput = (name, value) => {
      if (this.props.barcodes[value]) {
        this.props.history.push(`/barcode=${this.props.barcodes[value]}`);
        this.props.clearAll();
      }
    };
    return (
      <Modal
        title={this.props.title}
        show={this.props.show}
        onClose={this.props.clearAll}
        throwWarning={false}
      >
        <FormElement>
          <SearchableDropdown
            name='barcode'
            label='Barcode'
            options={this.props.barcodes}
            onUserInput={onInput}
            placeHolder='Please Scan or Select Barcode'
            autoFocus={true}
          />
        </FormElement>
      </Modal>
    );
  }
}

Search.propTypes = {

};

Search.defaultProps = {

};

export default BiobankFilter;
