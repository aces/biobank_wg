import React from 'react';
import {mapFormOptions} from './helpers.js';

function ProcessForm(props) {
  const {stage, options, editable, hideProtocol, specHand} = props;
  const specimen = specHand.getSpecimen();
  const errors = {};
  const process = specimen[stage] || {};
  const typeId = specimen.typeId;

  const setProcess = (name, value) => specHand.setProcess(name, value, stage);
  const setData = (name, value) => specHand.setData(name, value, stage);

  let specimenProtocols = {};
  let specimenProtocolAttributes = {};
  Object.entries(options.specimen.protocols).forEach(([id, protocol]) => {
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
          errors: errors.data,
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
      onUserInput={setProcess}
      required={true}
      value={process.quantity}
      errorMessage={errors.quantity}
    />,
    <SelectElement
      name="unitId"
      label="Unit"
      options={specimenTypeUnits}
      onUserInput={setProcess}
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
      onUserInput={setProcess}
      required={true}
      value={process.protocolId}
      errorMessage={errors.protocolId}
      autoSelect={true}
    />
  );

  const examiners = mapFormOptions(options.examiners, 'label');
  if (typeId && editable) {
    return [
      protocolField,
      <SelectElement
        name="examinerId"
        label="Done By"
        options={examiners}
        onUserInput={setProcess}
        required={true}
        value={process.examinerId}
        errorMessage={errors.examinerId}
        autoSelect={true}
      />,
      <DateElement
        name="date"
        label="Date"
        onUserInput={setProcess}
        required={true}
        value={process.date}
        errorMessage={errors.date}
      />,
      <TimeElement
        name="time"
        label="Time"
        onUserInput={setProcess}
        required={true}
        value={process.time}
        errorMessage={errors.time}
      />,
      collectionFields,
      <HorizontalRule/>,
      renderProtocolFields(),
      <TextareaElement
        name="comments"
        label="Comments"
        onUserInput={setProcess}
        value={process.comments}
        errorMessage={errors.comments}
      />,
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

function CustomFields(props) {
  const {options, errors = {}, fields, object, setData} = props;

  return Object.keys(fields).map((attribute, key) => {
    const datatype = options.specimen.attributeDatatypes[fields[attribute]['datatypeId']].datatype;
    const passedProps = {
      name: attribute,
      label: fields[attribute].label,
      onUserInput: setData,
      required: fields[attribute].required,
      value: object[attribute],
      errorMessage: errors[attribute],
    };
    switch (datatype) {
      case 'text':
      case 'number':
        return <TextboxElement {...passedProps}/>;
      case 'date':
        return <DateElement {...passedProps}/>;
      case 'time':
        return <TimeElement {...passedProps}/>;
      case 'boolean':
        return <CheckboxElement {...passedProps}/>;
    };

    // TODO: add this again later.
    // Do not present the possibility of uploading if file is already set
    // File must instead be deleted or overwritten.
    // case (datatype === 'file' && !(data||{})[attribute]):
    //   return <FileElement {...passedProps} />;
    // }
  });
}

export default ProcessForm;
