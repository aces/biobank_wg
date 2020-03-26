import {PureComponent} from 'react';
import SpecimenProcessForm from './processForm';
import {VerticalTabs, TabPane} from 'Tabs';
import Modal from 'Modal';
import Loader from 'Loader';
import {mapFormOptions, clone, isEmpty} from './helpers.js';

import swal from 'sweetalert2';

/**
 * Biobank Batch Edit Specimen Form
 *
 * TODO: DESCRIPTION
 *
 * @author Henri Rabalais
 * @version 1.0.0
 *
 **/
const initialState = {
  specimen: {},
  container: {},
  collection: {},
  preparation: {},
  list: {},
  count: 0,
  current: {},
  errors: {},
  loading: false,
  editable: {global: true},
  show: {collection: false, preparation: false},
};

class BatchEditForm extends React.PureComponent {
  constructor() {
    super();

    this.state = initialState;
    this.setSpecimen = this.setSpecimen.bind(this);
    this.setContainer = this.setContainer.bind(this);
    this.setCurrent = this.setCurrent.bind(this);
    this.setProcess = this.setProcess.bind(this);
    this.validateListItem = this.validateListItem.bind(this);
    this.addListItem = this.addListItem.bind(this);
    this.setPool = this.setPool.bind(this);
  };

  // SHOULD LIKELY GO INTO A HIGHER LEVEL COMPONENT
  addListItem(containerId) {
    let {list, current, collection, preparation, count, show} = clone(this.state);

    // Increase count.
    count++;

    // Set Specimen and Container.
    const container = this.props.data.containers[containerId];
    const specimen = this.props.data.specimens[container.specimenId];

    // Set current global values.
    current.typeId = specimen.typeId;

    // Set list values.
    list[count] = {specimen, container};

    show.collection = Object.keys(list).length > 1 && Object.values(list)
    .every((item, i, listArray) => {
      return item.specimen.collection &&
        item.specimen.collection.protocolId ===
        listArray[0].specimen.collection.protocolId;
    });

    if (show.collection) {
      collection.protocolId = list[Object.keys(list)[0]].specimen.collection.protocolId;
    }

    show.preparation = Object.keys(list).length > 1 && Object.values(list)
    .every((item, i, listArray) => {
      return item.specimen.preparation &&
        item.specimen.preparation.protocolId ===
        listArray[0].specimen.preparation.protocolId;
    });

    if (show.preparation) {
      preparation.protocolId = list[Object.keys(list)[0]].specimen.preparation.protocolId;
    }

    this.setState(
      {list, current, collection, preparation, count, containerId, show},
      this.setState({containerId: null})
    );
  }

  // SHOULD LIKELY GO INTO A HIGHER LEVEL COMPONENT
  removeListItem(key) {
    let {list, current} = clone(this.state);
    delete list[key];
    current = isEmpty(list) ? {} : current;
    const containerId = null;
    this.setState({list, current, containerId});
  }

  setSpecimen(name, value) {
    const specimen = clone(this.state.specimen);
    specimen[name] = value;
    this.setState({specimen});
  }

  setContainer(name, value) {
    const container = clone(this.state.container);
    container[name] = value;
    this.setState({container});
  }

  setCurrent(name, value) {
    const current = clone(this.state.current);
    current[name] = value;
    return new Promise((res) => this.setState({current}, res()));
  }

  setProcess(name, value) {
    this.setState({[name]: value});
  }

  setPool(name, poolId) {
    const pool = clone(this.props.data.pools[poolId]);

    this.setState({loading: true});
    this.setCurrent('poolId', poolId)
    .then(() => Promise.all(pool.specimenIds
      .map((specimenId) => Object.values(this.state.list)
        .find((item) => item.specimen.id === specimenId)
        || this.addListItem(this.props.data.specimens[specimenId].containerId))
      .map((p) => p instanceof Promise ? p : Promise.resolve(p))))
    .then(() => this.setCurrent('poolId', null))
    .then(() => this.setState({loading: false}));
  }

