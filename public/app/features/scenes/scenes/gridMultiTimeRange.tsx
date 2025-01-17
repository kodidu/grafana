import {
  SceneGridRow,
  SceneTimePicker,
  SceneGridLayout,
  SceneTimeRange,
  SceneRefreshPicker,
  SceneGridItem,
  PanelBuilders,
} from '@grafana/scenes';
import { TestDataQueryType } from 'app/plugins/datasource/testdata/dataquery.gen';

import { DashboardScene } from '../../dashboard-scene/scene/DashboardScene';

import { getQueryRunnerWithRandomWalkQuery } from './queries';

export function getGridWithMultipleTimeRanges(): DashboardScene {
  const globalTimeRange = new SceneTimeRange();
  const row1TimeRange = new SceneTimeRange({
    from: 'now-1y',
    to: 'now',
  });

  return new DashboardScene({
    title: 'Grid with rows and different queries and time ranges',
    body: new SceneGridLayout({
      children: [
        new SceneGridRow({
          $timeRange: row1TimeRange,
          $data: getQueryRunnerWithRandomWalkQuery({ scenarioId: TestDataQueryType.RandomWalkTable }),
          title: 'Row A - has its own query, last year time range',
          key: 'Row A',
          isCollapsed: true,
          y: 0,
          children: [
            new SceneGridItem({
              x: 0,
              y: 1,
              width: 12,
              height: 5,
              isResizable: true,
              isDraggable: true,
              body: PanelBuilders.timeseries().setTitle('Row A Child1').build(),
            }),
            new SceneGridItem({
              x: 0,
              y: 5,
              width: 6,
              height: 5,
              isResizable: true,
              isDraggable: true,
              body: PanelBuilders.timeseries().setTitle('Row A Child2').build(),
            }),
          ],
        }),
        new SceneGridItem({
          x: 0,
          y: 12,
          width: 6,
          height: 10,
          isResizable: true,
          isDraggable: true,
          body: PanelBuilders.timeseries()
            .setTitle('Outsider, has its own query')
            .setData(getQueryRunnerWithRandomWalkQuery())
            .build(),
        }),
      ],
    }),
    $timeRange: globalTimeRange,
    $data: getQueryRunnerWithRandomWalkQuery(),
    actions: [new SceneTimePicker({}), new SceneRefreshPicker({})],
  });
}
