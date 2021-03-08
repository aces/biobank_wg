import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

import {Panels} from 'Panel';
import Globals from './globals';
import Header from './header';
import BiobankSpecimen from './specimen';
import ContainerDisplay from './containerDisplay';
import Loader from 'Loader';

import Container from './Container.js';

function BarcodePage(props) {
  const {data, options, edit, history} = props;
  const {specimen} = props;

  if (!props.container) {
    return <Loader/>;
  }

  if (!specimen) {
    return <Loader/>;
  }

  const container = new Container(props.container);
  console.log(specimen);

  const renderMain = specimen ? (
    <Panels height={700} grow={[1, 2]}>
      <Globals
        data={data}
        options={options}
        specimen={specimen}
        container={container}
      />
      <BiobankSpecimen
        specimen={specimen}
        options={options}
      />
    </Panels>
  ) : (
    <Panels height={700} grow={[1, 2, 1]}>
      <Globals
        data={data}
        options={options}
        specimen={specimen}
        container={container}
      />
      <ContainerDisplay
        history={history}
        data={data}
        container={container}
        options={options}
      />
      <ContainerList
        container={container}
        data={data}
      />
    </Panels>
  );

  return (
    <>
      <Header
        data={data}
        options={options}
        edit={edit}
        specimen={specimen}
        container={container}
        createSpecimens={props.createSpecimens}
        increaseCoordinate={props.increaseCoordinate}
        printLabel={props.printLabel}
      />
      {renderMain}
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
    height: '100%',
    overflowY: 'auto',
  };

  const content = loading ? <Loader/> : <List rows={rows}/>;

  return <div style={listStyle}>{content}</div>;
}

function List({rows = []}) {
  const rowStyle = {display: 'flex', flexDirection: 'row'};

  const row = rows.map((row = [], i) => {
  const valueStyle = {flex: '1', margin: '0 2%'};
    const values = row
      .map((value, i) => <div key={i} style={valueStyle}>{value}</div>);
    return <div key={i} style={rowStyle}>{values}</div>;
  });

  return row;
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

export function ActionButton({title, onClick, icon = 'chevron-right'}) {
  const [hover, setHover] = useState(false);
  const hoverOn = () => setHover(true);
  const hoverOff = () => setHover(false);

  const style = {
    color: hover ? '#FFFFFF' : '#DDDDDD',
    borderRadius: '50%',
    height: '45px',
    width: '45px',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: hover ? '#093782' : '#FFFFFF',
    border: hover ? 'none' : '2px solid #DDDDDD',
    boxShadow: hover && '0 6px 10px 0 rgba(0, 0, 0, 0.2), 0 8px 22px 0 rgba(0, 0, 0, 0.19)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const glyphStyle = {
    fontSize: '20px',
    top: 0,
  };

  return (
    <span
      title={title}
      style={style}
      onClick={onClick}
      onMouseOver={hoverOn}
      onMouseOut={hoverOff}
    >
      <span style={glyphStyle} className={'glyphicon glyphicon-'+icon}/>
    </span>
  );
}

export default BarcodePage;
