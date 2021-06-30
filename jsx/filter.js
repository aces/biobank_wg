import React from 'react';
import PropTypes from 'prop-types';

import {Tabs, TabPane} from 'Tabs';

import SpecimenTab from './specimenTab';
import ContainerTab from './containerTab';
import PoolTab from './poolTab';
import ShipmentTab from './shipmentTab';

function BiobankFilter({
  data,
  options,
  saveBatchEdit,
  createPool,
  createSpecimens,
  updateSpecimens,
  editSpecimens,
  createContainers,
  history,
  increaseCoordinate,
  loading,
}) {
  const specimenTab = (
    <SpecimenTab
      data={data}
      options={options}
      saveBatchEdit={saveBatchEdit}
      createPool={createPool}
      createSpecimens={createSpecimens}
      updateSpecimens={updateSpecimens}
      editSpecimens={editSpecimens}
      history={history}
      increaseCoordinate={increaseCoordinate}
      loading={loading}
    />
  );

  const containerTab = (
    <ContainerTab
      data={data}
      options={options}
      createContainers={createContainers}
      history={history}
      loading={loading}
    />
  );

  const poolTab = (
    <PoolTab
      data={data}
      options={options}
      createSpecimens={createSpecimens}
      increaseCoordinate={increaseCoordinate}
      loading={loading}
    />
  );

  const shipmentTab = <ShipmentTab data={data} options={options}/>;

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
