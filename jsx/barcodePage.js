import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

import {SimplePanel} from 'Panel';
import {ActionButton, List, FlexContainer, FlexItem} from './components';
import Globals from './globals';
import Header from './header';
import ProcessForm from './processForm';
import {ContainerInterface} from './containerDisplay';
import Loader from 'Loader';

import Container, {useContainer} from './Container.js';
import {useSpecimen} from './Specimen';
import {SaveButton} from './components';

function BarcodePage({
  data,
  options,
  edit,
  history,
  container,
  specimen,
  createSpecimens,
  increaseCoordinate,
  printLabel,
}) {
  if (!container) {
    return <Loader/>;
  }

  const contHand = new useContainer(container);
  container = contHand.getContainer();

  // if (!specimen) {
  //   return <Loader/>;
  // }

  const main = specimen ? (
    <>
      <ProcessPanel
        stage='collection'
        specimen={specimen}
        options={options}
      />
      <ProcessPanel
        stage='preparation'
        specimen={specimen}
        options={options}
      />
      <ProcessPanel
        stage='analysis'
        specimen={specimen}
        options={options}
      />
    </>
  ) : (
    <FlexContainer>
      <FlexItem flex={3}>
        <SimplePanel height={70}>
          <ContainerPanel
            history={history}
            data={data}
            container={container}
            contHand={contHand}
            options={options}
          />
        </SimplePanel>
      </FlexItem>
      <FlexItem flex={1}>
        <SimplePanel height={70}>
          <ContainerList
            container={container}
            data={data}
          />
        </SimplePanel>
      </FlexItem>
    </FlexContainer>
  );

  return (
    <>
      <Header
        data={data}
        options={options}
        edit={edit}
        specimen={specimen}
        container={container}
        createSpecimens={createSpecimens}
        increaseCoordinate={increaseCoordinate}
        printLabel={printLabel}
      />
      <FlexContainer>
        <FlexItem flex={1} minWidth={30}>
          <SimplePanel height={70}>
            <Globals
              data={data}
              options={options}
              specimen={specimen}
              container={container}
              contHand={contHand}
            />
          </SimplePanel>
        </FlexItem>
        <FlexItem flex={3}>
          {main}
        </FlexItem>
      </FlexContainer>
    </>
  );
}

function ContainerPanel({
  data,
  options,
  history,
  container,
  contHand,
}) {
  useEffect(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });

  const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  };

  return (
    <div style={style}>
      <ContainerInterface
        data={data}
        options={options}
        history={history}
        container={container}
        contHand={contHand}
      />
    </div>
  );
}

function ContainerList({container, data = {}}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const childContainerIds = container.childContainerIds;

  const drag = (e) => {
    const container = JSON.stringify(data.containers[e.target.id]);
    e.dataTransfer.setData('text/plain', container);
  };

  // TODO: This can DEFINITELY be turned into 1 return!
  const getRow = async (id, i) => {
    const child = data.containers[id];
    if (child.coordinate) {
      const coordinate = await new Container(child).getCoordinateLabel(container.dimension);
      return [
        <Link
          key={i}
          to={`/barcode=${child.barcode}`}
          id={id}
          draggable={true}
          onDragStart={drag}
        >
          {child.barcode}
        </Link>,
        <div>at {coordinate}</div>,
      ];
    } else {
      return [
        <Link
          key={i}
          to={`/barcode=${child.barcode}`}
          id={id}
          draggable={true}
          onDragStart={drag}
        >
          {child.barcode}
        </Link>,
      ];
    }
  };

  const fetchRows = async () => setRows(await Promise.all(childContainerIds.map((id) => getRow(id))));

  useEffect(() => {
    fetchRows().then(() => setLoading(false));
  }, []);

  if (!loris.userHasPermission('biobank_specimen_view')) {
    return;
  }

  if (!childContainerIds.length === 0) {
    return <div className='title'>Empty!</div>;
  }

  const listStyle = {
    fontSize: '18px',
  };

  const content = loading ? <Loader/> : <List rows={rows}/>;

  return <div style={listStyle}>{content}</div>;
}

export function BarcodePathDisplay({container}) {
  const [parentContainers, setParentContainers] = useState([]);

  useEffect(() => {
    container.getParentContainers().then(setParentContainers);
  }, []);

  if (parentContainers.length == 0) {
    return <Loader/>;
  }

  return parentContainers.map((parentContainer, i) => {
    let coordinateDisplay;
    const container = parentContainers[parseInt(i)+1];
    if (container) {
      const coordinate = container.getCoordinateLabel(parentContainers[i].dimension).then((value) => value);
      coordinateDisplay = <b>{'-'+(coordinate || 'UAS')}</b>;
    }
    return (
      <span className='barcodePath' key={i}>
        {i != 0 && ': '}
        <Link to={`/barcode=${parentContainer.barcode}`}>{parentContainer.barcode}</Link>
        {coordinateDisplay}
      </span>
    );
  });
}

function ProcessPanel({
  options,
  stage,
  specimen,
}) {
  const [editable, setEditable] = useState(false);

  const specHand = new useSpecimen(specimen);
  specimen = specHand.getSpecimen();
  const process = specimen[stage];

  if (!process.id) {
    return null;
  }

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
      <div className='panel inactive'>
        <ActionButton onClick={addProcess} icon={'add'}/>
        <div>ADD {stage.toUpperCase()}</div>
      </div>
    );
  }
  const allowEdit = loris.userHasPermission('biobank_specimen_alter') && !editable;
  if (process.id) {
    panel = (
      <SimplePanel
        height={60}
        title={stage.replace(/^\w/, (c) => c.toUpperCase())}
        edit={allowEdit && edit}
      >
        <FormElement>
          <ProcessForm
            options={options}
            stage={stage}
            editable={editable}
            specHand={specHand}
          />
          {editable && <SaveButton onSubmit={specHand.put} onCancel={clear}/>}
        </FormElement>
      </SimplePanel>
    );
  }

  return panel;
}

export default BarcodePage;
