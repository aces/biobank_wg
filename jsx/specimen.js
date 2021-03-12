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
        stage='collection'
        specimen={specimen}
        options={options}
      />
    </>
  );
}
// <ProcessPanel
//   stage='preparation'
//   specimen={specimen}
//   options={options}
// />
// <ProcessPanel
//   stage='analysis'
//   specimen={specimen}
//   options={options}
// />

function Pencil({onClick}) {
  return onClick instanceof Function && (
    <span
      className={'glyphicon glyphicon-pencil'}
      onClick={onClick}
    />
  );
}

function CancelButton({onClick}) {
  return onClick instanceof Function && (
    <a
      className="pull-right"
      style={{cursor: 'pointer'}}
      onClick={onClick}
    >
      Cancel
    </a>
  );
}

function ProcessPanel(props) {
  const {options, stage} = props;
  const [editable, setEditable] = useState(false);

  const specHand = new useSpecimen(props.specimen);
  const specimen = specHand.getSpecimen();
  const process = specimen[stage];

  const edit = () => setEditable(true);
  const clear = () => specHand.clear().then(setEditable(false));

  const protocolExists = Object.values(options.specimen.protocols).find(
    (protocol) => {
      return protocol.typeId == specimen.typeId &&
      options.specimen.processes[protocol.processId].label ==
      stage.replace(/^\w/, (c) => c.toUpperCase());
    }
  );

  let panel = null;
  if (protocolExists &&
      !process &&
      !editable &&
      loris.userHasPermission('biobank_specimen_update')) {
    const addProcess = () => specHand.addProcess(stage);
    panel = (
      <div className='panel specimen-panel inactive'>
        <ActionButton onClick={addProcess} icon={'add'}/>
        <div>ADD {stage.toUpperCase()}</div>
      </div>
    );
  }

  const allowEdit = loris.userHasPermission('biobank_specimen_alter') && !editable;
  if (process.id) {
    panel = (
      <div className='panel specimen-panel panel-default'>
        <div className='panel-heading'>
          <div className={'lifecycle-node '+stage}>
            <div className='letter'>
              {stage.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className='title'>
            {stage.replace(/^\w/, (c) => c.toUpperCase())}
          </div>
          <Pencil onClick={allowEdit && edit}/>
        </div>
        <div className='panel-body'>
          <FormElement>
            <SpecimenProcessForm
              options={options}
              stage={stage}
              editable={editable}
              specHand={specHand}
            />
          </FormElement>
          <CancelButton onClick={editable && clear}/>
        </div>
      </div>
    );
  }

  return panel;
}

export default BiobankSpecimen;
