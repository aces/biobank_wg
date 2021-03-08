import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {mapFormOptions} from './helpers.js';

import {useContainer} from './Container.js';
import {useSpecimen} from './Specimen.js';
import {ActionButton} from './barcodePage';

import TriggerableModal from 'TriggerableModal';
import {Saving} from 'Loader';
import ContainerParentForm from './containerParentForm';

/**
 * Biobank Globals Component
 *
 * @param {object} props
 * @return {*}
 **/
function Globals(props) {
  const {current, data, options} = props;

  const contHand = new useContainer(props.container);
  const container = contHand.getContainer();
  const cErrors = contHand.getErrors();

  const specHand = new useSpecimen(props.specimen);
  const specimen = specHand.getSpecimen();
  const sErrors = specHand.getErrors();

  const specimenTypeField = specimen.typeId && (
    <InlineForm
      label='Specimen Type'
      value={options.specimen.types[specimen.typeId].label}
    />
  );

  const updateContainerType = loris.userHasPermission('biobank_specimen_alter') && specimen.id && contHand.put;
  const containerTypes = mapFormOptions(options.container.typesPrimary, 'label');
  const containerTypeField = (
    <InlineForm
      label={'Container Type'}
      updateValue={updateContainerType}
      value={options.container.types[container.typeId].label}
    >
      <SelectElement
        name='typeId'
        onUserInput={contHand.set}
        options={containerTypes}
        value={container.typeId}
        errorMessage={cErrors.typeId}
      />
    </InlineForm>
  );

  const poolField = specimen.poolId && (
    <InlineForm
      label='Pool'
      value={data.pools[specimen.poolId].label}
    />
  );

  const units = specimen.quantity && mapFormOptions(
    options.specimen.typeUnits[specimen.typeId], 'label'
  );
  const quantityField = specimen.quantity && (
    <InlineForm
      label='Quantity'
      updateValue={specHand.put}
      value={Math.round(specimen.quantity * 100) / 100+
      ' '+(options.specimen.units[specimen.unitId]||{}).label}
    >
      <TextboxElement
        name='quantity'
        onUserInput={specHand.set}
        value={specimen.quantity}
        errorMessage={sErrors.quantity}
      />
      <SelectElement
        name='unitId'
        options={units}
        onUserInput={specHand.set}
        value={specimen.unitId}
        errorMessage={sErrors.unitId}
      />
    </InlineForm>
  );

  const fTCycleField = specimen.fTCycle && (
    <InlineForm
      label={'Freeze-Thaw Cycle'}
      updateValue={options.specimen.types[specimen.typeId].freezeThaw == 1 && specHand.put}
      value={specimen.fTCycle || 0}
    >
      <NumericElement
        name='fTCycle'
        onUserInput={specHand.set}
        value={specimen.fTCycle}
        errorMessage={sErrors.fTCycle}
      />
    </InlineForm>
  );

  const temperatureField = (
    <InlineForm
      label={'Temperature'}
      updateValue={!container.parentContainerId && contHand.put}
      value={container.temperature + '°'}
    >
      <TextboxElement
        name='temperature'
        onUserInput={contHand.set}
        value={container.temperature}
        errorMessage={cErrors.temperature}
      />
    </InlineForm>
  );

  const stati = mapFormOptions(options.container.stati, 'label');
  const statusField = (
    <InlineForm
      label={'Status'}
      updateValue={contHand.put}
      value={options.container.stati[container.statusId].label}
      subValue={container.comments}
    >
      <SelectElement
        name='statusId'
        options={stati}
        onUserInput={contHand.set}
        value={container.statusId}
        errorMessage={cErrors.statusId}
      />
    </InlineForm>
  );

  const projectField = (
    <InlineForm
      label='Projects'
      updateValue={contHand.put}
      value={container.projectIds.length !== 0 ?
       container.projectIds
         .map((id) => options.projects[id])
         .join(', ') : 'None'}
    >
      <SelectElement
        name='projectIds'
        options={options.projects}
        onUserInput={contHand.set}
        multiple={true}
        emptyOption={false}
        value={container.projectIds}
        errorMessage={cErrors.projectIds}
      />
    </InlineForm>
  );

  const centerField = (
    <InlineForm
      label='Site'
      value={options.centers[container.centerId]}
    />
  );

  const parentSpecimenField = () => {
    if (specimen.parentSpecimenIds.length > 0) {
      const parentSpecimenBarcodes = Object.values(specimen.parentSpecimenIds)
      .map((id) => {
        const barcode = data.containers[data.specimens[id].containerId].barcode;
        return <Link to={`/barcode=${barcode}`}>{barcode}</Link>;
      })
      .reduce((prev, curr) => [prev, ', ', curr]);

      return (
        <InlineForm
          label={'Parent Specimen'}
          value={parentSpecimenBarcodes || 'None'}
        />
      );
    }
  };

  const parentContainerField = () => {
    if (loris.userHasPermission('biobank_container_view')) {
      // Set Parent Container Barcode Value if it exists
      const parentContainerBarcodeValue = () => {
        if (container.parentContainerId) {
          const barcode = data.containers[
                          container.parentContainerId
                        ].barcode;
          return <Link to={`/barcode=${barcode}`}>{barcode}</Link>;
        }
      };

      const updateParentContainer = () => {
        if (loris.userHasPermission('biobank_container_update')) {
          return (
             <TriggerableModal
               title='Update Parent Container'
               label='Move Container'
               onSubmit={contHand.put}
             >
               <ContainerParentForm
                 display={true}
                 current={current}
                 container={container}
                 options={options}
                 data={data}
                 setContainer={contHand.set}
               />
             </TriggerableModal>
          );
        }
      };

      let coordinate;
      if (container.coordinate) {
        coordinate = container.getCoordinateLabel();
      }

      return (
        <div className="item">
          <div className='field'>
            Parent Container
            <div className='value'>
              {parentContainerBarcodeValue() || 'None'}
            </div>
            {(parentContainerBarcodeValue && container.coordinate) ?
            'Coordinate '+ coordinate : null}
          </div>
          {updateParentContainer()}
        </div>
      );
    }
  };

  const candidateSessionField = specimen.candidateId && (
    <>
      <InlineForm
        label='PSCID'
        value={options.candidates[specimen.candidateId].pscid}
        link={loris.BaseURL+'/'+specimen.candidateId}
      />
      <InlineForm
        label='Visit Label'
        value={options.sessions[specimen.sessionId].label}
        link={
            loris.BaseURL+'/instrument_list/?candID='+
            specimen.candidateId+'&sessionID='+
            specimen.sessionId
        }
      />
    </>
  );

  const style = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={style}>
      {specimenTypeField}
      {containerTypeField}
      {poolField}
      {quantityField}
      {fTCycleField}
      {temperatureField}
      <InlineForm
        label={'Lot Number'}
        updateValue={loris.userHasPermission('biobank_specimen_alter') && contHand.put}
        value={container.lotNumber}
      >
        <TextboxElement
          name='lotNumber'
          onUserInput={contHand.set}
          value={container.lotNumber}
          errorMessage={cErrors.lotNumber}
        />
      </InlineForm>
      <InlineForm
        label={'Expiration Date'}
        updateValue={loris.userHasPermission('biobank_specimen_alter') && contHand.put}
        value={container.expirationDate}
      >
        <DateElement
          name='expirationDate'
          onUserInput={contHand.set}
          value={container.expirationDate}
          errorMessage={cErrors.expirationDate}
          today={false}
        />
      </InlineForm>
      {statusField}
      {projectField}
      {centerField}
      {parentSpecimenField()}
      {parentContainerField()}
      {candidateSessionField}
    </div>
  );
}