  validateListItem(containerId) {
    const {current, list} = clone(this.state);
    const container = this.props.data.containers[containerId];
    const specimen = this.props.data.specimens[container.specimenId];
    if (!isEmpty(list) &&
      (specimen.typeId !== current.typeId)) {
      swal.fire('Oops!', 'Specimens must be of the same Type and Center', 'warning');
      return Promise.reject();
    }
    return Promise.resolve();
  }

  render() {
    if (this.state.loading) {
      return <Loader/>;
    }

    const {data, options} = this.props;
    const {containerId, poolId, collection, preparation, list, current, errors} = this.state;

    const units = current.typeId ? mapFormOptions(
      options.specimen.typeUnits[current.typeId],
      'label'
    ) : {};
    const stati = mapFormOptions(options.container.stati, 'label');
    const globalForm = current.typeId ? (
      <div>
        <TextboxElement
          name='quantity'
          label='Quantity'
          value={this.state.specimen.quantity}
          errors={errors.quantity}
          onUserInput={this.setSpecimen}
        />
        <SelectElement
          name='unitId'
          label='Unit'
          value={this.state.specimen.unitId}
          options={units}
          errors={errors.unitId}
          onUserInput={this.setSpecimen}
        />
        {options.specimen.types[current.typeId].freezeThaw == 1 ? (
          <NumericElement
            name='fTCycle'
            label='Freeze-Thaw Cycle'
            value={this.state.specimen.fTCycle}
            onUserInput={this.setSpecimen}
            min={0}
          />
        ) : null}
        <SelectElement
          name='statusId'
          label='Status'
          value={this.state.container.statusId}
          options={stati}
          errors={errors.statusId}
          onUserInput={this.setContainer}
        />
        <SelectElement
          name='projectIds'
          label='Project'
          value={this.state.container.projectIds}
          options={options.projects}
          multiple={true}
          errors={errors.projectIds}
          onUserInput={this.setContainer}
        />
      </div>
    ) : null;

    const collectionForm = this.state.editable.collection ? (
      <SpecimenProcessForm
        edit={true}
        errors={errors.collection}
        options={options}
        process={collection}
        processStage='collection'
        setParent={this.setProcess}
        setCurrent={this.setCurrent}
        typeId={current.typeId}
        disabled={{protocolId: true}}
      />
    ) : null;

    const preparationForm = this.state.editable.preparation ? (
      <SpecimenProcessForm
        edit={true}
        errors={errors.preparation}
        options={options}
        process={preparation}
        processStage='preparation'
        setParent={this.setProcess}
        setCurrent={this.setCurrent}
        typeId={current.typeId}
        disabled={{protocolId: true}}
      />
    ) : null;

    // TODO: This should likely be filtered so that only pools that match the
    // proper criteria are left in the list.
    const pools = mapFormOptions(data.pools, 'label');
    const glyphStyle = {
      color: '#DDDDDD',
      marginLeft: 10,
      cursor: 'pointer',
    };

    const barcodeList = Object.entries(list)
      .map(([key, item]) => {
        const handleRemoveItem = () => this.removeListItem(key);
        return (
          <div key={key} className='preparation-item'>
            <div>{item.container.barcode}</div>
            <div
              className='glyphicon glyphicon-remove'
              style={glyphStyle}
              onClick={handleRemoveItem}
            />
          </div>
        );
      });

    const tabList = [{id: 'global', label: 'Global', content: globalForm}];
    if (this.state.show.collection) {
      tabList.push({id: 'collection', label: 'Collection', content: collectionForm});
    }
    if (this.state.show.preparation) {
      tabList.push({id: 'preparation', label: 'Preparation', content: preparationForm});
    }
    const tabContent = tabList
    .map((tab, i) => <TabPane key={i} TabId={tab.id}>{tab.content}</TabPane>);

    const handlePoolInput = (name, value) => value && this.setPool(name, value);

    const handleClose = () => this.setState(initialState, this.props.onClose);
    const handleSubmit = () => {
      const prepList = Object.values(list).map((item) => {
        const specimen = clone(item.specimen);
        const container = clone(item.container);
        if (this.state.editable.global) {
          Object.keys(this.state.specimen).forEach((name) => {
            specimen[name] = this.state.specimen[name];
          });
          Object.keys(this.state.container).forEach((name) => {
            container[name] = this.state.container[name];
          });
        }

        if (this.state.editable.collection) {
          Object.keys(collection).forEach((name) => {
            specimen.collection[name] = collection[name];
          });
        }

        if (this.state.editable.preparation) {
          Object.keys(preparation).forEach((name) => {
            specimen.preparation[name] = preparation[name];
          });
        }
        return {specimen, container};
      });

      this.props.onSubmit(prepList)
      .catch((errors) => this.setState({errors}));
    };

    const editForms = Object.keys(list).length > 1 ? (
      <div className='form-top'>
      <StaticElement
        label='Editing Note'
        text="Select a form for the list to
              edit the specimen values. Any previous value associated
              with a Specimen for a given field will be
              overwritten if one is added on this form."
      />
      <VerticalTabs
        tabs={tabList}
        onTabChange={(id) => this.setState({editable: {[id]: true}})}
        updateURL={false}
      >
        {tabContent}
        <ButtonElement
          label='Update'
          onUserInput={handleSubmit}
        />
      </VerticalTabs>
      </div>
    ) : null;

    return (
      <Modal
        title='Edit Specimens'
        show={this.props.show}
        onClose={handleClose}
        throwWarning={true}
      >
        <FormElement>
          <div className='row'>
            <div className='col-sm-10 col-sm-offset-1'>
              <StaticElement
                label='Editing Note'
                text="Select or Scan the specimens to be edited. Specimens
                      must share the same Type."
              />
              <StaticElement
                label='Specimen Type'
                text={(options.specimen.types[current.typeId]||{}).label || '—'}
              />
              <div className='row'>
                <div className='col-xs-6'>
                  <h4>Barcode Input</h4>
                  <div className='form-top'/>
                  <BarcodeInput
                    data={data}
                    options={options}
                    list={list}
                    containerId={containerId}
                    validateListItem={this.validateListItem}
                    addListItem={this.addListItem}
                  />
                  <SearchableDropdown
                    name={'poolId'}
                    label={'Pool'}
                    onUserInput={handlePoolInput}
                    options={pools}
                    value={poolId}
                  />
                </div>
                <div className='col-xs-6'>
                  <h4>Barcode List</h4>
                  <div className='form-top'/>
                  <div className='preparation-list'>
                    {barcodeList}
                  </div>
                </div>
              </div>
              {editForms}
            </div>
          </div>
        </FormElement>
      </Modal>
    );
  }
}

BatchEditForm.propTypes = {
};

class BarcodeInput extends PureComponent {
  render() {
    const {data, options, list, containerId, addListItem} = this.props;
    // Create options for barcodes based on match typeId
    const barcodesPrimary = Object.values(data.containers)
    .reduce((result, container) => {
      if (options.container.types[container.typeId].primary == 1) {
        const inList = Object.values(list)
        .find((i) => i.container.id == container.id);

        if (!inList) {
          result[container.id] = container.barcode;
        }
      }
      return result;
    }, {});

    const handleInput = (name, containerId) => {
      containerId && this.props.validateListItem(containerId)
      .then(() => addListItem(containerId));
    };
    return (
      <SearchableDropdown
        name={'containerId'}
        label={'Specimen'}
        onUserInput={handleInput}
        options={barcodesPrimary}
        value={containerId}
      />
    );
  }
}

export default BatchEditForm;
