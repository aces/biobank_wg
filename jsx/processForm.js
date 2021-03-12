import React from 'react';
import PropTypes from 'prop-types';
import {mapFormOptions, clone} from './helpers.js';
import CustomFields from './customFields';

function SpecimenProcessForm(props) {
  const {stage, options, editable, hideProtocol, specHand} = props;
  const specimen = specHand.getSpecimen();
  const errors = {};
  const process = specimen[stage] || {};
  const typeId = specimen.typeId;

  const setData = (name, value) => {
    const data = clone(process.data);
    if (value instanceof File) {
      // TODO: Figure this out later!
      // data[name] = value.name;
      // const files = clone(current.files);
      // files[value.name] = value;
    } else {
      data[name] = value;
    }
    specHand.setProcess('data', data, stage);
  };

  const setProtocol = (name, value) => {
    specHand.setProcess('data', {}, stage);
    specHand.setProcess(name, value, stage);
  };

  const updateButton = specimen && (
    <ButtonElement
      label="Update"
      onUserInput={specHand.put}
    />
  );

  let specimenProtocols = {};
  let specimenProtocolAttributes = {};
  Object.entries(options.specimen.protocols).forEach(([id, protocol]) => {
    // FIXME: I really don't like 'toLowerCase()' function, but it's the
    // only way I can get it to work at the moment.
    if (typeId == protocol.typeId &&
        options.specimen.processes[protocol.processId].label.toLowerCase() ==
        stage) {
      specimenProtocols[id] = protocol.label;
      specimenProtocolAttributes[id] = options.specimen.protocolAttributes[id];
    }
  });

  const renderProtocolFields = () => {
    if (specimenProtocolAttributes[process.protocolId]) {
      if (process.data) {
        return CustomFields({
          options: options,
          errors: errors.data || {},
          fields: specimenProtocolAttributes[process.protocolId],
          object: process.data,
          setData: setData,
        });
      } else {
        specHand.setProcess('data', {}, stage);
      }
    }
  };

  const specimenTypeUnits = Object.keys(options.specimen.typeUnits[typeId]||{})
  .reduce((result, id) => {
    result[id] = options.specimen.typeUnits[typeId][id].label;
    return result;
  }, {});
  const collectionFields = stage === 'collection' && [
    <TextboxElement
      name="quantity"
      label="Quantity"
      onUserInput={(name, value) => specHand.setProcess(name, value, stage)}
      required={true}
      value={process.quantity}
      errorMessage={errors.quantity}
    />,
    <SelectElement
      name="unitId"
      label="Unit"
      options={specimenTypeUnits}
      onUserInput={(name, value) => specHand.setProcess(name, value, stage)}
      required={true}
      value={process.unitId}
      errorMessage={errors.unitId}
      autoSelect={true}
    />,
  ];

  const protocolField = !hideProtocol && (
    <SelectElement
      name="protocolId"
      label="Protocol"
      options={specimenProtocols}
      onUserInput={setProtocol}
      required={true}
      value={process.protocolId}
      errorMessage={errors.protocolId}
      autoSelect={true}
    />
  );

  const examiners = mapFormOptions(options.examiners, 'label');
  if (typeId && editable === true) {
    return [
      protocolField,
      <SelectElement
        name="examinerId"
        label="Done By"
        options={examiners}
        onUserInput={(name, value) => specHand.setProcess(name, value, stage)}
        required={true}
        value={process.examinerId}
        errorMessage={errors.examinerId}
        autoSelect={true}
      />,
      <DateElement
        name="date"
        label="Date"
        onUserInput={(name, value) => specHand.setProcess(name, value, stage)}
        required={true}
        value={process.date}
        errorMessage={errors.date}
      />,
      <TimeElement
        name="time"
        label="Time"
        onUserInput={(name, value) => specHand.setProcess(name, value, stage)}
        required={true}
        value={process.time}
        errorMessage={errors.time}
      />,
      collectionFields,
      <div className='form-top'/>,
      renderProtocolFields(),
      <TextareaElement
        name="comments"
        label="Comments"
        onUserInput={(name, value) => specHand.setProcess(name, value, stage)}
        value={process.comments}
        errorMessage={errors.comments}
      />,
      updateButton,
    ];
  } else if (editable === false) {
    const protocolStaticFields = process.data &&
      Object.keys(process.data).map((key) => {
        let value = process.data[key];
        if (process.data[key] === true) {
          value = 'Yes';
        } else if (process.data[key] === false) {
          value = 'No';
        }
        // FIXME: The label used to be produced in the following way:
        // label={options.specimen.protocolAttributes[process.protocolId][key].label}
        // However, causes issues when there is data in the data
        // object, but the protocolId is not associated with any attributes.
        // This is a configuration/importing issue that should be fixed.
        return (
          <StaticElement
            key={key}
            label={options.specimen.attributes[key].label}
            text={value}
          />
        );
      });

    const collectionStaticFields = (stage === 'collection') && (
      <StaticElement
        label='Quantity'
        text={process.quantity+' '+options.specimen.units[process.unitId].label}
      />
    );

    return [
      <StaticElement
        label='Protocol'
        text={options.specimen.protocols[process.protocolId].label}
      />,
      <StaticElement
        label='Site'
        text={options.centers[process.centerId]}
      />,
      <StaticElement
        label='Done By'
        text={options.examiners[process.examinerId].label}
      />,
      <StaticElement
        label='Date'
        text={process.date}
      />,
      <StaticElement
        label='Time'
        text={process.time}
      />,
      collectionStaticFields,
      protocolStaticFields,
      <StaticElement
        label='Comments'
        text={process.comments}
      />,
    ];
  }

  return null;
};

SpecimenProcessForm.propTypes = {
  specimen: PropTypes.object.isRequired,
  attributeDatatypes: PropTypes.object.isRequired,
  attributeOptions: PropTypes.object.isRequired,
  specimenTypeUnits: PropTypes.object.isRequired,
  specimenTypeAttributes: PropTypes.object.isRequired,
};

export default SpecimenProcessForm;
