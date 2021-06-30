import React from 'react';
import {Link} from 'react-router-dom';
import {mapFormOptions} from './helpers.js';

import {useSpecimen} from './Specimen.js';
import {InlineForm, FlexContainer} from './components';

import TriggerableModal from 'TriggerableModal';
import ContainerParentForm from './containerParentForm';

/**
 * Biobank Globals Component
 *
 * @param {object} props
 * @return {*}
 **/
function Globals({
  current,
  data,
  options,
  container,
  specimen,
  contHand,
}) {
  const cErrors = contHand.getErrors();

  const specHand = new useSpecimen(specimen);
  specimen = specHand.getSpecimen();
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
      cancel={contHand.clear}
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
      cancel={specHand.clear}
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
      cancel={specHand.clear}
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
      cancel={contHand.clear}
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
      cancel={contHand.clear}
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
      cancel={contHand.clear}
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

  const shipmentField = () => {
    if (container.shipmentBarcodes.length !== 0) {
      return (
        <InlineField
          label='Shipment'
          value={container.shipmentBarcodes.slice(-1)[0]}
        />
      );
    }
  };

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
          const barcode = data.containers[container.parentContainerId].barcode;
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
                 contHand={contHand}
                 container={container}
                 options={options}
                 data={data}
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

  return (
    <FlexContainer flow={'column'} justify={'around'} height={70}>
      {specimenTypeField}
      {containerTypeField}
      {poolField}
      {quantityField}
      {fTCycleField}
      {temperatureField}
      <InlineForm
        label={'Lot Number'}
        update={loris.userHasPermission('biobank_specimen_alter') && contHand.put}
        cancel={contHand.clear}
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
        cancel={contHand.clear}
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
      {shipmentField()}
      {parentSpecimenField()}
      {parentContainerField()}
      {candidateSessionField}
    </FlexContainer>
  );
}

export default Globals;
