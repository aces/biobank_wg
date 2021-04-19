import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

import {SimplePanel} from 'Panel';
import {ActionButton, List, FlexContainer, FlexItem} from './components';
import Globals from './globals';
import Header from './header';
import ProcessForm from './processForm';
import ContainerDisplay from './containerDisplay';
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
        <SimplePanel>
          <ContainerDisplay
            history={history}
            data={data}
            container={container}
            options={options}
          />
        </SimplePanel>
      </FlexItem>
      <FlexItem flex={1}>
        <SimplePanel>
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
      <FlexContainer height={70}>
        <FlexItem flex={1} minWidth={30}>
          <SimplePanel>
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

function ContainerList({container, data = {}}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const childContainerIds = container.childContainerIds;

  const getRow = async (id, i) => {
    const child = data.containers[id];
    if (child.coordinate) {
      const coordinate = await new Container(child).getCoordinateLabel(container.dimension);
      return [
        <Link key={i} to={`/barcode=${child.barcode}`}>{child.barcode}</Link>,
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

  const drag = (e) => {
    const container = JSON.stringify(data.containers[e.target.id]);
    e.dataTransfer.setData('text/plain', container);
  };

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
      <span className='barcodePath'>
        {i != 0 && ': '}
        <Link key={i} to={`/barcode=${parentContainer.barcode}`}>{parentContainer.barcode}</Link>
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
        flex={1}
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
