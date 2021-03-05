import React, {useState} from 'react';
import SpecimenProcessForm from './processForm';
import {ActionButton} from './barcodePage';

import {useSpecimen} from './Specimen';

/**
 * Biobank Specimen
 *
 * @param {object} props the props!
 * @return {*}
 */
function BiobankSpecimen(props) {
  const {options, specimen} = props;

  return (
    <>
      <ProcessPanel
        process='collection'
        specimen={specimen}
        options={options}
      />
      <ProcessPanel
        process='preparation'
        specimen={specimen}
        options={options}
      />
      <ProcessPanel
        process='analysis'
        specimen={specimen}
        options={options}
      />
    </>
  );
}

function ProcessPanel(props) {
  const {process, options} = props;
  const [editable, setEditable] = useState(false);

  console.log(props.specimen);
  const specHand = new useSpecimen(props.specimen);
  const specimen = specHand.getSpecimen();

  const edit = () => setEditable(true);
  const clear = () => specHand.clear().then(setEditable(false));

  const alterProcess = () => {
    if (loris.userHasPermission('biobank_specimen_alter')) {
      return (
        <span
          className={!editable && 'glyphicon glyphicon-pencil'}
          onClick={editable && edit}
        />
      );
    }
  };

  const cancelAlterProcess = () => {
    if (editable) {
      return (
        <a
          className="pull-right"
          style={{cursor: 'pointer'}}
          onClick={clear}
        >
          Cancel
        </a>
      );
    }
  };

  const protocolExists = Object.values(options.specimen.protocols).find(
    (protocol) => {
      return protocol.typeId == specimen.typeId &&
      options.specimen.processes[protocol.processId].label ==
      process.replace(/^\w/, (c) => c.toUpperCase());
    }
  );

  let panel = null;
  if (protocolExists &&
      !specimen[process] &&
      !editable &&
      loris.userHasPermission('biobank_specimen_update')) {
    const addProcess = () => specHand.addProcess(process);
    panel = (
      <div className='panel specimen-panel inactive'>
        <ActionButton onClick={addProcess} icon={'add'}/>
        <div>ADD {process.toUpperCase()}</div>
      </div>
    );
  }

  const form = (
    <FormElement>
      <SpecimenProcessForm
        specimen={specimen}
        options={options}
        processStage={process}
      />
    </FormElement>
  );

  if (specimen[process] || editable) {
    panel = (
      <div className='panel specimen-panel panel-default'>
        <div className='panel-heading'>
          <div className={'lifecycle-node '+process}>
            <div className='letter'>
              {process.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className='title'>
            {process.replace(/^\w/, (c) => c.toUpperCase())}
          </div>
          {alterProcess()}
        </div>
        <div className='panel-body'>
          {form}
          {cancelAlterProcess()}
        </div>
      </div>
    );
  }

  return panel;
}

export default BiobankSpecimen;
