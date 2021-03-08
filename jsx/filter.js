import React from 'react';
import PropTypes from 'prop-types';

import {Tabs, TabPane} from 'Tabs';

import SpecimenTab from './specimenTab';
import ContainerTab from './containerTab';
import PoolTab from './poolTab';
import ShipmentTab from './shipmentTab';

function BiobankFilter(props) {
  const specimenTab = (
    <SpecimenTab
      data={props.data}
      options={props.options}
      saveBatchEdit={props.saveBatchEdit}
      createPool={props.createPool}
      createSpecimens={props.createSpecimens}
      updateSpecimens={props.updateSpecimens}
      editSpecimens={props.editSpecimens}
      history={props.history}
      increaseCoordinate={props.increaseCoordinate}
      loading={props.loading}
    />
  );

  const containerTab = (
    <ContainerTab
      data={props.data}
      options={props.options}
      createContainers={props.createContainers}
      history={props.history}
      loading={props.loading}
    />
  );

  const poolTab = (
    <PoolTab
      data={props.data}
      options={props.options}
      createSpecimens={props.createSpecimens}
      increaseCoordinate={props.increaseCoordinate}
      loading={props.loading}
    />
  );

  const shipmentTab = (
    <ShipmentTab
      options={props.options}
      data={props.data}
    />
  );

  const tabInfo = [];
  const tabList = [];
  if (loris.userHasPermission('biobank_specimen_view')) {
    tabInfo.push({id: 'specimens', content: specimenTab});
    tabList.push({id: 'specimens', label: 'Specimens'});
  }
  if (loris.userHasPermission('biobank_container_view')) {
    tabInfo.push({id: 'containers', content: containerTab});
    tabList.push({id: 'containers', label: 'Containers'});
  }
  if (loris.userHasPermission('biobank_pool_view')) {
    tabInfo.push({id: 'pools', content: poolTab});
    tabList.push({id: 'pools', label: 'Pools'});
  }

  tabInfo.push({id: 'shipments', content: shipmentTab});
  tabList.push({id: 'shipments', label: 'Shipments'});

  const tabContent = Object.keys(tabInfo).map((key) => {
    return (
      <TabPane key={key} TabId={tabInfo[key].id}>
        {tabInfo[key].content}
      </TabPane>
    );
  });

  return (
    <div id='biobank-page'>
      <Tabs tabs={tabList} defaultTab={tabList[0].id} updateURL={true}>
        {tabContent}
      </Tabs>
    </div>
  );
}

BiobankFilter.propTypes = {
  data: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
};

BiobankFilter.defaultProps = {
};

export default BiobankFilter;
