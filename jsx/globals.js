import React from 'react';
import {Link} from 'react-router-dom';
import {mapFormOptions} from './helpers.js';

import {useContainer} from './Container.js';
import {useSpecimen} from './Specimen.js';
import {InlineForm} from './components';

import {SimplePanel} from 'Panel';
import TriggerableModal from 'TriggerableModal';
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
      update={updateContainerType}
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
      update={specHand.put}
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
      update={options.specimen.types[specimen.typeId].freezeThaw == 1 && specHand.put}
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
      update={!container.parentContainerId && contHand.put}
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
      update={contHand.put}
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
      update={contHand.put}
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
    <SimplePanel>
      <div style={style}>
        {specimenTypeField}
        {containerTypeField}
        {poolField}
        {quantityField}
        {fTCycleField}
        {temperatureField}
        <InlineForm
          label={'Lot Number'}
          update={loris.userHasPermission('biobank_specimen_alter') && contHand.put}
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
          update={loris.userHasPermission('biobank_specimen_alter') && contHand.put}
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
    </SimplePanel>
  );
}

export default Globals;
