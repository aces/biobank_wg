import {useState} from 'react';

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

export function List({rows = []}) {
  const rowStyle = {display: 'flex', flexDirection: 'row'};

  const row = rows.map((row = [], i) => {
  const valueStyle = {flex: '1', margin: '0 2%'};
    const values = row
      .map((value, i) => <div key={i} style={valueStyle}>{value}</div>);
    return <div key={i} style={rowStyle}>{values}</div>;
  });

  return row;
}

// TODO: might be useful to make some sort of "Centered" component.
export function SaveButton(props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {onSubmit, onSuccess, onCancel} = props;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const submit = async () => {
    setLoading(true);
    await onSubmit();
    setLoading(false);
    setSuccess(true);
    await wait(1000);
    onSuccess();
  };

  let body;
  if (success) {
    body = <h5>Success.</h5>;
  } else if (loading) {
    body = <Saving loading={loading}/>;
  } else {
    body = [
      <div style={{margin: '0 4px'}}>
        <ButtonElement
          label="Save"
          onUserInput={submit}
          columnSize= 'col-xs-11'
        />
      </div>,
      <div style={{margin: '0 4px 15px 4px'}}>
        <a onClick={onCancel} style={{cursor: 'pointer'}}>
          Cancel
        </a>
      </div>,
    ];
  }

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  };

  return (
    <div style={containerStyle}>
      {body}
    </div>
  );
}

export function InlineForm(props) {
  const {children, label, update, link, value, subValue} = props;
  const [editable, setEditable] = useState(false);
  const edit = () => setEditable(true);
  const clear = () => setEditable(false);

  const editButton = update instanceof Function && (
    <ActionButton title={'Update '+label} onClick={edit}/>
  );

  const staticField = (
    <InlineField>
      <Value link={link} value={value}/>
      {subValue}
      {editButton}
    </InlineField>
  );

  const fields = React.Children.map(children, (child) => {
    return (
      <div style={{flex: '1', minWidth: '90px'}}>
        {React.cloneElement(child, {inputClass: 'col-lg-11'})}
      </div>
    );
  });

  const dynamicField = (
    <InlineField>
      {fields}
      <SaveButton onSubmit={update} onSuccess={clear} onCancel={clear}/>
    </InlineField>
  );

  return <>{label}{editable ? dynamicField : staticField}</>;
}

function InlineField({children}) {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 'auto 0',
    flexWrap: 'wrap',
  };
  return <div style={style}>{children}</div>;
}

function Value({value = '—', link}) {
  // XXX: default param not working for some reason
  value = value || '—';
  const style = {
    fontSize: '22px',
    flex: 1,
  };
  const formattedValue = link ? <a href={link}>{value}</a> : value;
  return <div style={style}>{formattedValue}</div>;
}

export function FlexContainer({children}) {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
  };

  return <div style={containerStyle}>{children}</div>;
}

export function FlexItem({children, flex = 1, minWidth}) {
  const itemStyle = {
    flex,
    minWidth,
  };
  return <div style={itemStyle}>{children}</div>;
}

// .lifecycle {
//   flex-basis: 73%;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   margin: 0 auto;
// }
// .lifecycle-graphic {
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }
// .lifecycle-line {
//   background: #A6D3F5;
//   height: 2px;
//   width: 50%;
//   margin: 0px 10px;
//   z-index: 1;
// }
