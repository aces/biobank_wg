import React from 'react';
import {Link} from 'react-router-dom';

// import LifeCycle from './lifeCycle.js';
import SpecimenForm from './specimenForm.js';
import {ActionButton} from './barcodePage';

import Container, {useContainer} from './Container.js';
import {BarcodePathDisplay} from './barcodePage.js';

import swal from 'sweetalert2';

function Header(props) {
  const {options, data, clearAll, increaseCoordinate, current} = props;
  const {printLabel} = props;
  const {specimen, setSpecimen, createSpecimens} = props;

  const containerHandler = new useContainer(props.container);
  const container = containerHandler.getContainer();

  const status = options.container.stati[container.statusId].label;
  const renderActionButton = () => {
    if (status == 'Available' &&
        specimen.quantity > 0 &&
        !specimen.poolId) {
      return <ActionButton icon='plus' onClick={openAliquotForm}/>;
    } else {
      return <ActionButton icon='plus' disabled={true}/>;
    }
  };
  const addAliquotForm = () => {
    if (specimen && loris.userHasPermission('biobank_specimen_create')) {
      return (
        <div>
          <div className='action' title='Make Aliquots'>
            {renderActionButton()}
          </div>
          <SpecimenForm
            title='Add Aliquots'
            parent={[{specimen: specimen, container: container}]}
            options={options}
            data={data}
            current={current}
            increaseCoordinate={increaseCoordinate}
            onClose={clearAll}
            setSpecimen={setSpecimen}
            onSubmit={createSpecimens}
          />
        </div>
      );
    }
  };

  const printBarcode = () => {
    const labelParams = [{
      barcode: container.barcode,
      type: options.specimen.types[specimen.typeId].label,
    }];
    printLabel(labelParams)
      .then(() => (swal.fire('Print Barcode Number: ' + container.barcode)));
  };

  return (
    <div className="specimen-header">
      <Link to={`/`}>
        <span className='glyphicon glyphicon-chevron-left'/>
        Return to Filter
      </Link>
      <div className='specimen-title'>
        <div className='barcode'>
          Barcode
          <div className='value'>
            <strong>{container.barcode}</strong>
          </div>
          <span className='barcodePath'>
            <BarcodePathDisplay container={container}/>
          </span>
        </div>
        <ActionButton title={'Print Barcode'} onClick={printBarcode} icon={'print'}/>
        {addAliquotForm()}
        <ContainerCheckout
          container={container}
        />
      </div>
    </div>
  );
}

/**
 * Biobank Container Checkout
 *
 * @param {object} props
 * @return {*}
 **/
function ContainerCheckout({container}) {
  const checkoutContainer = () => {
    container = new Container(container);
    container = container.remove('parentContainerId');
    container = container.remove('coordinate');
    container.put();
  };

  return (loris.userHasPermission('biobank_container_update') &&
    container.parentContainerId) && (
      <ActionButton
        title='Checkout Container'
        onClick={checkoutContainer}
        icon={'share'}
      />
  );
}

export default Header;
