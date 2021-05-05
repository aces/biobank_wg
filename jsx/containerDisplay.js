import {useState, useContext} from 'react';
import swal from 'sweetalert2';
import {mapFormOptions} from './helpers.js';
import {ActionButton, SaveButton} from './components.js';
import Container from './Container';
import {DispatchContext, DataContext} from './biobankIndex';

// import {BarcodePathDisplay} from './barcodePage';

function ContainerDisplay({
  container,
  modifier = () => ({}),
}) {
  // TODO: Ideally, these should be parsed already.
  const dimension = {};
  Object.keys(container.dimension).forEach((key) => {
    dimension[key] = parseInt(container.dimension[key]);
  });
  const row = Array.from(Array(dimension.y)).map((value, y) => {
    const column = Array.from(Array(dimension.x)).map((value, x) => {
      const coordinate = x+1 + (dimension.x * y);
      const coordinateDisplay = () => {
        if (dimension.xNum == 1 && dimension.yNum == 1) {
          return coordinate;
        } else {
          const xVal = dimension.xNum == 1 ? x+1 : String.fromCharCode(65+x);
          const yVal = dimension.yNum == 1 ? y+1 : String.fromCharCode(65+y);
          return yVal+''+xVal;
        }
      };

      return (
        <Node
          id={coordinate}
          key={x}
          width={(50/dimension.x) - (50/dimension.x * 0.08)}
          {...modifier(coordinate)}
        >
          {coordinateDisplay()}
        </Node>
      );
    });

    const rowHeight = (50/dimension.y) - (50/dimension.y * 0.08);
    return <Row key={y} height={rowHeight}>{column}</Row>;
  });

  return <Display>{row}</Display>;
};

const Display = ({children}) => {
  const style = {
    height: '50em',
    width: '50em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 'auto',
  };
  return <div style={style}>{children}</div>;
};

const Row = ({children, height}) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 'auto',
    width: '100%',
    height: height+'em',
  };
  return <div style={style}>{children}</div>;
};

const Node = ({
  children,
  id,
  width,
  nodeClass = 'node',
  title,
  draggable = 'false',
  onDragStart,
  onDragOver,
  onDrop,
  onClick,
}) => {
  const style = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    background: '#FFFFFF',
    height: '100%',
    width: width+'em',
    zIndex: '2',
    userSelect: 'none',
  };
  const allowDrop = (e) => onDrop instanceof Function && e.preventDefault();
  return (
    <div
      id={id}
      className={nodeClass}
      onClick={onClick}
      draggable={onDragStart instanceof Function}
      onDragStart={onDragStart}
      onDragOver={allowDrop}
      onDrop={onDrop}
      style={style}
    >
      {children}
    </div>
  );
};

// .display .node.checkout {
//   border: 2px solid orange;
// }
// const parentContainers = <Suspense fallBack={[]} callBack={container.getParentContainers}/>;
// const barcodes = mapFormOptions(data.containers, 'barcode');
// console.log(parentContainers);
// delete values that are parents of the container
// parentContainers
//   .forEach((container) => Object.keys(barcodes)
//     .forEach((i) => (container.barcode == barcodes[i]) && delete barcodes[i])
// );

export function ContainerInterface({
  options,
  history,
  container,
  contHand,
}) {
  const dispatch = useContext(DispatchContext);
  const data = useContext(DataContext);
  const childCoords = container.childContainerIds
    .reduce((result, id) => {
      const childContainer = data.containers[id];
      if (childContainer.coordinate) {
        result[childContainer.coordinate] = id;
      }
      return result;
    }, {});

  const redirectURL = (e) => {
    let childCoord = e.target.id;
    let barcode = data.containers[childCoords[childCoord]].barcode;
    history.push(`/barcode=${barcode}`);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const container = new Container(
      JSON.parse(e.dataTransfer.getData('text/plain'))
    );
    const newCoordinate = parseInt(e.target.id);
    container.coordinate = newCoordinate;
    const containers = await container.put();
    dispatch({type: 'update', entity: 'containers', payload: containers});
  };

  const onDragStart = (e) => {
    // $('[data-toggle="tooltip"]').tooltip('hide');
    const container = JSON.stringify(data.containers[childCoords[e.target.id]]);
    e.dataTransfer.setData('text/plain', container);
  };

  const modifier = (childCoord) => {
    if (childCoords[childCoord]) {
      return {
        onClick: redirectURL,
        nodeClass: 'node occupied',
        onDragStart,
      };
    } else {
      return {
        onDrop,
      };
    }
  };

  return <ContainerDisplay container={container} modifier={modifier}/>;
};