function InlineForm(props) {
  const {children, label, updateValue, link, value, subValue} = props;
  const [loading, setLoading] = useState(false);
  const [editable, setEditable] = useState(false);

  const update = async () => {
    setLoading(true);
    await updateValue();
    setEditable(false);
    setLoading(false);
  };

  const submitButton = !loading ? (
    <>
      <div style={{margin: '0 1%'}}>
        <ButtonElement
          label="Update"
          onUserInput={update}
          columnSize= 'col-xs-11'
        />
      </div>
      <div style={{margin: '0 1%'}}>
        <a onClick={()=>setEditable(false)} style={{cursor: 'pointer'}}>
          Cancel
        </a>
      </div>
    </>
  ) : <Saving loading={loading}/>;

  const editButton = updateValue instanceof Function && (
    <div><ActionButton title={'Update '+label} onClick={() => setEditable(true)}/></div>
  );

  const staticField = (
    <InlineField>
      <Value link={link} value={value}/>
      {subValue}
      {editButton}
    </InlineField>
  );

  const fields = React.Children.map(children, (child) => {
    return (
      <div style={{flex: '1', minWidth: '90px'}}>
        {React.cloneElement(child, {inputClass: 'col-lg-11'})}
      </div>
    );
  });

  const dynamicField = (
    <InlineField>
      {fields}
      {submitButton}
    </InlineField>
  );

  return <>{label}{editable ? dynamicField : staticField}</>;
}

function InlineField({children}) {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 'auto 0',
    flexWrap: 'wrap',
  };
  return <div style={style}>{children}</div>;
}

function Value({value = '—', link}) {
  // XXX: default param not working for some reason
  value = value || '—';
  const style = {
    fontSize: '22px',
    flex: 1,
  };
  const formattedValue = link ? <a href={link}>{value}</a> : value;
  return <div style={style}>{formattedValue}</div>;
}

export default Globals;
