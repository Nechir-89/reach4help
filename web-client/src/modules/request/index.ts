import {
  ContainerOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  FileSyncOutlined,
} from '@ant-design/icons';
import { uniqueId } from 'lodash';
import Location from 'react-app-location';
import { MenuItem } from 'src/components/SideDrawerMenu/SideDrawerMenu';
import { Module } from 'src/types/module';

import ContentPage from './pages/ContentPage';

// TODO (remove link id): ask help to find a better way to keep track of ids
export const menuItems: Array<MenuItem> = [
  {
    id: uniqueId(),
    title: 'Find Requests',
    children: [
      {
        id: uniqueId(),
        icon: FileSearchOutlined,
        title: 'Open',
        location: new Location('/requests/open'),
      },
      {
        id: uniqueId(),
        icon: FileDoneOutlined,
        title: 'Accepted',
        location: new Location('/requests/accepted'),
      },
      {
        id: uniqueId(),
        icon: FileSyncOutlined,
        title: 'Ongoing',
        location: new Location('/requests/ongoing'),
      },
      {
        id: uniqueId(),
        icon: FileProtectOutlined,
        title: 'Finished',
        location: new Location('/requests/finished'),
      },
      {
        id: uniqueId(),
        icon: ContainerOutlined,
        title: 'Archived',
        children: [
          {
            id: uniqueId(),
            title: 'Rejected',
            location: new Location('/requests/archived?open'),
          },
          {
            id: uniqueId(),
            title: 'Canceled',
            location: new Location('/requests/archived?canceled'),
          },
          {
            id: uniqueId(),
            title: 'Closed',
            location: new Location('/requests/archived?closed'),
          },
          {
            id: uniqueId(),
            title: 'Completed',
            location: new Location('/requests/archived?completed'),
          },
        ],
      },
    ],
  },
];

const requestModule: Module = {
  path: '/requests',
  component: ContentPage,
  protected: true,
  layout: 'dashboard',
  menuItems,
};
export default requestModule;