// if (select) {
//   if (coordinate == selectedCoordinate) {
//     nodeClass = 'node occupied';
//   } else if (selectedCoordinate instanceof Array &&
//              selectedCoordinate.includes(coordinate)) {
//     nodeClass = 'node occupied';
//   } else if (!coordinates) {
//     nodeClass = 'node available';
//     onClick = (e) => contHand.set('coordinate', e.target.id);
//   } else if (coordinates) {
//     if (!coordinates[coordinate]) {
//       nodeClass = 'node available';
//       onClick = (e) => contHand.set('coordinate', e.target.id);
//     } else if (coordinates[coordinate]) {
//       const childContainer = data.containers[coordinates[coordinate]];
//       const specimen = Object.values(data.specimens)
//         .find((specimen) => specimen.containerId == childContainer.id);
//       let quantity = '';
//       if (specimen) {
//         quantity = `<h5>${specimen.quantity + ' '+options.specimen.units[specimen.unitId].label}</h5>`;
//       }
//     }
//   }
// }

export function ContainerCheckout({container}) {
  const [list, setList] = useState({});
  const [editable, setEditable] = useState(false);

  const checkoutContainers = () => {
    const checkoutPromises = Object.values(list).map((container) => {
      container.parentContainerId = null;
      container.coordinate = null;
      container.put();
    });

    Promise.all(checkoutPromises)
    .then(() => swal('Containers Successfully Checked Out!', '', 'success'));
  };

  if (editable) {
    // TODO: Only children of the current container can be checked out.
    // TODO: This needs to be decoupled.
    let children = {};
    if ((container||{}).childContainerIds) {
      Object.values(data.containers).map((c) => {
        container.childContainerIds.forEach((id) => {
          if (c.id == id) {
            children[id] = c;
          }
        });
      });
    }

    let barcodes = mapFormOptions(children, 'barcode');

    const setCheckoutList = (container) => {
      const newList = {...list, [container.coordinate]: container};
      setList(newList);
    };

    return (
      <div className={editable ? 'open' : 'closed'}>
        <FormElement>
          <StaticElement
            label='Note'
            text="Click, Select or Scan Containers to be Unloaded and Press 'Confirm'"
          />
          <InputList
            name='barcode'
            label='Container'
            items={list}
            setItems={setCheckoutList}
            options={barcodes}
          />
          <SaveButton
            onSubmit={checkoutContainers}
            onCancel={() => setEditable(false)}
          />
        </FormElement>
        <ContainerPanel
          onNodeClick={setCheckoutList}
        />
      </div>
    );
  }

  const CheckoutButton = () => {
    if (!(loris.userHasPermission('biobank_container_update')) ||
        (container.childContainerIds.length == 0)) {
      return;
    }

    return (
      <ActionButton
        title={'Checkout Child Containers'}
        onClick={() => setEditable(true)}
        icon={'share'}
      />
    );
  };

  // TODO: For modifier
  // if (editable.containerCheckout) {
  //   mod.onClick = (e) => {
  //     let container = data.containers[coordinates[e.target.id]];
  //     setCheckoutList(container);
  //   };
  // }

  return <CheckoutButton/>;
};

export function ContainerLoader({
  container,
}) {
  const [editable, setEditable] = useState(false);
  const [sequential, setSequential] = useState(false);

  const increaseCoordinate = (coordinate) => {
    const capacity = dimension.x * dimension.y * dimension.z;
    coordinate++;
    Object.keys(coordinates).forEach((c) => {
      if (coordinate > capacity) {
        // clearAll();
      } else if (c == coordinate) {
        coordinate++;
      }
    });
    setCoordinate(coordinate);
  };

  const loadContainer = () => {
    const barcode = current.barcode;
    const containerId = Object.keys(barcodes)
    .find((id) => barcodes[id] === barcode);

    if (!containerId) {
      return;
    }

    const newContainer = data.containers[containerId];
    newContainer.parentContainerId = container.id;
    newContainer.coordinate = coordinate;

    contHand.put()
    .then(() => {
      if (current.sequential) {
        increaseCoordinate(coordinate);
        setBarcode(null);
      } else {
        // clearAll();
      }
    });

    setPrevCoordinate(newContainer.coordinate);
  };

  if (!editable) {
    return null;
  }

  // TODO: for modifier
  // if (editable.loadContainer) {
  //   mod.onClick = null;
  // }

  return (
    <div className={editable ? 'open' : 'closed'}>
      <FormElement>
        <StaticElement
          label='Note'
          text='Scan Containers to be Loaded. If Sequential is checked,
           the Coordinate will Auto-Increment after each Load.'
        />
        <CheckboxElement
          name='sequential'
          label='Sequential'
          value={sequential}
          onUserInput={(name, value) => setSequential(value)}
        />
        <TextboxElement
          name='barcode'
          label='Barcode'
          onUserInput={(name, value) => setBarcode(value)}
          value={current.barcode}
          placeHolder='Please Scan or Type Barcode'
          autoFocus={true}
        />
        <ButtonElement
          label='Load'
          onUserInput={loadContainer}
        />
        <StaticElement
          text={<a onClick={() => setEditable(false)} style={{cursor: 'pointer'}}>Cancel</a>}
        />
      </FormElement>
    </div>
  );
};

export default ContainerDisplay;
